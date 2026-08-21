import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

const TARGET_TYPES = new Set(['tool', 'article', 'recommendation', 'artifact']);
const RATINGS = new Set(['resolved', 'partial', 'not_resolved']);
const SAFE_ID = /^[A-Za-z0-9._:-]{1,128}$/;
const ANONYMOUS_KEY = /^[A-Za-z0-9._:-]{16,128}$/;

export function redactFeedbackPii(value: string) {
  return value
    .replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/gi, '[email-redacted]')
    .replace(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9?\d{4})[-\s]?\d{4}\b/g, '[phone-redacted]')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[tax-id-redacted]')
    .replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[tax-id-redacted]');
}

export function pseudonymizeFeedbackIdentity(value: string) {
  return `feedback_${createHash('sha256').update(`resolva-jato:feedback:v1:${value}`).digest('hex')}`;
}

export function validFeedbackAnonymousKey(value: string) {
  return ANONYMOUS_KEY.test(value);
}

export function parseHelpfulnessFeedback(value: unknown):
  { ok: true; data: { targetType: string; targetId: string; rating: string; detail?: string } }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid-input' };
  const input = value as Record<string, unknown>;
  const allowed = new Set(['targetType', 'targetId', 'rating', 'detail']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { ok: false, error: 'unknown-field' };
  if (typeof input.targetType !== 'string' || !TARGET_TYPES.has(input.targetType)) return { ok: false, error: 'invalid-target-type' };
  if (typeof input.targetId !== 'string' || !SAFE_ID.test(input.targetId)) return { ok: false, error: 'invalid-target-id' };
  if (typeof input.rating !== 'string' || !RATINGS.has(input.rating)) return { ok: false, error: 'invalid-rating' };
  if (input.detail !== undefined && (typeof input.detail !== 'string' || input.detail.trim().length > 1000)) {
    return { ok: false, error: 'invalid-detail' };
  }
  const detail = typeof input.detail === 'string' ? redactFeedbackPii(input.detail.trim()) : '';
  return {
    ok: true,
    data: {
      targetType: input.targetType,
      targetId: input.targetId,
      rating: input.rating,
      ...(detail ? { detail } : {})
    }
  };
}

interface FeedbackDependencies {
  databaseConfigured: () => boolean;
  persist: (feedback: Prisma.HelpfulnessFeedbackUncheckedCreateInput) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: FeedbackDependencies = {
  databaseConfigured: isDatabaseConfigured,
  persist: async (feedback) => { await getPrisma().helpfulnessFeedback.create({ data: feedback }); },
  uuid: randomUUID,
  now: () => new Date()
};

export async function createHelpfulnessFeedback(
  identity: { userId?: string; anonymousId: string },
  input: unknown,
  dependencies: FeedbackDependencies = defaultDependencies
) {
  try {
    const parsed = parseHelpfulnessFeedback(input);
    if (!parsed.ok || !identity.anonymousId || !dependencies.databaseConfigured()) return null;
    const id = dependencies.uuid();
    const createdAt = dependencies.now();
    await dependencies.persist({
      id,
      userId: identity.userId || null,
      anonymousId: identity.anonymousId,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      rating: parsed.data.rating,
      detail: parsed.data.detail || null,
      createdAt
    });
    return { feedbackId: id, createdAt: createdAt.toISOString() };
  } catch (error) {
    console.error('[feedback] helpfulness create failed', { error });
    return null;
  }
}
