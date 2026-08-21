import { expect, test } from '@playwright/test';
import { evaluateFeatureFlag, featureFlagBucket } from '../src/lib/experimentation/feature-flags';
import { validateProductEvent } from '../src/lib/events/product-events';
import { buildServerEventIdentity, emitServerProductEvent } from '../src/lib/events/server-emitter';
import { isInternalDashboardEmail } from '../src/lib/auth/internal-access';
import { parseFeatureFlagAdminPatch } from '../src/lib/experimentation/flag-admin';
import { featureFlagSubjectHash } from '../src/lib/experimentation/feature-flags';
import {
  chooseExperimentVariant,
  getOrCreateExperimentAssignment,
  resolveGatedExperiment
} from '../src/lib/experimentation/experiment-assignments';
import { recordPresentedExperimentExposure } from '../src/lib/experimentation/experiment-exposure';
import {
  experimentAssignmentAggregates,
  experimentObservabilityDays
} from '../src/lib/experimentation/observability';
import {
  productEventRetentionCutoff,
  productEventRetentionDays
} from '../src/lib/events/retention';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  isSafeIntentKey,
  parseIntentEdgeRule,
  parseIntentTransferSchema
} from '../src/lib/intent-graph/contracts';
import { parseIntentEdgeAdminPatch } from '../src/lib/intent-graph/admin';

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

test('experiment assignment is deterministic and validates its definition', () => {
  const definition = {
    experimentKey: 'quote_next_action_v1',
    subjectKey: 'internal-user-id',
    variants: [{ key: 'control', weight: 50 }, { key: 'treatment', weight: 50 }]
  };
  expect(chooseExperimentVariant(definition)).toBe(chooseExperimentVariant(definition));
  expect(chooseExperimentVariant({ ...definition, variants: [{ key: 'control', weight: 100 }] })).toBeNull();
  expect(chooseExperimentVariant({ ...definition, variants: [
    { key: 'control', weight: 50 }, { key: 'control', weight: 50 }
  ] })).toBeNull();
});

test('persisted experiment assignment pseudonymizes the subject and fails closed', async () => {
  let persistedSubject = '';
  const input = {
    experimentKey: 'quote_next_action_v1',
    subjectKey: 'raw-internal-user-id',
    variants: [{ key: 'control', weight: 1 }, { key: 'treatment', weight: 1 }]
  };
  const assigned = await getOrCreateExperimentAssignment(input, {
    configured: () => true,
    persist: async (assignment) => {
      persistedSubject = assignment.subjectKey;
      return { variant: assignment.variant };
    }
  });
  expect(assigned).not.toBeNull();
  expect(persistedSubject).toMatch(/^[a-f0-9]{64}$/);
  expect(persistedSubject).not.toContain(input.subjectKey);

  const unavailable = await getOrCreateExperimentAssignment(input, {
    configured: () => false,
    persist: async () => { throw new Error('must not run'); }
  });
  expect(unavailable).toBeNull();
});

test('experiment exposure is emitted only for a confirmed safe presentation', async () => {
  let emitted: Parameters<typeof emitServerProductEvent>[0] | null = null;
  const result = await recordPresentedExperimentExposure({
    presented: true,
    experimentKey: 'quote_next_action_v1',
    variant: 'treatment',
    deviceId: 'device-secret',
    toolKey: 'orcamentos'
  }, {
    emit: async (input) => { emitted = input; return true; }
  });
  expect(result).toBe(true);
  expect(emitted).toMatchObject({
    eventName: 'experiment.exposed',
    properties: {
      experiment_key: 'quote_next_action_v1',
      variant: 'treatment',
      assignment_source: 'stable'
    }
  });

  const rejected = await recordPresentedExperimentExposure({
    presented: true,
    experimentKey: 'unsafe experiment',
    variant: 'control',
    deviceId: 'device-secret'
  }, {
    emit: async () => { throw new Error('must not run'); }
  });
  expect(rejected).toBe(false);
});

test('gated experiment returns control without creating assignment while disabled', async () => {
  let assignmentCalls = 0;
  const input = {
    flagKey: 'nba_v1',
    experimentKey: 'quote_next_action_v1',
    controlVariant: 'control',
    subjectKey: 'internal-user-id',
    variants: [{ key: 'control', weight: 50 }, { key: 'treatment', weight: 50 }]
  };
  const disabled = await resolveGatedExperiment(input, {
    decide: async () => ({ key: 'nba_v1', enabled: false, reason: 'disabled' }),
    assign: async () => { assignmentCalls += 1; return 'treatment'; }
  });
  expect(disabled).toEqual({ variant: 'control', active: false, reason: 'flag-disabled' });
  expect(assignmentCalls).toBe(0);

  const enabled = await resolveGatedExperiment(input, {
    decide: async () => ({ key: 'nba_v1', enabled: true, reason: 'enabled' }),
    assign: async () => { assignmentCalls += 1; return 'treatment'; }
  });
  expect(enabled).toEqual({ variant: 'treatment', active: true, reason: 'assigned' });
  expect(assignmentCalls).toBe(1);
});

test('experiment observability exposes aggregates without subject identifiers', () => {
  expect(experimentObservabilityDays('30')).toBe(30);
  expect(experimentObservabilityDays('365')).toBe(7);
  const aggregates = experimentAssignmentAggregates([{
    experimentKey: 'quote_next_action_v1',
    variant: 'control',
    _count: { _all: 12 }
  }]);
  expect(aggregates).toEqual([{
    experimentKey: 'quote_next_action_v1', variant: 'control', count: 12
  }]);
  expect(JSON.stringify(aggregates)).not.toContain('subject');
});

test('product event retention policy is bounded and read-only by default', () => {
  expect(productEventRetentionDays('120')).toBe(120);
  expect(productEventRetentionDays('29')).toBe(90);
  expect(productEventRetentionDays('731')).toBe(90);
  expect(productEventRetentionDays('invalid')).toBe(90);
  expect(productEventRetentionCutoff(new Date('2026-08-21T00:00:00.000Z'), '30').toISOString())
    .toBe('2026-07-22T00:00:00.000Z');
});

test('V003 intent graph migration is additive, idempotent and covers P0 tools', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821140000_add_intent_graph', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain('CREATE TABLE "intent_nodes"');
  expect(migration).toContain('CREATE TABLE "intent_edges"');
  expect(migration).toContain('ON CONFLICT ("key") DO NOTHING');
  expect(migration).toContain('ON CONFLICT ("fromNodeId", "toNodeId", "relationType") DO NOTHING');
  for (const tool of ['orcamentos', 'recibos', 'pix', 'contratos', 'propostas', 'precificacao', 'agenda']) {
    expect(migration).toContain(`'${tool}', 'tool'`);
  }
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|RENAME)\b/i);
});

test('intent graph contracts reject unknown rules and unsafe transfer fields', () => {
  expect(isSafeIntentKey('orcamentos')).toBe(true);
  expect(isSafeIntentKey('../orcamentos')).toBe(false);
  expect(parseIntentTransferSchema({ version: 1, fields: ['amount', 'description', 'amount'] }))
    .toEqual({ version: 1, fields: ['amount', 'description'] });
  expect(parseIntentTransferSchema({ version: 1, fields: ['customer.email'] })).toBeNull();
  expect(parseIntentTransferSchema({ version: 1, fields: [], copyAll: true })).toBeNull();
  expect(parseIntentEdgeRule({ requiresOutcome: 'completed' })).toEqual({ requiresOutcome: 'completed' });
  expect(parseIntentEdgeRule({ requiresOutcome: 'started' })).toBeNull();
  expect(parseIntentEdgeRule({ allowPrivateData: true })).toBeNull();
});

test('intent edge administration accepts bounded patches only', () => {
  expect(parseIntentEdgeAdminPatch({ active: false, weight: 0.725 })).toEqual({
    ok: true, patch: { active: false, weight: 0.725 }
  });
  expect(parseIntentEdgeAdminPatch({ weight: 1.001 }).ok).toBe(false);
  expect(parseIntentEdgeAdminPatch({ weight: 0.1234 }).ok).toBe(false);
  expect(parseIntentEdgeAdminPatch({ delete: true }).ok).toBe(false);
  expect(parseIntentEdgeAdminPatch({ transferSchema: { version: 1, fields: ['customer.email'] } }).ok)
    .toBe(false);
});
