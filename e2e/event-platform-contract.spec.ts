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
import { duplicateOwnedArtifact, portableArtifactPayload } from '../src/lib/artifacts/duplication';
import { parsePersonalTemplateCreate } from '../src/lib/templates/contracts';
import {
  archivePersonalTemplate,
  createPersonalTemplate,
  instantiatePersonalTemplate,
  restorePersonalTemplate
} from '../src/lib/templates/repository';
import { listPersonalTemplates, parseTemplateListQuery } from '../src/lib/templates/reader';
import { parseShareLinkCreate } from '../src/lib/distribution/contracts';
import {
  createCanonicalShareLink,
  hashShareToken,
  revokeCanonicalShareLink
} from '../src/lib/distribution/share-links';
import { resolveCanonicalShareLink } from '../src/lib/distribution/resolver';
import { hashRecipientKey, parseShareEvent, recordCanonicalShareEvent } from '../src/lib/distribution/events';
import {
  createRecommendationExposure,
  clickRecommendationExposure,
  completeRecommendationExposure,
  parseRecommendationExposure,
  pseudonymizeRecommendationSession
} from '../src/lib/recommendation/exposures';
import {
  createHelpfulnessFeedback,
  parseHelpfulnessFeedback,
  pseudonymizeFeedbackIdentity,
  redactFeedbackPii
} from '../src/lib/feedback/helpfulness';
import {
  createResolutionRequest,
  normalizeResolutionIntent,
  parseResolutionRequest
} from '../src/lib/feedback/resolution-requests';
import { hashAiInput, parseAiInteraction, recordAiInteraction } from '../src/lib/ai-gateway/interactions';
import { decryptContextValue, encryptContextValue } from '../src/lib/context/encryption';
import {
  createEnvironmentContextKeyProvider,
  type ContextKeyProvider
} from '../src/lib/context/key-provider';
import {
  CONTEXT_CONSENT_VERSION,
  parseBusinessContextWrite,
  parseCustomerCreate,
  parseCustomerPatch
} from '../src/lib/context/contracts';
import { contextChangedFields, validContextAuditMetadata } from '../src/lib/context/audit';
import { writeBusinessContextProfile } from '../src/lib/context/profile-repository';
import { readBusinessContextProfile } from '../src/lib/context/profile-reader';
import { isTrustedWriteOrigin } from '../src/lib/security/request-origin';
import {
  archiveContextCustomer,
  createContextCustomer,
  restoreContextCustomer,
  updateContextCustomer
} from '../src/lib/context/customer-repository';
import { getContextCustomer, listContextCustomers, parseCustomerListQuery } from '../src/lib/context/customer-reader';
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
  expect(decryptContextValue(encrypted!.ciphertext, scope, provider)).toBe('cliente@example.com');
  expect(decryptContextValue(encrypted!.ciphertext, { ...scope, ownerUserId: 'user-2' }, provider)).toBeNull();
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
  expect(decryptContextValue(tampered, scope, provider)).toBeNull();
  expect(decryptContextValue(encrypted.ciphertext, scope, unavailable)).toBeNull();
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

test('each context envelope embeds its key version for mixed-version patches', () => {
  const oldKey = Buffer.alloc(32, 3);
  const newKey = Buffer.alloc(32, 4);
  const keys = new Map([['old', oldKey], ['new', newKey]]);
  let active = 'old';
  const provider: ContextKeyProvider = {
    active: () => ({ version: active, key: keys.get(active)! }),
    byVersion: (version) => keys.has(version) ? { version, key: keys.get(version)! } : null
  };
  const scope = { entity: 'customer' as const, recordId: 'record-1', ownerUserId: 'user-1', field: 'email' };
  const oldEnvelope = encryptContextValue('old@example.com', scope, provider)!;
  active = 'new';
  const newEnvelope = encryptContextValue('new@example.com', scope, provider)!;
  expect(decryptContextValue(oldEnvelope.ciphertext, scope, provider)).toBe('old@example.com');
  expect(decryptContextValue(newEnvelope.ciphertext, scope, provider)).toBe('new@example.com');
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

test('context audit migration stores metadata only and has no destructive cascade', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821161000_add_context_audit', 'migration.sql'
  ), 'utf8');
  const statements = migration.replace(/^--.*$/gm, '');
  expect(migration).toContain('CREATE TABLE "context_audit_events"');
  expect(migration).toContain('"changedFields" JSONB');
  expect(statements).not.toMatch(/payload|ciphertext|email|taxId|phone|address/i);
  expect(statements).not.toMatch(/\b(DROP|TRUNCATE|DELETE FROM|ON DELETE CASCADE)\b/i);
});

test('context audit records field names without carrying their values', () => {
  const changed = contextChangedFields({
    email: 'secret@example.com', phone: '11999999999', consent: true, unknown: 'secret'
  });
  expect(changed).toEqual(['email', 'phone']);
  expect(JSON.stringify(changed)).not.toContain('secret@example.com');
  expect(validContextAuditMetadata({
    entityType: 'user_business_profile', action: 'updated', changedFields: changed
  })).toBe(true);
  expect(validContextAuditMetadata({
    entityType: 'customer', action: 'updated', changedFields: ['password']
  })).toBe(false);
});

test('business context repository is flag-gated and never persists while disabled', async () => {
  let writes = 0;
  const result = await writeBusinessContextProfile('user-1', {
    consent: true, consentVersion: CONTEXT_CONSENT_VERSION, mode: 'patch', email: 'safe@example.com'
  }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: false, reason: 'disabled' as const }),
    keys: { active: () => null, byVersion: () => null },
    findId: async () => { throw new Error('must not read'); },
    persist: async () => { writes += 1; },
    now: () => new Date('2026-08-21T18:00:00.000Z')
  });
  expect(result).toBeNull();
  expect(writes).toBe(0);
});

test('business context repository persists ciphertext and audit metadata atomically', async () => {
  let persisted: Record<string, unknown> | null = null;
  const key = Buffer.alloc(32, 6);
  const result = await writeBusinessContextProfile('user-1', {
    consent: true,
    consentVersion: CONTEXT_CONSENT_VERSION,
    mode: 'patch',
    displayName: 'Oficina Horizonte',
    email: 'safe@example.com',
    phone: '+5511999999999'
  }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
    keys: {
      active: () => ({ version: 'v1', key }),
      byVersion: () => ({ version: 'v1', key })
    },
    findId: async () => null,
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    now: () => new Date('2026-08-21T18:00:00.000Z')
  });
  expect(result?.id).toMatch(/^[0-9a-f-]{36}$/);
  const serialized = JSON.stringify(persisted, (_key, value) => Buffer.isBuffer(value) ? '<buffer>' : value);
  expect(serialized).not.toContain('safe@example.com');
  expect(serialized).not.toContain('+5511999999999');
  expect(persisted).toMatchObject({
    create: { displayName: 'Oficina Horizonte', consentVersion: CONTEXT_CONSENT_VERSION },
    audit: {
      actorUserId: 'user-1', action: 'created',
      changedFields: ['displayName', 'email', 'phone']
    }
  });
});

test('business context reader checks the flag before querying storage', async () => {
  let reads = 0;
  const result = await readBusinessContextProfile('user-1', {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: false, reason: 'disabled' as const }),
    keys: { active: () => null, byVersion: () => null },
    find: async () => { reads += 1; return null; }
  });
  expect(result).toEqual({ enabled: false, context: null });
  expect(reads).toBe(0);
});

test('business context reader decrypts an owned profile and fails closed on wrong ownership', async () => {
  const key = Buffer.alloc(32, 8);
  const keys: ContextKeyProvider = {
    active: () => ({ version: 'v1', key }),
    byVersion: () => ({ version: 'v1', key })
  };
  const id = '10000000-0000-4000-8000-000000000001';
  const scope = { entity: 'user_business_profile' as const, recordId: id, ownerUserId: 'user-1', field: 'email' };
  const email = encryptContextValue('safe@example.com', scope, keys)!.ciphertext;
  const stored = {
    id, displayName: 'Oficina', legalName: null, taxIdEncrypted: null, email,
    phone: null, addressJson: null, pixJson: null,
    preferencesJson: { locale: 'pt-BR', injected: 'omit' },
    consentVersion: CONTEXT_CONSENT_VERSION,
    consentedAt: new Date('2026-08-21T18:00:00.000Z'),
    updatedAt: new Date('2026-08-21T18:10:00.000Z')
  };
  const dependencies = {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
    keys,
    find: async () => stored
  };
  const owned = await readBusinessContextProfile('user-1', dependencies);
  expect(owned).toMatchObject({ enabled: true, context: { email: 'safe@example.com', preferences: { locale: 'pt-BR' } } });
  expect(JSON.stringify(owned)).not.toContain('injected');
  expect(await readBusinessContextProfile('user-2', dependencies)).toBeNull();
});

test('me context endpoint derives ownership only from the authenticated session', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'me', 'context', 'route.ts'
  ), 'utf8');
  expect(route).toContain('readBusinessContextProfile(session.sub)');
  expect(route).not.toMatch(/searchParams|get\(['"]userId/);
  expect(route).toContain("status: 401");
  expect(route).toContain("status: 503");
});

test('write origin guard rejects cross-site and missing origins', () => {
  expect(isTrustedWriteOrigin(new Request('https://resolvajato.com.br/api/v1/me/context', {
    headers: { origin: 'https://resolvajato.com.br', 'sec-fetch-site': 'same-origin' }
  }))).toBe(true);
  expect(isTrustedWriteOrigin(new Request('https://resolvajato.com.br/api/v1/me/context'))).toBe(false);
  expect(isTrustedWriteOrigin(new Request('https://resolvajato.com.br/api/v1/me/context', {
    headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }
  }))).toBe(false);
});

test('context PUT validates origin, session and contract without accepting client ownership', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'me', 'context', 'route.ts'
  ), 'utf8');
  const put = route.slice(route.indexOf('export async function PUT'));
  expect(put.indexOf('isTrustedWriteOrigin(request)')).toBeLessThan(put.indexOf('request.json()'));
  expect(put).toContain('writeBusinessContextProfile(session.sub, parsed.data)');
  expect(put).not.toMatch(/body\.userId|parsed\.data\.userId/);
  expect(put).toContain("status: 400");
  expect(put).toContain("status: 401");
  expect(put).toContain("status: 403");
});

test('customer create requires consent, type and display name without client ownership', () => {
  const consent = { consent: true, consentVersion: CONTEXT_CONSENT_VERSION };
  expect(parseCustomerCreate({ ...consent, type: 'person' })).toEqual({
    ok: false, error: 'display-name-required'
  });
  expect(parseCustomerCreate({
    ...consent, type: 'business', displayName: 'Cliente ACME', ownerUserId: 'other-user'
  })).toEqual({ ok: false, error: 'unknown-field' });
  expect(parseCustomerCreate({
    ...consent,
    type: 'business',
    displayName: 'Cliente ACME',
    email: 'financeiro@example.com',
    metadata: { source: 'manual', tags: ['recorrente'] }
  }).ok).toBe(true);
});

test('customer patch rejects immutable fields and free-form metadata', () => {
  const consent = { consent: true, consentVersion: CONTEXT_CONSENT_VERSION };
  expect(parseCustomerPatch({ ...consent })).toEqual({ ok: false, error: 'empty-update' });
  expect(parseCustomerPatch({ ...consent, type: 'person' })).toEqual({ ok: false, error: 'unknown-field' });
  expect(parseCustomerPatch({
    ...consent, metadata: { notes: 'contains private narrative' }
  })).toEqual({ ok: false, error: 'invalid-metadata' });
  expect(parseCustomerPatch({ ...consent, phone: '+5511988887777' }).ok).toBe(true);
});

test('customer repository reports a soft duplicate without persisting', async () => {
  let writes = 0;
  const result = await createContextCustomer('user-1', {
    consent: true, consentVersion: CONTEXT_CONSENT_VERSION,
    type: 'business', displayName: 'Cliente ACME'
  }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
    keys: { active: () => null, byVersion: () => null },
    findDuplicate: async () => ({ id: 'existing-id', displayName: 'Cliente Acme' }),
    persist: async () => { writes += 1; },
    uuid: () => '10000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-21T19:00:00.000Z')
  });
  expect(result).toEqual({
    duplicate: true,
    customer: { id: 'existing-id', displayName: 'Cliente Acme' }
  });
  expect(writes).toBe(0);
});

test('customer repository atomically persists ciphertext and audit metadata', async () => {
  let persisted: Record<string, unknown> | null = null;
  const key = Buffer.alloc(32, 10);
  const result = await createContextCustomer('user-1', {
    consent: true, consentVersion: CONTEXT_CONSENT_VERSION,
    type: 'person', displayName: 'Cliente Um',
    email: 'cliente@example.com', phone: '+5511988887777',
    metadata: { source: 'manual', tags: ['recorrente'] }
  }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
    keys: {
      active: () => ({ version: 'v1', key }),
      byVersion: () => ({ version: 'v1', key })
    },
    findDuplicate: async () => null,
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: () => '10000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-21T19:00:00.000Z')
  });
  expect(result).toEqual({
    duplicate: false,
    customer: { id: '10000000-0000-4000-8000-000000000001', displayName: 'Cliente Um', type: 'person' }
  });
  const serialized = JSON.stringify(persisted, (_key, value) => Buffer.isBuffer(value) ? '<buffer>' : value);
  expect(serialized).not.toContain('cliente@example.com');
  expect(serialized).not.toContain('+5511988887777');
  expect(persisted).toMatchObject({
    customer: { ownerUserId: 'user-1', displayName: 'Cliente Um' },
    audit: { actorUserId: 'user-1', entityType: 'customer', action: 'created' }
  });
});

test('customer list query accepts bounded pagination and rejects invalid cursors', () => {
  expect(parseCustomerListQuery(new URLSearchParams('limit=50&search=acme'))).toEqual({
    limit: 50, search: 'acme'
  });
  expect(parseCustomerListQuery(new URLSearchParams('limit=100'))).toBeNull();
  expect(parseCustomerListQuery(new URLSearchParams('cursor=not-a-uuid'))).toBeNull();
});

test('customer list is flag-gated, ownership-scoped and returns summaries only', async () => {
  let ownerSeen = '';
  const result = await listContextCustomers('user-1', { limit: 10 }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
    find: async (owner) => {
      ownerSeen = owner;
      return [{
        id: '10000000-0000-4000-8000-000000000001', type: 'business', displayName: 'Cliente ACME',
        metadata: { source: 'manual', tags: ['vip'], privateNotes: 'omit' },
        createdAt: new Date('2026-08-21T19:00:00.000Z'), updatedAt: new Date('2026-08-21T19:10:00.000Z')
      }];
    }
  });
  expect(ownerSeen).toBe('user-1');
  expect(result).toMatchObject({
    enabled: true,
    customers: [{ displayName: 'Cliente ACME', metadata: { source: 'manual', tags: ['vip'] } }],
    nextCursor: null
  });
  expect(JSON.stringify(result)).not.toContain('privateNotes');
  expect(JSON.stringify(result)).not.toMatch(/email|phone|taxId|address/i);
});

test('customers route derives ownership from session for reads and creates', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'customers', 'route.ts'
  ), 'utf8');
  expect(route).toContain('listContextCustomers(session.sub, query)');
  expect(route).toContain('createContextCustomer(session.sub, parsed.data)');
  expect(route).not.toMatch(/body\.ownerUserId|searchParams\.get\(['"]ownerUserId/);
  expect(route).toContain("status: 409");
  expect(route).toContain('isTrustedWriteOrigin(request)');
});

test('customer patch can explicitly clear sensitive fields', () => {
  const consent = { consent: true, consentVersion: CONTEXT_CONSENT_VERSION };
  expect(parseCustomerPatch({ ...consent, email: null, phone: null, address: null }).ok).toBe(true);
  expect(parseCustomerPatch({ ...consent, displayName: null })).toEqual({ ok: false, error: 'invalid-name' });
});

test('customer update checks ownership and persists update with audit atomically', async () => {
  let persisted: Record<string, unknown> | null = null;
  const result = await updateContextCustomer(
    'user-1',
    '10000000-0000-4000-8000-000000000001',
    { consent: true, consentVersion: CONTEXT_CONSENT_VERSION, displayName: 'Novo Nome', email: null },
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
      keys: { active: () => null, byVersion: () => null },
      existsOwned: async (owner, id) => owner === 'user-1' && id.endsWith('1'),
      persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
      now: () => new Date('2026-08-21T20:00:00.000Z')
    }
  );
  expect(result).toEqual({ notFound: false, customer: { id: '10000000-0000-4000-8000-000000000001' } });
  expect(persisted).toMatchObject({
    ownerUserId: 'user-1',
    update: { displayName: 'Novo Nome', email: null },
    audit: { actorUserId: 'user-1', action: 'updated', changedFields: ['displayName', 'email'] }
  });
});

test('customer PATCH route never accepts ownership from params or body', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'customers', '[id]', 'route.ts'
  ), 'utf8');
  expect(route).toContain('updateContextCustomer(session.sub, id, parsed.data)');
  expect(route).not.toMatch(/body\.ownerUserId|parsed\.data\.ownerUserId/);
  expect(route).toContain("status: 404");
  expect(route).toContain('isTrustedWriteOrigin(request)');
});

test('customer detail is owner-scoped and decrypts PII only on explicit read', async () => {
  const key = Buffer.alloc(32, 7);
  const keys: ContextKeyProvider = {
    active: () => ({ version: 'v1', key }),
    byVersion: (version) => version === 'v1' ? { version, key } : null
  };
  const id = '10000000-0000-4000-8000-000000000001';
  const encryptedEmail = encryptContextValue('cliente@example.com', {
    entity: 'customer', recordId: id, ownerUserId: 'user-1', field: 'email'
  }, keys)!.ciphertext;
  let ownerSeen = '';
  const result = await getContextCustomer('user-1', id, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
    keys,
    find: async (owner) => {
      ownerSeen = owner;
      return {
        id, type: 'person', displayName: 'Cliente Um', legalName: null,
        taxIdEncrypted: null, email: encryptedEmail, phone: null, addressJson: null,
        metadata: { source: 'manual', privateNotes: 'omit' },
        createdAt: new Date('2026-08-21T19:00:00.000Z'),
        updatedAt: new Date('2026-08-21T20:00:00.000Z')
      };
    }
  });
  expect(ownerSeen).toBe('user-1');
  expect(result).toMatchObject({
    enabled: true,
    customer: { id, email: 'cliente@example.com', metadata: { source: 'manual' } }
  });
  expect(JSON.stringify(result)).not.toContain('privateNotes');
});

test('customer detail route derives ownership exclusively from session', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'customers', '[id]', 'route.ts'
  ), 'utf8');
  expect(route).toContain('getContextCustomer(session.sub, id)');
  expect(route).not.toMatch(/body\.ownerUserId|searchParams\.get\(['"]ownerUserId/);
});

test('customer archive is owner-scoped, soft and audited atomically', async () => {
  let persisted: Record<string, unknown> | null = null;
  const result = await archiveContextCustomer(
    'user-1',
    '10000000-0000-4000-8000-000000000001',
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
      persist: async (value) => { persisted = value as unknown as Record<string, unknown>; return true; },
      now: () => new Date('2026-08-21T21:00:00.000Z')
    }
  );
  expect(result).toEqual({ notFound: false, archivedAt: '2026-08-21T21:00:00.000Z' });
  expect(persisted).toMatchObject({
    ownerUserId: 'user-1',
    audit: { actorUserId: 'user-1', action: 'archived', changedFields: ['archivedAt'] }
  });
});

test('customer DELETE route performs archival and derives ownership from session', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'customers', '[id]', 'route.ts'
  ), 'utf8');
  expect(route).toContain('archiveContextCustomer(session.sub, id)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/\.delete\(|deleteMany\(|body\.ownerUserId/);
});

test('customer restore is owner-scoped and audited atomically', async () => {
  let persisted: Record<string, unknown> | null = null;
  const result = await restoreContextCustomer(
    'user-1',
    '10000000-0000-4000-8000-000000000001',
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'reusable_context_v1', enabled: true, reason: 'enabled' as const }),
      persist: async (value) => { persisted = value as unknown as Record<string, unknown>; return true; },
      now: () => new Date('2026-08-21T21:30:00.000Z')
    }
  );
  expect(result).toEqual({ notFound: false, restoredAt: '2026-08-21T21:30:00.000Z' });
  expect(persisted).toMatchObject({
    ownerUserId: 'user-1',
    audit: { actorUserId: 'user-1', action: 'restored', changedFields: ['archivedAt'] }
  });
});

test('customer restore route derives ownership from session and validates origin', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'customers', '[id]', 'restore', 'route.ts'
  ), 'utf8');
  expect(route).toContain('restoreContextCustomer(session.sub, id)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/body\.ownerUserId|searchParams\.get\(['"]ownerUserId/);
});

test('V006 personal template migration is additive and preserves artifacts', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821170000_add_personal_templates', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain('CREATE TABLE "personal_templates"');
  expect(migration).toContain('REFERENCES "artifacts"("id") ON DELETE RESTRICT');
  expect(migration).toContain('REFERENCES "personal_templates"("id") ON DELETE SET NULL');
  expect(migration).toContain("CHECK (\"visibility\" IN ('private', 'community'))");
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|DELETE FROM|INSERT INTO|UPDATE\s+"?artifacts"?\s+SET)\b/i);
  expect(migration).not.toContain('ON DELETE CASCADE');
});

test('template rollout flags remain independent and disabled by default', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821101000_add_feature_flags', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain("('duplicate_v1', 'Canonical artifact duplication', false, 0");
  expect(migration).toContain("('personal_templates_v1', 'Personal artifact templates', false, 0");
});

test('artifact duplication payload keeps only bounded structural fields', () => {
  expect(portableArtifactPayload({
    currency: 'BRL', layout: 'compact', validity_days: 15,
    customer_name: 'Cliente Secreto', email: 'cliente@example.com', notes: 'livre',
    nested: { phone: '+5511999999999' }
  })).toEqual({ currency: 'BRL', layout: 'compact', validity_days: 15 });
});

test('artifact duplication creates an independent private draft without changing source', async () => {
  let persisted: Record<string, unknown> | null = null;
  const result = await duplicateOwnedArtifact('user-1', '10000000-0000-4000-8000-000000000001', {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'duplicate_v1', enabled: true, reason: 'enabled' as const }),
    findOwned: async (userId, id) => userId === 'user-1' ? {
      id, artifactType: 'quote', toolKey: 'orcamentos', title: 'Orçamento 10',
      payloadJson: { currency: 'BRL', customer_name: 'Não copiar' },
      summaryJson: { item_count: 2, email: 'não@copiar.test' }
    } : null,
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: (() => {
      const ids = ['20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'];
      return () => ids.shift()!;
    })(),
    now: () => new Date('2026-08-21T22:00:00.000Z')
  });
  expect(result).toMatchObject({ enabled: true, artifactId: '30000000-0000-4000-8000-000000000001' });
  expect(persisted).toMatchObject({
    task: { userId: 'user-1', status: 'started', sourceChannel: 'duplicate' },
    artifact: {
      userId: 'user-1', status: 'draft', visibility: 'private',
      duplicatedFromId: '10000000-0000-4000-8000-000000000001',
      payloadJson: { currency: 'BRL' }, summaryJson: { item_count: 2 }
    }
  });
  expect(JSON.stringify(persisted)).not.toContain('Não copiar');
  expect(JSON.stringify(persisted)).not.toContain('não@copiar.test');
});

test('duplicate route derives ownership from session and validates origin', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'artifacts', '[id]', 'duplicate', 'route.ts'
  ), 'utf8');
  expect(route).toContain('duplicateOwnedArtifact(session.sub, id)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route.indexOf('duplicateOwnedArtifact(session.sub, id)')).toBeLessThan(route.indexOf("eventName: 'continuity.duplicated'"));
  expect(route).toContain('source_artifact_id: id');
  expect(route).toContain('target_task_id: result.taskId');
  expect(route).not.toMatch(/body\.userId|searchParams\.get\(['"]userId/);
});

test('personal template create contract rejects ownership and publication smuggling', () => {
  const valid = {
    sourceArtifactId: '10000000-0000-4000-8000-000000000001',
    name: 'Meu orçamento padrão'
  };
  expect(parsePersonalTemplateCreate(valid)).toEqual({ ok: true, data: valid });
  expect(parsePersonalTemplateCreate({ ...valid, ownerUserId: 'other' })).toEqual({ ok: false, error: 'unknown-field' });
  expect(parsePersonalTemplateCreate({ ...valid, visibility: 'community' })).toEqual({ ok: false, error: 'unknown-field' });
});

test('personal template creation is private, owner-scoped and sanitized', async () => {
  let persisted: Record<string, unknown> | null = null;
  const result = await createPersonalTemplate('user-1', {
    sourceArtifactId: '10000000-0000-4000-8000-000000000001',
    name: ' Modelo comercial '
  }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'personal_templates_v1', enabled: true, reason: 'enabled' as const }),
    findOwned: async (userId, id) => userId === 'user-1' ? {
      id, toolKey: 'orcamentos', payloadJson: { currency: 'BRL', customer_name: 'Não copiar' }
    } : null,
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: () => '40000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-21T22:30:00.000Z')
  });
  expect(result).toMatchObject({ enabled: true, template: { name: 'Modelo comercial', toolKey: 'orcamentos' } });
  expect(persisted).toMatchObject({
    ownerUserId: 'user-1', visibility: 'private', status: 'active',
    templatePayload: { currency: 'BRL' }
  });
  expect(JSON.stringify(persisted)).not.toContain('Não copiar');
});

test('templates POST route derives owner from session and cannot publish community', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'templates', 'route.ts'
  ), 'utf8');
  expect(route).toContain('createPersonalTemplate(session.sub, parsed.data)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/body\.ownerUserId|visibility:\s*['"]community/);
});

test('personal template instantiation creates a new private draft and preserves template', async () => {
  let persisted: Record<string, unknown> | null = null;
  const result = await instantiatePersonalTemplate(
    'user-1',
    '40000000-0000-4000-8000-000000000001',
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'personal_templates_v1', enabled: true, reason: 'enabled' as const }),
      findOwned: async (ownerUserId, id) => ownerUserId === 'user-1' ? {
        id, toolKey: 'orcamentos', name: 'Modelo comercial',
        templatePayload: { currency: 'BRL', email: 'não@copiar.test' },
        sourceArtifact: { artifactType: 'quote' }
      } : null,
      persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
      uuid: (() => {
        const ids = ['50000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001'];
        return () => ids.shift()!;
      })(),
      now: () => new Date('2026-08-21T23:00:00.000Z')
    }
  );
  expect(result).toMatchObject({
    enabled: true, taskId: '50000000-0000-4000-8000-000000000001',
    artifactId: '60000000-0000-4000-8000-000000000001'
  });
  expect(persisted).toMatchObject({
    task: { userId: 'user-1', status: 'started', sourceChannel: 'personal_template' },
    artifact: {
      userId: 'user-1', status: 'draft', visibility: 'private',
      templateId: '40000000-0000-4000-8000-000000000001',
      payloadJson: { currency: 'BRL' }
    }
  });
  expect(JSON.stringify(persisted)).not.toContain('não@copiar.test');
});

test('template instantiate route derives ownership from session and validates origin', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'templates', '[id]', 'instantiate', 'route.ts'
  ), 'utf8');
  expect(route).toContain('instantiatePersonalTemplate(session.sub, id)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/body\.ownerUserId|searchParams\.get\(['"]ownerUserId/);
});

test('personal template list query has bounded cursor pagination', () => {
  expect(parseTemplateListQuery(new URLSearchParams('limit=50'))).toEqual({ limit: 50 });
  expect(parseTemplateListQuery(new URLSearchParams('limit=100'))).toBeNull();
  expect(parseTemplateListQuery(new URLSearchParams('cursor=invalid'))).toBeNull();
});

test('personal template list is owner-scoped and never returns payloads', async () => {
  let ownerSeen = '';
  const result = await listPersonalTemplates('user-1', { limit: 10 }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'personal_templates_v1', enabled: true, reason: 'enabled' as const }),
    find: async (ownerUserId) => {
      ownerSeen = ownerUserId;
      return [{
        id: '40000000-0000-4000-8000-000000000001', toolKey: 'orcamentos',
        name: 'Modelo comercial', visibility: 'private', status: 'active',
        createdAt: new Date('2026-08-21T22:00:00.000Z'),
        updatedAt: new Date('2026-08-21T23:00:00.000Z')
      }];
    }
  });
  expect(ownerSeen).toBe('user-1');
  expect(result).toMatchObject({ enabled: true, templates: [{ name: 'Modelo comercial' }], nextCursor: null });
  expect(JSON.stringify(result)).not.toMatch(/templatePayload|payloadJson/i);
});

test('templates GET route derives owner exclusively from session', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'templates', 'route.ts'
  ), 'utf8');
  expect(route).toContain('listPersonalTemplates(session.sub, query)');
  expect(route).not.toMatch(/searchParams\.get\(['"]ownerUserId|body\.ownerUserId/);
});

test('personal template archive is logical and owner-scoped', async () => {
  let ownerSeen = '';
  const result = await archivePersonalTemplate(
    'user-1',
    '40000000-0000-4000-8000-000000000001',
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'personal_templates_v1', enabled: true, reason: 'enabled' as const }),
      archiveOwned: async (ownerUserId) => { ownerSeen = ownerUserId; return true; },
      now: () => new Date('2026-08-21T23:30:00.000Z')
    }
  );
  expect(ownerSeen).toBe('user-1');
  expect(result).toEqual({ enabled: true, notFound: false, archivedAt: '2026-08-21T23:30:00.000Z' });
});

test('template DELETE route archives by session ownership without physical deletion', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'templates', '[id]', 'route.ts'
  ), 'utf8');
  expect(route).toContain('archivePersonalTemplate(session.sub, id)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/\.delete\(|deleteMany\(|body\.ownerUserId/);
});

test('personal template restore is logical and owner-scoped', async () => {
  let ownerSeen = '';
  const result = await restorePersonalTemplate(
    'user-1',
    '40000000-0000-4000-8000-000000000001',
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'personal_templates_v1', enabled: true, reason: 'enabled' as const }),
      restoreOwned: async (ownerUserId) => { ownerSeen = ownerUserId; return true; },
      now: () => new Date('2026-08-21T23:45:00.000Z')
    }
  );
  expect(ownerSeen).toBe('user-1');
  expect(result).toEqual({ enabled: true, notFound: false, restoredAt: '2026-08-21T23:45:00.000Z' });
});

test('template restore route derives owner from session and validates origin', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'templates', '[id]', 'restore', 'route.ts'
  ), 'utf8');
  expect(route).toContain('restorePersonalTemplate(session.sub, id)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/body\.ownerUserId|searchParams\.get\(['"]ownerUserId/);
});

test('V007 distribution migration is additive and never stores plaintext tokens', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821180000_add_distribution', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain('CREATE TABLE "share_links"');
  expect(migration).toContain('CREATE TABLE "share_events"');
  expect(migration).toContain('"tokenHash" CHAR(64) NOT NULL');
  expect(migration).toContain('CREATE UNIQUE INDEX "share_links_tokenHash_key"');
  expect(migration).toContain('REFERENCES "artifacts"("id") ON DELETE RESTRICT');
  expect(migration).toContain('REFERENCES "share_links"("id") ON DELETE RESTRICT');
  expect(migration).not.toMatch(/"token"\s|"tokenPlain|ON DELETE CASCADE/i);
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|DELETE FROM|INSERT INTO)\b/i);
});

test('distribution rollout flags remain disabled by default', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821101000_add_feature_flags', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain("('share_attribution_v1', 'Canonical share attribution', false, 0");
  expect(migration).toContain("('recipient_cta_v1', 'Contextual recipient call to action', false, 0");
});

test('share link create contract rejects identity and unsafe campaign fields', () => {
  expect(parseShareLinkCreate({ channel: 'whatsapp', campaign: 'repeat_customer', expiresInDays: 30 })).toEqual({
    ok: true, data: { channel: 'whatsapp', campaign: 'repeat_customer', expiresInDays: 30 }
  });
  expect(parseShareLinkCreate({ channel: 'sms' })).toEqual({ ok: false, error: 'invalid-channel' });
  expect(parseShareLinkCreate({ channel: 'link', createdByUserId: 'other' })).toEqual({ ok: false, error: 'unknown-field' });
  expect(parseShareLinkCreate({ channel: 'link', expiresInDays: 365 })).toEqual({ ok: false, error: 'invalid-expiry' });
});

test('canonical share writer persists only token hash and owner-scoped artifact', async () => {
  const rawToken = 'secure-token-returned-only-once-1234567890';
  let persisted: Record<string, unknown> | null = null;
  let ownerSeen = '';
  const result = await createCanonicalShareLink(
    'user-1',
    '10000000-0000-4000-8000-000000000001',
    { channel: 'email', campaign: 'renewal', expiresInDays: 7 },
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'share_attribution_v1', enabled: true, reason: 'enabled' as const }),
      findOwnedArtifact: async (userId, id) => {
        ownerSeen = userId;
        return { id, toolKey: 'orcamentos' };
      },
      persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
      uuid: () => '70000000-0000-4000-8000-000000000001',
      token: () => rawToken,
      now: () => new Date('2026-08-22T00:00:00.000Z')
    }
  );
  expect(ownerSeen).toBe('user-1');
  expect(result).toMatchObject({ enabled: true, token: rawToken, toolKey: 'orcamentos' });
  expect(persisted).toMatchObject({
    createdByUserId: 'user-1', tokenHash: hashShareToken(rawToken), channel: 'email', campaign: 'renewal'
  });
  expect(JSON.stringify(persisted)).not.toContain(rawToken);
});

test('share link route derives owner from session and returns token only on create', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'artifacts', '[id]', 'share-links', 'route.ts'
  ), 'utf8');
  expect(route).toContain('createCanonicalShareLink(session.sub, id, parsed.data)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).toContain('token: result.token');
  expect(route.indexOf('createCanonicalShareLink(session.sub, id, parsed.data)'))
    .toBeLessThan(route.indexOf("eventName: 'outcome.shared'"));
  expect(route).toContain('share_link_id: result.shareLinkId');
  expect(route).toContain('channel: parsed.data.channel');
  expect(route).not.toMatch(/body\.createdByUserId|body\.userId/);
});

test('share resolver hashes token, rejects expiry and returns metadata without owner or payload', async () => {
  const token = 'secure-token-returned-only-once-1234567890';
  let hashSeen = '';
  const result = await resolveCanonicalShareLink(token, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'share_attribution_v1', enabled: true, reason: 'enabled' as const }),
    find: async (tokenHash) => {
      hashSeen = tokenHash;
      return {
        id: '80000000-0000-4000-8000-000000000001', channel: 'link', campaign: null,
        expiresAt: new Date('2026-08-23T00:00:00.000Z'), revokedAt: null,
        artifact: {
          id: '10000000-0000-4000-8000-000000000001', artifactType: 'quote',
          toolKey: 'orcamentos', status: 'active'
        }
      };
    },
    now: () => new Date('2026-08-22T00:00:00.000Z')
  });
  expect(hashSeen).toBe(hashShareToken(token));
  expect(JSON.stringify(result)).not.toMatch(/owner|userId|payload|tokenHash/i);
  expect(result).toMatchObject({ enabled: true, unavailable: false, shareLink: { channel: 'link' } });

  const expired = await resolveCanonicalShareLink(token, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'share_attribution_v1', enabled: true, reason: 'enabled' as const }),
    find: async () => ({
      id: '80000000-0000-4000-8000-000000000001', channel: 'link', campaign: null,
      expiresAt: new Date('2026-08-21T00:00:00.000Z'), revokedAt: null,
      artifact: { id: '10000000-0000-4000-8000-000000000001', artifactType: 'quote', toolKey: 'orcamentos', status: 'active' }
    }),
    now: () => new Date('2026-08-22T00:00:00.000Z')
  });
  expect(expired).toEqual({ enabled: true, unavailable: true });
});

test('share resolver route is explicitly private and noindex', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'shares', '[token]', 'route.ts'
  ), 'utf8');
  expect(route).toContain("'Cache-Control': 'private, no-store, max-age=0'");
  expect(route).toContain("'X-Robots-Tag': 'noindex, nofollow, noarchive'");
  expect(route).not.toMatch(/payloadJson|createdByUserId|tokenHash/);
});

test('share event contract accepts only pseudonymous recipient actions', () => {
  const recipientKey = 'device:opaque-1234567890';
  expect(parseShareEvent({ eventType: 'opened', recipientKey })).toEqual({
    ok: true, data: { eventType: 'opened', recipientKey }
  });
  expect(parseShareEvent({ eventType: 'recipient_action', recipientKey, action: 'use_template' })).toEqual({
    ok: true, data: { eventType: 'recipient_action', recipientKey, action: 'use_template' }
  });
  expect(parseShareEvent({ eventType: 'recipient_action', recipientKey, action: 'custom-text' }))
    .toEqual({ ok: false, error: 'invalid-action' });
  expect(parseShareEvent({ eventType: 'opened', recipientKey, email: 'x@y.test' }))
    .toEqual({ ok: false, error: 'unknown-field' });
});

test('share event writer hashes recipient and persists allowlisted metadata only', async () => {
  const token = 'secure-token-returned-only-once-1234567890';
  const recipientKey = 'device:opaque-1234567890';
  let persisted: Record<string, unknown> | null = null;
  let tokenHashSeen = '';
  const result = await recordCanonicalShareEvent(token, {
    eventType: 'recipient_action', recipientKey, action: 'download'
  }, undefined, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'share_attribution_v1', enabled: true, reason: 'enabled' as const }),
    findActive: async (tokenHash) => { tokenHashSeen = tokenHash; return { id: '80000000-0000-4000-8000-000000000001' }; },
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: () => '90000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-22T00:30:00.000Z')
  });
  expect(tokenHashSeen).toBe(hashShareToken(token));
  expect(result).toEqual({ enabled: true, unavailable: false, eventId: '90000000-0000-4000-8000-000000000001' });
  expect(persisted).toMatchObject({
    shareLinkId: '80000000-0000-4000-8000-000000000001',
    anonymousRecipientId: hashRecipientKey(recipientKey),
    metadata: { action: 'download' }
  });
  expect(JSON.stringify(persisted)).not.toContain(recipientKey);
  expect(JSON.stringify(persisted)).not.toContain(token);
});

test('share events route validates origin and never accepts persisted identity', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'shares', '[token]', 'events', 'route.ts'
  ), 'utf8');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).toContain('recordCanonicalShareEvent(token, parsed.data, session?.sub)');
  expect(route).not.toMatch(/body\.userId|body\.anonymousRecipientId/);
});

test('canonical share revocation is logical and creator-scoped', async () => {
  let ownerSeen = '';
  const result = await revokeCanonicalShareLink(
    'user-1',
    '80000000-0000-4000-8000-000000000001',
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'share_attribution_v1', enabled: true, reason: 'enabled' as const }),
      revokeOwned: async (userId) => { ownerSeen = userId; return true; },
      now: () => new Date('2026-08-22T01:00:00.000Z')
    }
  );
  expect(ownerSeen).toBe('user-1');
  expect(result).toEqual({ enabled: true, notFound: false, revokedAt: '2026-08-22T01:00:00.000Z' });
});

test('share link DELETE route derives creator from session without physical deletion', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'share-links', '[id]', 'route.ts'
  ), 'utf8');
  expect(route).toContain('revokeCanonicalShareLink(session.sub, id)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/\.delete\(|deleteMany\(|body\.createdByUserId/);
});

test('V008 recommendation exposure migration is additive and preserves canonical context', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821190000_add_recommendation_exposures', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain('CREATE TABLE "recommendation_exposures"');
  expect(migration).toContain('"recommendationKey" VARCHAR(80) NOT NULL');
  expect(migration).toContain('"targetToolKey" VARCHAR(80) NOT NULL');
  expect(migration).toContain('CHECK ("rank" BETWEEN 1 AND 3)');
  expect(migration).toContain('CHECK ("userId" IS NOT NULL OR "sessionId" IS NOT NULL)');
  expect(migration.match(/ON DELETE SET NULL/g)?.length).toBe(3);
  expect(migration).not.toContain('ON DELETE CASCADE');
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|DELETE FROM|INSERT INTO|UPDATE\s+"?recommendation_exposures)\b/i);
});

test('V008 leaves existing NBA event and ranking implementations intact', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821190000_add_recommendation_exposures', 'migration.sql'
  ), 'utf8');
  expect(migration).not.toMatch(/ALTER TABLE "product_events"|ALTER TABLE "intent_edges"/);
  expect(migration).not.toMatch(/recommendation\.shown|recommendation\.clicked|recommendation\.completed/);
});

test('recommendation exposure contract rejects persisted identity and invalid rank', () => {
  const valid = { recommendationKey: 'quote.to.receipt', targetToolKey: 'recibos', variant: 'default', rank: 1 };
  expect(parseRecommendationExposure(valid)).toEqual({ ok: true, data: valid });
  expect(parseRecommendationExposure({ ...valid, userId: 'other' })).toEqual({ ok: false, error: 'unknown-field' });
  expect(parseRecommendationExposure({ ...valid, sourceTaskId: '10000000-0000-4000-8000-000000000001' }))
    .toEqual({ ok: false, error: 'unknown-field' });
  expect(parseRecommendationExposure({ ...valid, rank: 4 })).toEqual({ ok: false, error: 'invalid-rank' });
});

test('recommendation exposure writer is flag-gated and persists pseudonymous subject', async () => {
  let persisted: Record<string, unknown> | null = null;
  const sessionId = pseudonymizeRecommendationSession('anonymous-session-123456789');
  const result = await createRecommendationExposure({ sessionId }, {
    recommendationKey: 'quote.to.receipt', targetToolKey: 'recibos', rank: 2
  }, {
    databaseConfigured: () => true,
    decide: async () => ({ key: 'nba_v1', enabled: true, reason: 'enabled' as const }),
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: () => 'a0000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-22T02:00:00.000Z')
  });
  expect(result).toEqual({
    enabled: true, exposureId: 'a0000000-0000-4000-8000-000000000001', shownAt: '2026-08-22T02:00:00.000Z'
  });
  expect(persisted).toMatchObject({
    userId: null, sessionId, recommendationKey: 'quote.to.receipt',
    targetToolKey: 'recibos', variant: 'default', rank: 2
  });
});

test('recommendation exposure route derives identity from session or pseudonymized header', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'recommendations', 'exposures', 'route.ts'
  ), 'utf8');
  expect(route).toMatch(/const subject = session\s*\?/);
  expect(route).toContain('{ userId: session.sub }');
  expect(route).toContain('pseudonymizeRecommendationSession(anonymousKey)');
  expect(route).not.toMatch(/body\.userId|body\.sessionId|body\.sourceTaskId/);
});

test('recommendation exposure click is subject-scoped and idempotent', async () => {
  let subjectSeen = '';
  const result = await clickRecommendationExposure(
    'a0000000-0000-4000-8000-000000000001',
    { userId: 'user-1' },
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'nba_v1', enabled: true, reason: 'enabled' as const }),
      markClicked: async ({ userId }) => { subjectSeen = userId || ''; return 'updated'; },
      now: () => new Date('2026-08-22T02:30:00.000Z')
    }
  );
  expect(subjectSeen).toBe('user-1');
  expect(result).toEqual({
    enabled: true, notFound: false, alreadyClicked: false, clickedAt: '2026-08-22T02:30:00.000Z'
  });

  const repeated = await clickRecommendationExposure(
    'a0000000-0000-4000-8000-000000000001',
    { userId: 'user-1' },
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'nba_v1', enabled: true, reason: 'enabled' as const }),
      markClicked: async () => 'already-clicked',
      now: () => new Date('2026-08-22T02:31:00.000Z')
    }
  );
  expect(repeated).toEqual({ enabled: true, notFound: false, alreadyClicked: true });
});

test('recommendation click route derives identity without accepting a body', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'recommendations', 'exposures', '[id]', 'click', 'route.ts'
  ), 'utf8');
  expect(route).toContain('clickRecommendationExposure(id, subject)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route).not.toMatch(/request\.json|body\.|searchParams\.get\(['"]userId/);
});

test('recommendation completion writer requires owned completed target task', async () => {
  let inputSeen: Record<string, unknown> | null = null;
  const result = await completeRecommendationExposure(
    'a0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    { userId: 'user-1' },
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'nba_v1', enabled: true, reason: 'enabled' as const }),
      completeOwned: async (input) => { inputSeen = input as unknown as Record<string, unknown>; return 'updated'; }
    }
  );
  expect(inputSeen).toEqual({
    exposureId: 'a0000000-0000-4000-8000-000000000001',
    completedTaskId: 'b0000000-0000-4000-8000-000000000001',
    userId: 'user-1'
  });
  expect(result).toEqual({ enabled: true, notFound: false, targetMismatch: false, alreadyCompleted: false });

  const mismatch = await completeRecommendationExposure(
    'a0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    { userId: 'user-1' },
    {
      databaseConfigured: () => true,
      decide: async () => ({ key: 'nba_v1', enabled: true, reason: 'enabled' as const }),
      completeOwned: async () => 'target-mismatch'
    }
  );
  expect(mismatch).toEqual({ enabled: true, targetMismatch: true });
});

test('recommendation completion has no client-facing API route', () => {
  const source = readFileSync(path.join(
    process.cwd(), 'src', 'lib', 'recommendation', 'exposures.ts'
  ), 'utf8');
  expect(source).toContain('Writer interno');
  expect(source).toContain("status: 'completed'");
  expect(source).toContain('toolKey: exposure.targetToolKey');
});

test('V009 feedback request migration is additive and bounds free text', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821200000_add_feedback_requests', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain('CREATE TABLE "helpfulness_feedback"');
  expect(migration).toContain('CREATE TABLE "resolution_requests"');
  expect(migration).toContain("CHECK (\"rating\" IN ('resolved', 'partial', 'not_resolved'))");
  expect(migration).toContain('char_length("detail") <= 1000');
  expect(migration).toContain('char_length("rawText") BETWEEN 3 AND 2000');
  expect(migration).toContain("CHECK (\"status\" IN ('received', 'triaged', 'planned', 'resolved', 'dismissed'))");
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|DELETE FROM|INSERT INTO)\b/i);
  expect(migration).not.toContain('ON DELETE CASCADE');
});

test('V009 foundation introduces no public writer before PII redaction', () => {
  const docs = readFileSync(path.join(
    process.cwd(), 'docs', 'architecture', 'sprint-9-feedback.md'
  ), 'utf8');
  expect(docs).toContain('detecção/redação de PII');
  expect(docs).toContain('rate limiting');
});

test('helpfulness contract redacts common PII and rejects identity smuggling', () => {
  const detail = 'Fale comigo em pessoa@example.com ou (11) 99999-8888, CPF 123.456.789-10';
  expect(redactFeedbackPii(detail)).toBe(
    'Fale comigo em [email-redacted] ou [phone-redacted], CPF [tax-id-redacted]'
  );
  expect(parseHelpfulnessFeedback({
    targetType: 'tool', targetId: 'orcamentos', rating: 'partial', detail
  })).toMatchObject({
    ok: true,
    data: { detail: 'Fale comigo em [email-redacted] ou [phone-redacted], CPF [tax-id-redacted]' }
  });
  expect(parseHelpfulnessFeedback({
    targetType: 'tool', targetId: 'orcamentos', rating: 'resolved', userId: 'other'
  })).toEqual({ ok: false, error: 'unknown-field' });
});

test('helpfulness writer persists only server-derived pseudonymous identity', async () => {
  let persisted: Record<string, unknown> | null = null;
  const anonymousId = pseudonymizeFeedbackIdentity('device-opaque-123456789');
  const result = await createHelpfulnessFeedback({ userId: 'user-1', anonymousId }, {
    targetType: 'article', targetId: 'como-fazer', rating: 'resolved'
  }, {
    databaseConfigured: () => true,
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: () => 'c0000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-22T03:00:00.000Z')
  });
  expect(result).toEqual({ feedbackId: 'c0000000-0000-4000-8000-000000000001', createdAt: '2026-08-22T03:00:00.000Z' });
  expect(persisted).toMatchObject({ userId: 'user-1', anonymousId, rating: 'resolved' });
});

test('helpfulness route rate limits before persistence and derives identity', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'feedback', 'helpfulness', 'route.ts'
  ), 'utf8');
  expect(route.indexOf('consumeRateLimit')).toBeLessThan(route.indexOf('createHelpfulnessFeedback'));
  expect(route).toContain('pseudonymizeFeedbackIdentity(anonymousKey)');
  expect(route).toContain('isTrustedWriteOrigin(request)');
  expect(route.indexOf('createHelpfulnessFeedback')).toBeLessThan(route.indexOf("eventName: 'feedback.helpfulness'"));
  expect(route).toContain('rating: parsed.data.rating');
  expect(route).not.toMatch(/detail:\s*parsed|properties:[\s\S]{0,200}detail/);
  expect(route).not.toMatch(/body\.userId|body\.anonymousId/);
});

test('resolution request contract redacts PII and derives closed intent server-side', () => {
  expect(normalizeResolutionIntent('Preciso criar um orçamento para cliente')).toBe('document.quote');
  expect(normalizeResolutionIntent('Algo totalmente novo')).toBe('unclassified');
  const parsed = parseResolutionRequest({
    rawText: 'Preciso de contrato, retorno em pessoa@example.com', source: 'search'
  });
  expect(parsed).toEqual({
    ok: true,
    data: { rawText: 'Preciso de contrato, retorno em [email-redacted]', source: 'search' }
  });
  expect(parseResolutionRequest({ rawText: 'pedido', source: 'search', normalizedIntent: 'forged' }))
    .toEqual({ ok: false, error: 'unknown-field' });
});

test('resolution request writer persists redacted text and server-normalized intent', async () => {
  let persisted: Record<string, unknown> | null = null;
  const result = await createResolutionRequest({ anonymousId: 'feedback_hash' }, {
    rawText: 'Quero um recibo e meu telefone é 11 99999-8888', source: 'feedback'
  }, {
    databaseConfigured: () => true,
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: () => 'd0000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-22T03:30:00.000Z')
  });
  expect(result).toMatchObject({ requestId: 'd0000000-0000-4000-8000-000000000001', normalizedIntent: 'document.receipt' });
  expect(persisted).toMatchObject({
    rawText: 'Quero um recibo e meu telefone é [phone-redacted]',
    normalizedIntent: 'document.receipt', status: 'received', source: 'feedback'
  });
  expect(JSON.stringify(persisted)).not.toContain('99999-8888');
});

test('resolution request route rate limits and never trusts normalized intent or identity', () => {
  const route = readFileSync(path.join(
    process.cwd(), 'src', 'app', 'api', 'v1', 'feedback', 'resolution-requests', 'route.ts'
  ), 'utf8');
  expect(route.indexOf('consumeRateLimit')).toBeLessThan(route.indexOf('createResolutionRequest'));
  expect(route).toContain('pseudonymizeFeedbackIdentity(anonymousKey)');
  expect(route.indexOf('createResolutionRequest')).toBeLessThan(route.indexOf("eventName: 'request.resolution_gap'"));
  expect(route).toContain('normalized_intent: result.normalizedIntent');
  expect(route).not.toMatch(/properties:[\s\S]{0,200}rawText/);
  expect(route).not.toMatch(/body\.normalizedIntent|body\.userId|body\.anonymousId|body\.status/);
});

test('V010 AI gateway migration is additive and has no plaintext prompt column', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821210000_add_ai_gateway', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain('CREATE TABLE "ai_interactions"');
  expect(migration).toContain('"inputHash" CHAR(64) NOT NULL');
  expect(migration).toContain('"outputJson" JSONB NOT NULL');
  expect(migration).toContain('"safetyResult" JSONB NOT NULL');
  expect(migration).toContain('CHECK ("userId" IS NOT NULL OR "sessionId" IS NOT NULL)');
  expect(migration).toContain('CHECK ("latencyMs" >= 0)');
  expect(migration).toContain('CHECK ("estimatedCost" >= 0)');
  expect(migration).not.toMatch(/"(prompt|input|rawInput|rawPrompt)"\s/i);
  expect(migration).not.toMatch(/\b(DROP|TRUNCATE|DELETE FROM|INSERT INTO)\b/i);
});

test('AI rollout flags remain disabled by default', () => {
  const migration = readFileSync(path.join(
    process.cwd(), 'prisma', 'migrations', '20260821101000_add_feature_flags', 'migration.sql'
  ), 'utf8');
  expect(migration).toContain("('ai_router_beta', 'AI need router beta', false, 0");
  expect(migration).toContain("('ai_prefill_beta', 'AI structured prefill beta', false, 0");
});

test('AI interaction contract accepts only hashes and structured allowlisted output', () => {
  const valid = {
    capability: 'route', modelKey: 'rules_v1', promptVersion: 'router_v1',
    inputHash: hashAiInput('texto sensível que não será persistido'),
    output: { tool_key: 'orcamentos', confidence_band: 'high', fallback: false },
    safety: { blocked: false, policy: 'safe_v1', category_count: 0, redacted: true },
    latencyMs: 12, estimatedCost: 0
  };
  expect(parseAiInteraction(valid)).toEqual({ ok: true, data: valid });
  expect(parseAiInteraction({ ...valid, prompt: 'não persistir' })).toEqual({ ok: false, error: 'unknown-field' });
  expect(parseAiInteraction({ ...valid, output: { answer: 'texto livre' } })).toEqual({ ok: false, error: 'invalid-output' });
  expect(parseAiInteraction({ ...valid, inputHash: 'raw-input' })).toEqual({ ok: false, error: 'invalid-input-hash' });
});

test('AI interaction writer is capability-gated and stores no raw input', async () => {
  let flagSeen = '';
  let persisted: Record<string, unknown> | null = null;
  const inputHash = hashAiInput('pedido privado');
  const result = await recordAiInteraction({ userId: 'user-1' }, {
    capability: 'prefill', modelKey: 'extractor_v1', promptVersion: 'prefill_v1',
    inputHash, output: { field_count: 3, confidence_band: 'medium' },
    safety: { blocked: false, policy: 'safe_v1', category_count: 0, redacted: true },
    latencyMs: 45, estimatedCost: 0.001
  }, {
    databaseConfigured: () => true,
    decide: async (flag) => { flagSeen = flag; return { key: flag, enabled: true, reason: 'enabled' as const }; },
    persist: async (value) => { persisted = value as unknown as Record<string, unknown>; },
    uuid: () => 'e0000000-0000-4000-8000-000000000001',
    now: () => new Date('2026-08-22T04:00:00.000Z')
  });
  expect(flagSeen).toBe('ai_prefill_beta');
  expect(result).toMatchObject({ enabled: true, interactionId: 'e0000000-0000-4000-8000-000000000001' });
  expect(persisted).toMatchObject({ userId: 'user-1', inputHash, capability: 'prefill', accepted: null });
  expect(JSON.stringify(persisted)).not.toContain('pedido privado');
});
