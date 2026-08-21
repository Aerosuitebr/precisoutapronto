-- V002: internal feature flags and stable experiment assignments. Additive only.
CREATE TABLE "feature_flags" (
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "rules" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key"),
    CONSTRAINT "feature_flags_rolloutPercent_check" CHECK ("rolloutPercent" >= 0 AND "rolloutPercent" <= 100)
);

CREATE TABLE "experiment_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "experimentKey" TEXT NOT NULL,
    "subjectKey" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiment_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "experiment_assignments_experimentKey_subjectKey_key"
    ON "experiment_assignments"("experimentKey", "subjectKey");
CREATE INDEX "experiment_assignments_experimentKey_assignedAt_idx"
    ON "experiment_assignments"("experimentKey", "assignedAt");

INSERT INTO "feature_flags" ("key", "description", "enabled", "rolloutPercent", "rules", "updatedAt")
VALUES
    ('event_platform_v1', 'Canonical product event ingestion', false, 0, '{}', CURRENT_TIMESTAMP),
    ('nba_v1', 'Rule-based next best action', false, 0, '{}', CURRENT_TIMESTAMP),
    ('smart_history_v1', 'Task and artifact timeline', false, 0, '{}', CURRENT_TIMESTAMP),
    ('reusable_context_v1', 'Reusable business and customer context', false, 0, '{}', CURRENT_TIMESTAMP),
    ('duplicate_v1', 'Canonical artifact duplication', false, 0, '{}', CURRENT_TIMESTAMP),
    ('personal_templates_v1', 'Personal artifact templates', false, 0, '{}', CURRENT_TIMESTAMP),
    ('share_attribution_v1', 'Canonical share attribution', false, 0, '{}', CURRENT_TIMESTAMP),
    ('recipient_cta_v1', 'Contextual recipient call to action', false, 0, '{}', CURRENT_TIMESTAMP),
    ('template_fork_v1', 'Sanitized template fork', false, 0, '{}', CURRENT_TIMESTAMP),
    ('state_transfer_v1', 'Allowlisted artifact state transfer', false, 0, '{}', CURRENT_TIMESTAMP),
    ('ai_router_beta', 'AI need router beta', false, 0, '{}', CURRENT_TIMESTAMP),
    ('ai_prefill_beta', 'AI structured prefill beta', false, 0, '{}', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
