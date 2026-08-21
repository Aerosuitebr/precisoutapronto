import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';

type Scalar = string | number | boolean | null;
const SAFE_KEY = /^[a-z0-9][a-z0-9._:-]{1,79}$/;
const OUTPUT_KEYS = new Set(['tool_key', 'confidence_band', 'fallback', 'reason_code', 'field_count']);
const SAFETY_KEYS = new Set(['blocked', 'policy', 'category_count', 'redacted']);

export function hashAiInput(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function sanitizeScalarRecord(value: unknown, keys: Set<string>, maxEntries: number) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > maxEntries) return null;
  const output: Record<string, Scalar> = {};
  for (const [key, item] of entries) {
    if (!keys.has(key)) return null;
    if (item !== null && !['string', 'number', 'boolean'].includes(typeof item)) return null;
    if (typeof item === 'string' && (!SAFE_KEY.test(item) || item.length > 80)) return null;
    if (typeof item === 'number' && !Number.isFinite(item)) return null;
    output[key] = item as Scalar;
  }
  return output;
}

export interface AiInteractionInput {
  capability: 'route' | 'prefill';
  modelKey: string;
  promptVersion: string;
  inputHash: string;
  output: Record<string, Scalar>;
  safety: Record<string, Scalar>;
  latencyMs: number;
  estimatedCost: number;
}

export function parseAiInteraction(value: unknown):
  { ok: true; data: AiInteractionInput } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid-input' };
  const input = value as Record<string, unknown>;
  const allowed = new Set([
    'capability', 'modelKey', 'promptVersion', 'inputHash', 'output', 'safety', 'latencyMs', 'estimatedCost'
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { ok: false, error: 'unknown-field' };
  if (input.capability !== 'route' && input.capability !== 'prefill') return { ok: false, error: 'invalid-capability' };
  for (const key of ['modelKey', 'promptVersion'] as const) {
    if (typeof input[key] !== 'string' || !SAFE_KEY.test(input[key] as string)) return { ok: false, error: `invalid-${key}` };
  }
  if (typeof input.inputHash !== 'string' || !/^[a-f0-9]{64}$/.test(input.inputHash)) return { ok: false, error: 'invalid-input-hash' };
  const output = sanitizeScalarRecord(input.output, OUTPUT_KEYS, 5);
  if (!output) return { ok: false, error: 'invalid-output' };
  const safety = sanitizeScalarRecord(input.safety, SAFETY_KEYS, 4);
  if (!safety) return { ok: false, error: 'invalid-safety' };
  if (!Number.isInteger(input.latencyMs) || Number(input.latencyMs) < 0 || Number(input.latencyMs) > 300_000) {
    return { ok: false, error: 'invalid-latency' };
  }
  if (typeof input.estimatedCost !== 'number' || !Number.isFinite(input.estimatedCost) || input.estimatedCost < 0 || input.estimatedCost > 100) {
    return { ok: false, error: 'invalid-cost' };
  }
  return {
    ok: true,
    data: {
      capability: input.capability,
      modelKey: input.modelKey as string,
      promptVersion: input.promptVersion as string,
      inputHash: input.inputHash,
      output,
      safety,
      latencyMs: input.latencyMs as number,
      estimatedCost: input.estimatedCost
    }
  };
}

interface InteractionDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  persist: (interaction: Prisma.AiInteractionUncheckedCreateInput) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: InteractionDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  persist: async (interaction) => { await getPrisma().aiInteraction.create({ data: interaction }); },
  uuid: randomUUID,
  now: () => new Date()
};

export async function recordAiInteraction(
  subject: { userId?: string; sessionId?: string },
  input: unknown,
  dependencies: InteractionDependencies = defaultDependencies
) {
  try {
    const parsed = parseAiInteraction(input);
    const subjectId = subject.userId || subject.sessionId;
    if (!parsed.ok || !subjectId || !dependencies.databaseConfigured()) return null;
    const flag = parsed.data.capability === 'route' ? 'ai_router_beta' : 'ai_prefill_beta';
    const decision = await dependencies.decide(flag, subjectId);
    if (!decision.enabled) return { enabled: false as const };
    const id = dependencies.uuid();
    const createdAt = dependencies.now();
    await dependencies.persist({
      id,
      userId: subject.userId || null,
      sessionId: subject.sessionId || null,
      capability: parsed.data.capability,
      modelKey: parsed.data.modelKey,
      promptVersion: parsed.data.promptVersion,
      inputHash: parsed.data.inputHash,
      outputJson: parsed.data.output as Prisma.InputJsonValue,
      safetyResult: parsed.data.safety as Prisma.InputJsonValue,
      latencyMs: parsed.data.latencyMs,
      estimatedCost: parsed.data.estimatedCost,
      accepted: null,
      createdAt
    });
    return { enabled: true as const, interactionId: id, createdAt: createdAt.toISOString() };
  } catch (error) {
    console.error('[ai-gateway] interaction record failed', { error });
    return null;
  }
}
