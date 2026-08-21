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
import { parseIntentEdgeAdminPatch, parseIntentNodeAdminPatch } from '../src/lib/intent-graph/admin';
import { getGatedRankedNextActions, rankIntentEdges } from '../src/lib/recommendation/ranker';
import {
  createNextActionTrackingToken,
  readNextActionTrackingToken
} from '../src/lib/recommendation/tracking-token';
import { recommendationEventId, recordRecommendationInteraction } from '../src/lib/recommendation/events';
import {
  recommendationMetrics,
  recommendationObservabilityDays,
  recommendationRolloutReadiness
} from '../src/lib/recommendation/observability';

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

test('intent node administration preserves identity and rejects unsafe text', () => {
  expect(parseIntentNodeAdminPatch({
    active: true,
    label: ' Orçamentos ',
    frequencyClass: 'high',
    riskLevel: 'low'
  })).toEqual({
    ok: true,
    patch: { active: true, label: 'Orçamentos', frequencyClass: 'high', riskLevel: 'low' }
  });
  expect(parseIntentNodeAdminPatch({ key: 'new-key' }).ok).toBe(false);
  expect(parseIntentNodeAdminPatch({ type: 'outcome' }).ok).toBe(false);
  expect(parseIntentNodeAdminPatch({ label: '<script>alert(1)</script>' }).ok).toBe(false);
  expect(parseIntentNodeAdminPatch({ riskLevel: 'critical' }).ok).toBe(false);
});

test('NBA rule ranking filters eligibility and returns at most three safe actions', () => {
  const action = (key: string, weight: number, riskLevel = 'low') => ({
    relationType: 'next_action',
    weight,
    transferSchema: { version: 1 as const, fields: [] },
    rule: { requiresOutcome: 'completed' as const },
    target: { key, label: key, riskLevel }
  });
  const ranked = rankIntentEdges({
    sourceToolKey: 'orcamentos',
    outcomeStatus: 'completed',
    maximumRiskLevel: 'medium',
    edges: [
      action('pix', 0.8), action('recibos', 0.9), action('propostas', 0.6),
      action('agenda', 0.5), action('contratos', 1, 'high')
    ],
    resolveTool: (key) => ({ href: `/ferramentas/${key}`, status: 'available' })
  });
  expect(ranked.map((item) => item.targetToolKey)).toEqual(['recibos', 'pix', 'propostas']);
  expect(ranked.map((item) => item.rank)).toEqual([1, 2, 3]);
  expect(ranked.every((item) => item.targetUrl.startsWith('/'))).toBe(true);
});

test('NBA remains empty and does not read the graph while its flag is disabled', async () => {
  let graphCalls = 0;
  const actions = await getGatedRankedNextActions({
    sourceToolKey: 'orcamentos', subjectKey: 'subject-1', outcomeStatus: 'completed'
  }, {
    decide: async () => ({ key: 'nba_v1', enabled: false, reason: 'disabled' }),
    graph: async () => { graphCalls += 1; return []; }
  });
  expect(actions).toEqual([]);
  expect(graphCalls).toBe(0);
});

test('next action tracking token is signed, bounded and tamper evident', () => {
  const secret = 'a'.repeat(32);
  const issuedAt = Date.parse('2026-08-21T12:00:00.000Z');
  const token = createNextActionTrackingToken({
    sourceToolKey: 'orcamentos',
    targetToolKey: 'recibos',
    variant: 'rules_v1',
    rank: 1,
    issuedAt
  }, secret);
  expect(token).not.toBeNull();
  expect(readNextActionTrackingToken(token!, secret, issuedAt + 60_000)).toMatchObject({
    sourceToolKey: 'orcamentos', targetToolKey: 'recibos', variant: 'rules_v1', rank: 1
  });
  expect(readNextActionTrackingToken(`${token}tampered`, secret, issuedAt + 60_000)).toBeNull();
  expect(readNextActionTrackingToken(token!, secret, issuedAt + 86_400_001)).toBeNull();
  expect(createNextActionTrackingToken({
    sourceToolKey: 'orcamentos', targetToolKey: 'recibos', variant: 'rules_v1', rank: 1, issuedAt
  }, 'short')).toBeNull();
});

test('recommendation interactions use deterministic IDs and safe properties', async () => {
  const token = 'signed-token';
  let emitted: Parameters<typeof emitServerProductEvent>[0] | null = null;
  const accepted = await recordRecommendationInteraction({
    trackingToken: token,
    interaction: 'shown',
    deviceId: 'device-secret'
  }, {
    readToken: () => ({
      sourceToolKey: 'orcamentos', targetToolKey: 'recibos', variant: 'rules_v1', rank: 1, issuedAt: Date.now()
    }),
    emit: async (input) => { emitted = input; return true; }
  });
  expect(accepted).toBe(true);
  expect(emitted).toMatchObject({
    eventName: 'recommendation.shown',
    toolKey: 'orcamentos',
    properties: {
      recommendation_key: 'orcamentos.recibos', target_tool_key: 'recibos', variant: 'rules_v1', rank: 1
    }
  });
  expect(recommendationEventId(token, 'shown')).toBe(recommendationEventId(token, 'shown'));
  expect(recommendationEventId(token, 'shown')).not.toBe(recommendationEventId(token, 'clicked'));
});

test('quote NBA panel is additive and records exposure only after actions exist', () => {
  const panel = readFileSync(path.join(
    process.cwd(), 'src', 'components', 'recommendation', 'next-actions-panel.tsx'
  ), 'utf8');
  const quote = readFileSync(path.join(
    process.cwd(), 'src', 'components', 'orcamentos', 'orcamentos-app.tsx'
  ), 'utf8');
  expect(panel).toContain("if (!actions.length) return null");
  expect(panel).toContain("recordInteraction(action.trackingToken, 'shown')");
  expect(panel).toContain("recordInteraction(action.trackingToken, 'clicked')");
  expect(panel).toContain('Seu orçamento continuará salvo.');
  expect(quote).toContain('<NextActionsPanel sourceToolKey="orcamentos" active={Boolean(generated)} />');
});

test('recommendation observability calculates aggregate rates without identifiers', () => {
  expect(recommendationObservabilityDays('30')).toBe(30);
  expect(recommendationObservabilityDays('90')).toBe(7);
  const metrics = recommendationMetrics([
    { eventName: 'recommendation.shown', _count: { _all: 100 } },
    { eventName: 'recommendation.clicked', _count: { _all: 25 } },
    { eventName: 'recommendation.completed', _count: { _all: 10 } }
  ]);
  expect(metrics).toEqual({
    shown: 100,
    clicked: 25,
    completed: 10,
    clickThroughRate: 25,
    completionRate: 10,
    clickToCompletionRate: 40
  });
  expect(recommendationMetrics([]).clickThroughRate).toBe(0);
  expect(JSON.stringify(metrics)).not.toMatch(/subject|token|user/i);
});

test('recommendation completion is accepted only by the signed target tool', async () => {
  let calls = 0;
  const dependencies = {
    readToken: () => ({
      sourceToolKey: 'orcamentos', targetToolKey: 'recibos', variant: 'rules_v1', rank: 1, issuedAt: Date.now()
    }),
    emit: async () => { calls += 1; return true; }
  };
  expect(await recordRecommendationInteraction({
    trackingToken: 'signed', interaction: 'completed', deviceId: 'device', currentToolKey: 'pix'
  }, dependencies)).toBe(false);
  expect(calls).toBe(0);
  expect(await recordRecommendationInteraction({
    trackingToken: 'signed', interaction: 'completed', deviceId: 'device', currentToolKey: 'recibos'
  }, dependencies)).toBe(true);
  expect(calls).toBe(1);

  const receipt = readFileSync(path.join(
    process.cwd(), 'src', 'components', 'recibos', 'recibos-app.tsx'
  ), 'utf8');
  expect(receipt).toContain("useRecommendationAttribution('recibos')");
  expect(receipt).toContain("completeRecommendationAttribution('recibos')");
});

test('NBA rollout readiness fails closed with explicit blockers', () => {
  expect(recommendationRolloutReadiness({
    trackingSecretConfigured: false,
    nbaFlagEnabled: false,
    eventPlatformEnabled: false,
    killSwitchActive: true,
    activeEdges: 0
  })).toEqual({
    ready: false,
    blockers: [
      'tracking-secret-missing',
      'nba-flag-disabled',
      'event-platform-disabled',
      'kill-switch-active',
      'no-active-edges'
    ]
  });
  expect(recommendationRolloutReadiness({
    trackingSecretConfigured: true,
    nbaFlagEnabled: true,
    eventPlatformEnabled: true,
    killSwitchActive: false,
    activeEdges: 1
  })).toEqual({ ready: true, blockers: [] });
});

test('V004 task and artifact migration is additive and preserves legacy storage', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821150000_add_task_artifact', 'migration.sql'
  ), 'utf8');
  const schema = readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');

  expect(migration).toContain('CREATE TABLE "tasks"');
  expect(migration).toContain('CREATE TABLE "artifacts"');
  expect(migration).toContain('CREATE TABLE "artifact_relations"');
  expect(migration).toContain('ON DELETE RESTRICT');
  expect(migration).toContain('ON DELETE SET NULL');
  expect(migration).toContain('CHECK ("visibility" IN (\'private\', \'unlisted\', \'public\'))');
  expect(migration).toContain('CHECK ("version" >= 1)');
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|RENAME)\b/i);
  expect(migration).not.toContain('ALTER TABLE "tool_documents"');
  expect(schema).toContain('model ToolDocument {');
  expect(schema).toContain('model Task {');
  expect(schema).toContain('model Artifact {');
  expect(schema).toContain('model ArtifactRelation {');
});
