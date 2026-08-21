-- V009: helpfulness and unresolved-demand foundation. Additive only; no legacy backfill.
CREATE TABLE "helpfulness_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "anonymousId" VARCHAR(80) NOT NULL,
    "targetType" VARCHAR(40) NOT NULL,
    "targetId" VARCHAR(128) NOT NULL,
    "rating" VARCHAR(24) NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "helpfulness_feedback_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "helpfulness_feedback_rating_check" CHECK ("rating" IN ('resolved', 'partial', 'not_resolved')),
    CONSTRAINT "helpfulness_feedback_detail_length_check" CHECK ("detail" IS NULL OR char_length("detail") <= 1000)
);

CREATE TABLE "resolution_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "anonymousId" VARCHAR(80) NOT NULL,
    "rawText" TEXT NOT NULL,
    "normalizedIntent" VARCHAR(120),
    "source" VARCHAR(48) NOT NULL,
    "status" VARCHAR(24) NOT NULL DEFAULT 'received',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resolution_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "resolution_requests_status_check" CHECK ("status" IN ('received', 'triaged', 'planned', 'resolved', 'dismissed')),
    CONSTRAINT "resolution_requests_rawText_length_check" CHECK (char_length("rawText") BETWEEN 3 AND 2000)
);

CREATE INDEX "helpfulness_feedback_targetType_targetId_createdAt_idx" ON "helpfulness_feedback"("targetType", "targetId", "createdAt");
CREATE INDEX "helpfulness_feedback_userId_createdAt_idx" ON "helpfulness_feedback"("userId", "createdAt");
CREATE INDEX "helpfulness_feedback_anonymousId_createdAt_idx" ON "helpfulness_feedback"("anonymousId", "createdAt");
CREATE INDEX "resolution_requests_status_createdAt_idx" ON "resolution_requests"("status", "createdAt");
CREATE INDEX "resolution_requests_normalizedIntent_createdAt_idx" ON "resolution_requests"("normalizedIntent", "createdAt");
CREATE INDEX "resolution_requests_userId_createdAt_idx" ON "resolution_requests"("userId", "createdAt");
CREATE INDEX "resolution_requests_anonymousId_createdAt_idx" ON "resolution_requests"("anonymousId", "createdAt");
