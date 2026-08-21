-- V010: AI gateway interaction metadata. Additive only; no plaintext prompt storage.
CREATE TABLE "ai_interactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "sessionId" TEXT,
    "capability" VARCHAR(80) NOT NULL,
    "modelKey" VARCHAR(80) NOT NULL,
    "promptVersion" VARCHAR(48) NOT NULL,
    "inputHash" CHAR(64) NOT NULL,
    "outputJson" JSONB NOT NULL DEFAULT '{}',
    "safetyResult" JSONB NOT NULL DEFAULT '{}',
    "latencyMs" INTEGER NOT NULL,
    "estimatedCost" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "accepted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_interactions_subject_check" CHECK ("userId" IS NOT NULL OR "sessionId" IS NOT NULL),
    CONSTRAINT "ai_interactions_latency_check" CHECK ("latencyMs" >= 0),
    CONSTRAINT "ai_interactions_cost_check" CHECK ("estimatedCost" >= 0)
);

CREATE INDEX "ai_interactions_userId_createdAt_idx" ON "ai_interactions"("userId", "createdAt");
CREATE INDEX "ai_interactions_sessionId_createdAt_idx" ON "ai_interactions"("sessionId", "createdAt");
CREATE INDEX "ai_interactions_capability_createdAt_idx" ON "ai_interactions"("capability", "createdAt");
CREATE INDEX "ai_interactions_modelKey_createdAt_idx" ON "ai_interactions"("modelKey", "createdAt");
CREATE INDEX "ai_interactions_inputHash_createdAt_idx" ON "ai_interactions"("inputHash", "createdAt");
