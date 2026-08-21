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
import { parseCanonicalArtifactWrite } from '../src/lib/artifacts/contracts';
import { canonicalShadowIds, writeCanonicalArtifactShadow } from '../src/lib/artifacts/writer';
import {
  artifactObservabilityDays,
  artifactRolloutReadiness,
  artifactShadowMetrics
} from '../src/lib/artifacts/observability';
import { canonicalHistoryLimit, listCanonicalHistory } from '../src/lib/artifacts/history';
import { decryptContextValue, encryptContextValue } from '../src/lib/context/encryption';
import {
  createEnvironmentContextKeyProvider,
  type ContextKeyProvider
} from '../src/lib/context/key-provider';
import { CONTEXT_CONSENT_VERSION, parseBusinessContextWrite } from '../src/lib/context/contracts';
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

test('canonical artifact contract rejects PII and requires a subject', () => {
  expect(parseCanonicalArtifactWrite({ toolKey: 'orcamentos', artifactType: 'quote' }).ok).toBe(false);
  expect(parseCanonicalArtifactWrite({
    anonymousSessionId: 'anon-session', toolKey: 'orcamentos', artifactType: 'quote', summary: { cliente_nome: 'Ana' }
  })).toEqual({ ok: false, error: 'unsafe-summary-key' });
  expect(parseCanonicalArtifactWrite({
    anonymousSessionId: 'anon-session', toolKey: 'orcamentos', artifactType: 'quote',
    legacyArtifactId: 'legacy-1', summary: { total_items: 2, outcome: 'share_link' }
  }).ok).toBe(true);
});

test('canonical artifact shadow writer is gated, transactional and payload-free', async () => {
  let persisted: unknown = null;
  const base = {
    databaseConfigured: () => true,
    persist: async (records: unknown) => { persisted = records; },
    uuid: (() => { let value = 0; return () => `00000000-0000-4000-8000-00000000000${++value}`; })(),
    now: () => new Date('2026-08-21T15:00:00.000Z')
  };
  const input = {
    anonymousSessionId: 'anon-session', toolKey: 'orcamentos', artifactType: 'quote',
    legacyArtifactId: 'legacy-1', summary: { total_items: 2 }
  };
  expect(await writeCanonicalArtifactShadow(input, {
    ...base, decide: async () => ({ key: 'artifact_shadow_write_v1', enabled: false, reason: 'disabled' as const })
  })).toBeNull();
  expect(persisted).toBeNull();

  expect(await writeCanonicalArtifactShadow(input, {
    ...base, decide: async () => ({ key: 'artifact_shadow_write_v1', enabled: true, reason: 'enabled' as const })
  })).toEqual({
    taskId: '00000000-0000-4000-8000-000000000001',
    artifactId: '00000000-0000-4000-8000-000000000002'
  });
  expect(persisted).toMatchObject({
    task: { toolKey: 'orcamentos', status: 'completed' },
    artifact: {
      toolKey: 'orcamentos', payloadJson: {},
      summaryJson: { total_items: 2, legacy_artifact_id: 'legacy-1' }
    }
  });
});

test('quote canonical pilot runs only after legacy persistence and keeps the response unchanged', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'orcamentos', 'route.ts'
  ), 'utf8');
  const legacyCreate = route.indexOf('prisma.orcamento.create');
  const shadowWrite = route.indexOf('writeCanonicalArtifactShadow({');
  const response = route.indexOf('return NextResponse.json({', shadowWrite);

  expect(legacyCreate).toBeGreaterThan(-1);
  expect(shadowWrite).toBeGreaterThan(legacyCreate);
  expect(response).toBeGreaterThan(shadowWrite);
  expect(route).toContain("artifactType: 'quote'");
  expect(route).toContain('total_items: validated.data.itens.length');
  expect(route).toContain('anonymousSessionId = deviceId');
  expect(route).not.toContain('payloadJson: validated.data');
});

test('artifact observability exposes aggregate coverage and explicit blockers', () => {
  expect(artifactObservabilityDays('30')).toBe(30);
  expect(artifactObservabilityDays('90')).toBe(7);
  const metrics = artifactShadowMetrics({
    legacyCreated: 20,
    tasksCreated: 5,
    artifactsCreated: 4,
    tasksWithoutArtifact: 1
  });
  expect(metrics).toEqual({
    legacyCreated: 20,
    tasksCreated: 5,
    artifactsCreated: 4,
    tasksWithoutArtifact: 1,
    coveragePercent: 20,
    taskArtifactDelta: 1
  });
  expect(artifactRolloutReadiness({
    writeFlagEnabled: false,
    killSwitchActive: true,
    tasksWithoutArtifact: 1,
    taskArtifactDelta: 1
  }).blockers).toEqual([
    'artifact-shadow-write-flag-disabled',
    'kill-switch-active',
    'orphan-tasks-detected',
    'task-artifact-count-mismatch'
  ]);
});

test('artifact analytics route never selects payloads, summaries or identifiers', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'analytics', 'artifacts', 'route.ts'
  ), 'utf8');
  expect(route).toContain("isInternalDashboardEmail(session.email)");
  expect(route).not.toMatch(/select:\s*\{[^}]*?(payloadJson|summaryJson|userId|anonymousSessionId|publicId)/s);
  expect(route).toContain('Aggregates only');
});

test('canonical history fails closed and never queries while its flag is disabled', async () => {
  let reads = 0;
  expect(canonicalHistoryLimit('50')).toBe(50);
  expect(canonicalHistoryLimit('500')).toBe(20);
  const result = await listCanonicalHistory('user-1', 20, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'smart_history_v1', enabled: false, reason: 'disabled' as const }),
    find: async () => { reads += 1; return []; }
  });
  expect(result).toEqual({ enabled: false, items: [] });
  expect(reads).toBe(0);
});

test('canonical history selects metadata but never artifact payloads', () => {
  const history = readFileSync(path.join(process.cwd(), 'src', 'lib', 'artifacts', 'history.ts'), 'utf8');
  const legacyRoute = readFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'documents', 'route.ts'), 'utf8');
  expect(history).toContain('summaryJson: true');
  expect(history).not.toContain('payloadJson: true');
  expect(legacyRoute).not.toContain('listCanonicalHistory');
});

test('smart history panel is additive and invisible without enabled items', () => {
  const panel = readFileSync(path.join(
    process.cwd(), 'src', 'components', 'account', 'smart-history-panel.tsx'
  ), 'utf8');
  const account = readFileSync(path.join(
    process.cwd(), 'src', 'app', '(app)', 'conta', 'page.tsx'
  ), 'utf8');
  expect(panel).toContain('if (!history?.enabled || items.length === 0) return null');
  expect(panel).toContain("fetch('/api/v1/artifacts/history?limit=10'");
  expect(panel).not.toContain('payloadJson');
  expect(account.indexOf('<SmartHistoryPanel />')).toBeGreaterThan(account.indexOf('<RecentDocumentsPanel />'));
});

test('canonical shadow IDs are stable per legacy artifact and isolated by tool', () => {
  const first = canonicalShadowIds('orcamentos', 'legacy-1');
  expect(canonicalShadowIds('orcamentos', 'legacy-1')).toEqual(first);
  expect(canonicalShadowIds('recibos', 'legacy-1')).not.toEqual(first);
  expect(first.taskId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

  const writer = readFileSync(path.join(process.cwd(), 'src', 'lib', 'artifacts', 'writer.ts'), 'utf8');
  expect(writer).toContain('task.upsert');
  expect(writer).toContain('artifact.upsert');
  expect(writer).toContain('update: {}');
});

test('artifact write and smart history read have independent disabled flags', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821151000_add_artifact_shadow_flag', 'migration.sql'
  ), 'utf8');
  const writer = readFileSync(path.join(process.cwd(), 'src', 'lib', 'artifacts', 'writer.ts'), 'utf8');
  const history = readFileSync(path.join(process.cwd(), 'src', 'lib', 'artifacts', 'history.ts'), 'utf8');
  expect(migration).toContain("'artifact_shadow_write_v1'");
  expect(migration).toContain('false, 0');
  expect(migration).toContain('ON CONFLICT ("key") DO NOTHING');
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|DELETE)\b/i);
  expect(writer).toContain("decide('artifact_shadow_write_v1'");
  expect(history).toContain("decide('smart_history_v1'");
});

test('V005 context migration is additive, encrypted at rest and performs no backfill', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821160000_add_context_profile', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain('CREATE TABLE "user_business_profiles"');
  expect(migration).toContain('CREATE TABLE "customers"');
  for (const field of ['legalName', 'taxIdEncrypted', 'email', 'phone', 'addressJson']) {
    expect(migration).toContain(`"${field}" BYTEA`);
  }
  expect(migration).toContain('"pixJson" BYTEA');
  expect(migration).toContain('"encryptionKeyVersion" VARCHAR(32)');
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|RENAME|INSERT INTO|UPDATE|DELETE FROM)\b/i);
  expect(migration).not.toContain('ALTER TABLE "users"');
  expect(migration).not.toContain('ON DELETE CASCADE');
});

test('context encryption round-trips only with the same authenticated scope', () => {
  const key = Buffer.alloc(32, 7);
  const provider: ContextKeyProvider = {
    active: () => ({ version: 'v1', key }),
    byVersion: (version) => version === 'v1' ? { version, key } : null
  };
  const scope = {
    entity: 'customer' as const,
    recordId: 'record-1',
    ownerUserId: 'user-1',
    field: 'email'
  };
  const encrypted = encryptContextValue('cliente@example.com', scope, provider);
  expect(encrypted?.keyVersion).toBe('v1');
  expect(encrypted?.ciphertext.toString('utf8')).not.toContain('cliente@example.com');
  expect(decryptContextValue(encrypted!.ciphertext, 'v1', scope, provider)).toBe('cliente@example.com');
  expect(decryptContextValue(encrypted!.ciphertext, 'v1', { ...scope, ownerUserId: 'user-2' }, provider)).toBeNull();
});

test('context encryption fails closed for missing keys and tampered envelopes', () => {
  const unavailable: ContextKeyProvider = { active: () => null, byVersion: () => null };
  const scope = {
    entity: 'user_business_profile' as const,
    recordId: 'record-1', ownerUserId: 'user-1', field: 'phone'
  };
  expect(encryptContextValue('11999999999', scope, unavailable)).toBeNull();

  const key = Buffer.alloc(32, 9);
  const provider: ContextKeyProvider = {
    active: () => ({ version: 'v1', key }),
    byVersion: () => ({ version: 'v1', key })
  };
  const encrypted = encryptContextValue('11999999999', scope, provider)!;
  const tampered = Buffer.from(encrypted.ciphertext);
  tampered[tampered.length - 1] ^= 1;
  expect(decryptContextValue(tampered, 'v1', scope, provider)).toBeNull();
  expect(decryptContextValue(encrypted.ciphertext, 'v2', scope, unavailable)).toBeNull();
});

test('context keyring rotates writes while retaining old versions for reads', () => {
  const oldKey = Buffer.alloc(32, 1).toString('base64');
  const newKey = Buffer.alloc(32, 2).toString('base64');
  const provider = createEnvironmentContextKeyProvider({
    CONTEXT_ENCRYPTION_KEYS_JSON: JSON.stringify({ '2026-01': oldKey, '2026-08': newKey }),
    CONTEXT_ENCRYPTION_ACTIVE_VERSION: '2026-08'
  });
  expect(provider.active()?.version).toBe('2026-08');
  expect(provider.byVersion('2026-01')?.key.equals(Buffer.alloc(32, 1))).toBe(true);
  expect(provider.byVersion('missing')).toBeNull();
});

test('context keyring rejects malformed or oversized configurations', () => {
  expect(createEnvironmentContextKeyProvider({
    CONTEXT_ENCRYPTION_KEYS_JSON: '{invalid', CONTEXT_ENCRYPTION_ACTIVE_VERSION: 'v1'
  }).active()).toBeNull();
  expect(createEnvironmentContextKeyProvider({
    CONTEXT_ENCRYPTION_KEYS_JSON: JSON.stringify({ v1: 'not-base64' }),
    CONTEXT_ENCRYPTION_ACTIVE_VERSION: 'v1'
  }).active()).toBeNull();
  const tooMany = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [
    `v${index}`, Buffer.alloc(32, index).toString('base64')
  ]));
  expect(createEnvironmentContextKeyProvider({
    CONTEXT_ENCRYPTION_KEYS_JSON: JSON.stringify(tooMany), CONTEXT_ENCRYPTION_ACTIVE_VERSION: 'v1'
  }).active()).toBeNull();
});

test('business context contract requires explicit versioned consent and allowlisted fields', () => {
  expect(parseBusinessContextWrite({ mode: 'patch', displayName: 'Oficina' })).toEqual({
    ok: false, error: 'explicit-consent-required'
  });
  expect(parseBusinessContextWrite({
    consent: true, consentVersion: CONTEXT_CONSENT_VERSION, mode: 'patch', displayName: 'Oficina', admin: true
  })).toEqual({ ok: false, error: 'unknown-field' });
  expect(parseBusinessContextWrite({
    consent: true,
    consentVersion: CONTEXT_CONSENT_VERSION,
    mode: 'patch',
    displayName: 'Oficina Horizonte',
    email: 'contato@example.com',
    address: { city: 'Campinas', state: 'SP', country: 'BR' },
    preferences: { defaultCurrency: 'BRL', locale: 'pt-BR', reuseBusinessContext: true }
  }).ok).toBe(true);
});

test('business context contract rejects nested smuggling and empty updates', () => {
  const consent = { consent: true, consentVersion: CONTEXT_CONSENT_VERSION, mode: 'patch' };
  expect(parseBusinessContextWrite({ ...consent })).toEqual({ ok: false, error: 'empty-update' });
  expect(parseBusinessContextWrite({
    ...consent, address: { city: 'Recife', coordinates: [-8, -34] }
  })).toEqual({ ok: false, error: 'invalid-address' });
  expect(parseBusinessContextWrite({
    ...consent, preferences: { locale: 'en-US' }
  })).toEqual({ ok: false, error: 'invalid-preferences' });
});
