-- Context audit metadata only. Never store field values or ciphertext here.
CREATE TABLE "context_audit_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actorUserId" TEXT NOT NULL,
    "entityType" VARCHAR(32) NOT NULL,
    "entityId" UUID NOT NULL,
    "action" VARCHAR(32) NOT NULL,
    "changedFields" JSONB NOT NULL DEFAULT '[]',
    "consentVersion" VARCHAR(32),
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "context_audit_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "context_audit_events_entityType_check" CHECK ("entityType" IN ('user_business_profile', 'customer')),
    CONSTRAINT "context_audit_events_action_check" CHECK ("action" IN ('created', 'updated', 'archived', 'restored', 'deleted'))
);

CREATE INDEX "context_audit_events_actorUserId_occurredAt_idx" ON "context_audit_events"("actorUserId", "occurredAt");
CREATE INDEX "context_audit_events_entityType_entityId_occurredAt_idx" ON "context_audit_events"("entityType", "entityId", "occurredAt");
