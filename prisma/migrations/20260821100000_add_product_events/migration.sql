-- V001: canonical product events. Additive only; no existing writer is enabled here.
CREATE TABLE "product_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventName" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "toolKey" TEXT,
    "taskId" UUID,
    "artifactId" UUID,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_events_occurredAt_idx" ON "product_events"("occurredAt");
CREATE INDEX "product_events_eventName_occurredAt_idx" ON "product_events"("eventName", "occurredAt");
CREATE INDEX "product_events_userId_occurredAt_idx" ON "product_events"("userId", "occurredAt");
CREATE INDEX "product_events_anonymousId_occurredAt_idx" ON "product_events"("anonymousId", "occurredAt");
CREATE INDEX "product_events_sessionId_occurredAt_idx" ON "product_events"("sessionId", "occurredAt");
CREATE INDEX "product_events_toolKey_occurredAt_idx" ON "product_events"("toolKey", "occurredAt");
