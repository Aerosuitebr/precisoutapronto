import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';

const SAFE_KEY = /^[a-z0-9][a-z0-9._:-]{1,79}$/;
const SESSION_KEY = /^[A-Za-z0-9._:-]{16,128}$/;

export function pseudonymizeRecommendationSession(value: string) {
  return `rec_session_${createHash('sha256').update(`precisoutapronto:recommendation:v1:${value}`).digest('hex')}`;
}

export function parseRecommendationExposure(value: unknown):
  { ok: true; data: { recommendationKey: string; targetToolKey: string; variant: string; rank: number } }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid-input' };
  const input = value as Record<string, unknown>;
  const allowed = new Set(['recommendationKey', 'targetToolKey', 'variant', 'rank']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { ok: false, error: 'unknown-field' };
  if (typeof input.recommendationKey !== 'string' || !SAFE_KEY.test(input.recommendationKey)) {
    return { ok: false, error: 'invalid-recommendation' };
  }
  if (typeof input.targetToolKey !== 'string' || !SAFE_KEY.test(input.targetToolKey)) {
    return { ok: false, error: 'invalid-target' };
  }
  const variant = input.variant === undefined ? 'default' : input.variant;
  if (typeof variant !== 'string' || !SAFE_KEY.test(variant) || variant.length > 48) {
    return { ok: false, error: 'invalid-variant' };
  }
  if (!Number.isInteger(input.rank) || Number(input.rank) < 1 || Number(input.rank) > 3) {
    return { ok: false, error: 'invalid-rank' };
  }
  return {
    ok: true,
    data: {
      recommendationKey: input.recommendationKey,
      targetToolKey: input.targetToolKey,
      variant,
      rank: input.rank as number
    }
  };
}

export function validAnonymousRecommendationSession(value: string) {
  return SESSION_KEY.test(value);
}

interface ExposureDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  persist: (exposure: Prisma.RecommendationExposureUncheckedCreateInput) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: ExposureDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  persist: async (exposure) => { await getPrisma().recommendationExposure.create({ data: exposure }); },
  uuid: randomUUID,
  now: () => new Date()
};

export async function createRecommendationExposure(
  subject: { userId?: string; sessionId?: string },
  input: unknown,
  dependencies: ExposureDependencies = defaultDependencies
) {
  try {
    const parsed = parseRecommendationExposure(input);
    const subjectId = subject.userId || subject.sessionId;
    if (!parsed.ok || !subjectId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('nba_v1', subjectId);
    if (!decision.enabled) return { enabled: false as const };
    const id = dependencies.uuid();
    const shownAt = dependencies.now();
    await dependencies.persist({
      id,
      userId: subject.userId || null,
      sessionId: subject.sessionId || null,
      recommendationKey: parsed.data.recommendationKey,
      targetToolKey: parsed.data.targetToolKey,
      variant: parsed.data.variant,
      rank: parsed.data.rank,
      shownAt
    });
    return { enabled: true as const, exposureId: id, shownAt: shownAt.toISOString() };
  } catch (error) {
    console.error('[recommendations] exposure create failed', { error });
    return null;
  }
}

interface ClickDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  markClicked: (input: {
    exposureId: string; userId?: string; sessionId?: string; clickedAt: Date;
  }) => Promise<'updated' | 'already-clicked' | 'not-found'>;
  now: () => Date;
}

const defaultClickDependencies: ClickDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  markClicked: async ({ exposureId, userId, sessionId, clickedAt }) => {
    const updated = await getPrisma().recommendationExposure.updateMany({
      where: {
        id: exposureId,
        ...(userId ? { userId } : { sessionId }),
        clickedAt: null
      },
      data: { clickedAt }
    });
    if (updated.count === 1) return 'updated';
    const exists = await getPrisma().recommendationExposure.findFirst({
      where: { id: exposureId, ...(userId ? { userId } : { sessionId }) }, select: { clickedAt: true }
    });
    return exists?.clickedAt ? 'already-clicked' : 'not-found';
  },
  now: () => new Date()
};

export async function clickRecommendationExposure(
  exposureId: string,
  subject: { userId?: string; sessionId?: string },
  dependencies: ClickDependencies = defaultClickDependencies
) {
  try {
    const subjectId = subject.userId || subject.sessionId;
    if (!exposureId || !subjectId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('nba_v1', subjectId);
    if (!decision.enabled) return { enabled: false as const };
    const clickedAt = dependencies.now();
    const state = await dependencies.markClicked({ exposureId, ...subject, clickedAt });
    if (state === 'not-found') return { enabled: true as const, notFound: true as const };
    return {
      enabled: true as const,
      notFound: false as const,
      alreadyClicked: state === 'already-clicked',
      ...(state === 'updated' ? { clickedAt: clickedAt.toISOString() } : {})
    };
  } catch (error) {
    console.error('[recommendations] exposure click failed', { exposureId, error });
    return null;
  }
}

interface CompleteDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  completeOwned: (input: {
    exposureId: string; completedTaskId: string; userId?: string; sessionId?: string;
  }) => Promise<'updated' | 'already-completed' | 'not-found' | 'target-mismatch'>;
}

const defaultCompleteDependencies: CompleteDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  completeOwned: ({ exposureId, completedTaskId, userId, sessionId }) => getPrisma().$transaction(async (tx) => {
    const exposure = await tx.recommendationExposure.findFirst({
      where: { id: exposureId, ...(userId ? { userId } : { sessionId }) },
      select: { targetToolKey: true, clickedAt: true, completedTaskId: true }
    });
    if (!exposure || !exposure.clickedAt) return 'not-found';
    if (exposure.completedTaskId) return 'already-completed';
    const task = await tx.task.findFirst({
      where: {
        id: completedTaskId,
        toolKey: exposure.targetToolKey,
        status: 'completed',
        ...(userId ? { userId } : { anonymousSessionId: sessionId })
      },
      select: { id: true }
    });
    if (!task) return 'target-mismatch';
    const updated = await tx.recommendationExposure.updateMany({
      where: { id: exposureId, completedTaskId: null },
      data: { completedTaskId: task.id }
    });
    return updated.count === 1 ? 'updated' : 'already-completed';
  })
};

/**
 * Writer interno: chamar somente após a conclusão canônica da task ter sido validada.
 */
export async function completeRecommendationExposure(
  exposureId: string,
  completedTaskId: string,
  subject: { userId?: string; sessionId?: string },
  dependencies: CompleteDependencies = defaultCompleteDependencies
) {
  try {
    const subjectId = subject.userId || subject.sessionId;
    if (!exposureId || !completedTaskId || !subjectId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('nba_v1', subjectId);
    if (!decision.enabled) return { enabled: false as const };
    const state = await dependencies.completeOwned({ exposureId, completedTaskId, ...subject });
    if (state === 'not-found') return { enabled: true as const, notFound: true as const };
    if (state === 'target-mismatch') return { enabled: true as const, targetMismatch: true as const };
    return {
      enabled: true as const,
      notFound: false as const,
      targetMismatch: false as const,
      alreadyCompleted: state === 'already-completed'
    };
  } catch (error) {
    console.error('[recommendations] exposure completion failed', { exposureId, completedTaskId, error });
    return null;
  }
}
