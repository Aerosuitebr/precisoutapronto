import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { hashShareToken } from './share-links';

const TOKEN = /^[A-Za-z0-9_-]{32,128}$/;
const RECIPIENT_KEY = /^[A-Za-z0-9._:-]{16,128}$/;
const ACTIONS = new Set(['view', 'download', 'copy', 'use_template', 'sign_up']);

export function hashRecipientKey(value: string) {
  return `recipient_${createHash('sha256').update(`resolva-jato:recipient:v1:${value}`).digest('hex')}`;
}

export function parseShareEvent(value: unknown):
  { ok: true; data: { eventType: 'opened' | 'recipient_action'; recipientKey: string; action?: string } }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid-input' };
  const input = value as Record<string, unknown>;
  const allowed = new Set(['eventType', 'recipientKey', 'action']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { ok: false, error: 'unknown-field' };
  if (input.eventType !== 'opened' && input.eventType !== 'recipient_action') return { ok: false, error: 'invalid-event' };
  if (typeof input.recipientKey !== 'string' || !RECIPIENT_KEY.test(input.recipientKey)) {
    return { ok: false, error: 'invalid-recipient' };
  }
  if (input.eventType === 'recipient_action' && (typeof input.action !== 'string' || !ACTIONS.has(input.action))) {
    return { ok: false, error: 'invalid-action' };
  }
  if (input.eventType === 'opened' && input.action !== undefined) return { ok: false, error: 'unexpected-action' };
  return {
    ok: true,
    data: {
      eventType: input.eventType,
      recipientKey: input.recipientKey,
      ...(input.action ? { action: input.action as string } : {})
    }
  };
}

interface EventDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  findActive: (tokenHash: string, now: Date) => Promise<{ id: string } | null>;
  persist: (event: Prisma.ShareEventUncheckedCreateInput) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: EventDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  findActive: (tokenHash, now) => getPrisma().shareLink.findFirst({
    where: {
      tokenHash, revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
    },
    select: { id: true }
  }),
  persist: async (event) => { await getPrisma().shareEvent.create({ data: event }); },
  uuid: randomUUID,
  now: () => new Date()
};

export async function recordCanonicalShareEvent(
  token: string,
  input: unknown,
  userId?: string,
  dependencies: EventDependencies = defaultDependencies
) {
  try {
    const parsed = parseShareEvent(input);
    if (!parsed.ok || !TOKEN.test(token) || !dependencies.databaseConfigured()) return null;
    const tokenHash = hashShareToken(token);
    const decision = await dependencies.decide('share_attribution_v1', userId || tokenHash);
    if (!decision.enabled) return { enabled: false as const };
    const occurredAt = dependencies.now();
    const link = await dependencies.findActive(tokenHash, occurredAt);
    if (!link) return { enabled: true as const, unavailable: true as const };
    const id = dependencies.uuid();
    await dependencies.persist({
      id,
      shareLinkId: link.id,
      eventType: parsed.data.eventType,
      anonymousRecipientId: hashRecipientKey(parsed.data.recipientKey),
      userId: userId || null,
      occurredAt,
      metadata: (parsed.data.action ? { action: parsed.data.action } : {}) as Prisma.InputJsonValue
    });
    return { enabled: true as const, unavailable: false as const, eventId: id };
  } catch (error) {
    console.error('[distribution] share event failed', { error });
    return null;
  }
}
