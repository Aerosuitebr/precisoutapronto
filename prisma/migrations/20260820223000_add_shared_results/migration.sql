CREATE TABLE "shared_results" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "data" JSONB NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "ctaPath" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'result',
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    CONSTRAINT "shared_results_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "shared_results_token_key" ON "shared_results"("token");
CREATE INDEX "shared_results_tool_createdAt_idx" ON "shared_results"("tool", "createdAt");
CREATE INDEX "shared_results_expiresAt_idx" ON "shared_results"("expiresAt");
