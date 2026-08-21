import { createHash } from 'node:crypto';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

export interface FeatureFlagDefinition {
  key: string;
  enabled: boolean;
  rolloutPercent: number;
  rules?: unknown;
}

export interface FeatureFlagDecision {
  key: string;
  enabled: boolean;
  reason: 'enabled' | 'disabled' | 'rollout' | 'included' | 'excluded' | 'missing' | 'unavailable' | 'kill-switch';
  bucket?: number;
}

function normalizedRollout(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.trunc(value)));
}

export function featureFlagBucket(flagKey: string, subjectKey: string) {
  const digest = createHash('sha256').update(`${flagKey}:${subjectKey}`).digest();
  return digest.readUInt32BE(0) % 100;
}

export function featureFlagSubjectHash(subjectKey: string) {
  return createHash('sha256').update(subjectKey).digest('hex');
}

function subjectRules(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { includeSubjectHashes: [] as string[], excludeSubjectHashes: [] as string[] };
  }
  const rules = value as Record<string, unknown>;
  const hashes = (key: string) => Array.isArray(rules[key])
    ? rules[key].filter((item): item is string => typeof item === 'string')
    : [];
  return {
    includeSubjectHashes: hashes('includeSubjectHashes'),
    excludeSubjectHashes: hashes('excludeSubjectHashes')
  };
}

export function evaluateFeatureFlag(
  flag: FeatureFlagDefinition | null | undefined,
  subjectKey: string
): FeatureFlagDecision {
  if (!flag) return { key: 'unknown', enabled: false, reason: 'missing' };
  if (!flag.enabled) return { key: flag.key, enabled: false, reason: 'disabled' };
  const subjectHash = featureFlagSubjectHash(subjectKey);
  const rules = subjectRules(flag.rules);
  if (rules.excludeSubjectHashes.includes(subjectHash)) {
    return { key: flag.key, enabled: false, reason: 'excluded' };
  }
  if (rules.includeSubjectHashes.includes(subjectHash)) {
    return { key: flag.key, enabled: true, reason: 'included' };
  }
  const rollout = normalizedRollout(flag.rolloutPercent);
  if (rollout === 0) return { key: flag.key, enabled: false, reason: 'rollout', bucket: 0 };
  if (rollout === 100) return { key: flag.key, enabled: true, reason: 'enabled' };
  const bucket = featureFlagBucket(flag.key, subjectKey);
  return { key: flag.key, enabled: bucket < rollout, reason: 'rollout', bucket };
}

function isKilled(flagKey: string) {
  const killed = (process.env.FEATURE_KILL_SWITCHES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return killed.includes('*') || killed.includes(flagKey);
}

export async function getFeatureFlagDecision(flagKey: string, subjectKey: string) {
  if (isKilled(flagKey)) {
    return { key: flagKey, enabled: false, reason: 'kill-switch' } satisfies FeatureFlagDecision;
  }
  if (!isDatabaseConfigured()) {
    return { key: flagKey, enabled: false, reason: 'unavailable' } satisfies FeatureFlagDecision;
  }
  try {
    const flag = await getPrisma().featureFlag.findUnique({ where: { key: flagKey } });
    const decision = evaluateFeatureFlag(flag, subjectKey);
    return decision.key === 'unknown' ? { ...decision, key: flagKey } : decision;
  } catch (error) {
    console.error('[feature-flags] evaluation failed', { flagKey, error });
    return { key: flagKey, enabled: false, reason: 'unavailable' } satisfies FeatureFlagDecision;
  }
}
