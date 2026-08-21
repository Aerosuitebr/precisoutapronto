import { expect, test } from '@playwright/test';
import { evaluateFeatureFlag, featureFlagBucket } from '../src/lib/experimentation/feature-flags';
import { validateProductEvent } from '../src/lib/events/product-events';
import { buildServerEventIdentity, emitServerProductEvent } from '../src/lib/events/server-emitter';
import { isInternalDashboardEmail } from '../src/lib/auth/internal-access';
import { parseFeatureFlagAdminPatch } from '../src/lib/experimentation/flag-admin';
import { featureFlagSubjectHash } from '../src/lib/experimentation/feature-flags';

const event = {
  eventId: '018f47a6-9d62-7c1d-8b31-1d8e0f962e37',
  eventName: 'task.completed',
  occurredAt: '2026-08-21T12:00:00.000Z',
  schemaVersion: 1,
  anonymousId: 'anon_123',
  sessionId: 'session_123',
  toolKey: 'orcamentos',
  properties: { duration_ms: 1200 }
};

test('feature flag bucketing is deterministic and defaults to off', () => {
  expect(featureFlagBucket('nba_v1', 'subject-1')).toBe(featureFlagBucket('nba_v1', 'subject-1'));
  expect(evaluateFeatureFlag(null, 'subject-1').enabled).toBe(false);
  expect(evaluateFeatureFlag({ key: 'nba_v1', enabled: false, rolloutPercent: 100 }, 'subject-1').enabled).toBe(false);
  expect(evaluateFeatureFlag({ key: 'nba_v1', enabled: true, rolloutPercent: 100 }, 'subject-1').enabled).toBe(true);
});

test('canonical event accepts safe aggregate properties', () => {
  const result = validateProductEvent(event, new Date('2026-08-21T12:01:00.000Z'));
  expect(result.ok).toBe(true);
});

test('canonical event rejects client-managed identity and PII', () => {
  expect(validateProductEvent(
    { ...event, userId: 'spoofed-user' },
    new Date('2026-08-21T12:01:00.000Z')
  ).ok).toBe(false);
  expect(validateProductEvent(
    { ...event, properties: { customer_email: 'cliente@example.com' } },
    new Date('2026-08-21T12:01:00.000Z')
  ).ok).toBe(false);
  expect(validateProductEvent(
    { ...event, properties: { label: 'cliente@example.com' } },
    new Date('2026-08-21T12:01:00.000Z')
  ).ok).toBe(false);
});

test('server emitter uses pseudonyms and remains off when the flag is disabled', async () => {
  const occurredAt = new Date('2026-08-21T12:00:00.000Z');
  const first = buildServerEventIdentity({ deviceId: 'device-secret', occurredAt });
  const second = buildServerEventIdentity({ deviceId: 'device-secret', occurredAt });
  expect(first).toEqual(second);
  expect(first.anonymousId).not.toContain('device-secret');

  let persisted = false;
  const emitted = await emitServerProductEvent(
    { eventName: 'task.completed', deviceId: 'device-secret', toolKey: 'orcamentos' },
    {
      decide: async () => ({ key: 'event_platform_v1', enabled: false, reason: 'disabled' }),
      persist: async () => { persisted = true; return { count: 1 }; },
      uuid: () => event.eventId,
      now: () => occurredAt
    }
  );
  expect(emitted).toBe(false);
  expect(persisted).toBe(false);
});

test('server emitter swallows persistence failures without changing the outcome', async () => {
  const emitted = await emitServerProductEvent(
    { eventName: 'task.completed', deviceId: 'device-secret', toolKey: 'orcamentos' },
    {
      decide: async () => ({ key: 'event_platform_v1', enabled: true, reason: 'enabled' }),
      persist: async () => { throw new Error('analytics unavailable'); },
      uuid: () => event.eventId,
      now: () => new Date('2026-08-21T12:00:00.000Z')
    }
  );
  expect(emitted).toBe(false);
});

test('internal analytics access preserves defaults and accepts configured emails', () => {
  expect(isInternalDashboardEmail('CONTATO@PRECISOUTAPRONTO.COM.BR', '')).toBe(true);
  expect(isInternalDashboardEmail('ops@example.com', 'admin@example.com, ops@example.com')).toBe(true);
  expect(isInternalDashboardEmail('visitor@example.com', 'admin@example.com')).toBe(false);
});

test('feature flag subject overrides use hashes and master enabled state', () => {
  const subject = 'internal-user-id';
  const hash = featureFlagSubjectHash(subject);
  expect(evaluateFeatureFlag({
    key: 'event_platform_v1', enabled: true, rolloutPercent: 0,
    rules: { includeSubjectHashes: [hash] }
  }, subject).reason).toBe('included');
  expect(evaluateFeatureFlag({
    key: 'event_platform_v1', enabled: true, rolloutPercent: 100,
    rules: { excludeSubjectHashes: [hash] }
  }, subject).reason).toBe('excluded');
  expect(evaluateFeatureFlag({
    key: 'event_platform_v1', enabled: false, rolloutPercent: 100,
    rules: { includeSubjectHashes: [hash] }
  }, subject).enabled).toBe(false);
});

test('feature flag admin patch rejects unsafe rollout rules', () => {
  const hash = featureFlagSubjectHash('internal-user-id');
  expect(parseFeatureFlagAdminPatch({ enabled: true, rolloutPercent: 5 }).ok).toBe(true);
  expect(parseFeatureFlagAdminPatch({ rolloutPercent: 101 }).ok).toBe(false);
  expect(parseFeatureFlagAdminPatch({ rules: { includeSubjectHashes: ['email@example.com'] } }).ok).toBe(false);
  expect(parseFeatureFlagAdminPatch({
    rules: { includeSubjectHashes: [hash], excludeSubjectHashes: [hash] }
  }).ok).toBe(false);
});
