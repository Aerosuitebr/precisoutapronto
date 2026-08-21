-- V008: recommendation exposure lifecycle. Additive only; existing recommendation events remain unchanged.
CREATE TABLE "recommendation_exposures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "sessionId" TEXT,
    "sourceTaskId" UUID,
    "sourceArtifactId" UUID,
    "recommendationKey" VARCHAR(80) NOT NULL,
    "targetToolKey" VARCHAR(80) NOT NULL,
    "variant" VARCHAR(48) NOT NULL DEFAULT 'default',
    "rank" INTEGER NOT NULL,
    "shownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedAt" TIMESTAMP(3),
    "completedTaskId" UUID,
    CONSTRAINT "recommendation_exposures_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "recommendation_exposures_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "recommendation_exposures_sourceArtifactId_fkey" FOREIGN KEY ("sourceArtifactId") REFERENCES "artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "recommendation_exposures_completedTaskId_fkey" FOREIGN KEY ("completedTaskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "recommendation_exposures_rank_check" CHECK ("rank" BETWEEN 1 AND 3),
    CONSTRAINT "recommendation_exposures_subject_check" CHECK ("userId" IS NOT NULL OR "sessionId" IS NOT NULL)
);

CREATE INDEX "recommendation_exposures_userId_shownAt_idx" ON "recommendation_exposures"("userId", "shownAt");
CREATE INDEX "recommendation_exposures_sessionId_shownAt_idx" ON "recommendation_exposures"("sessionId", "shownAt");
CREATE INDEX "recommendation_exposures_sourceTaskId_shownAt_idx" ON "recommendation_exposures"("sourceTaskId", "shownAt");
CREATE INDEX "recommendation_exposures_sourceArtifactId_shownAt_idx" ON "recommendation_exposures"("sourceArtifactId", "shownAt");
CREATE INDEX "recommendation_exposures_recommendationKey_shownAt_idx" ON "recommendation_exposures"("recommendationKey", "shownAt");
CREATE INDEX "recommendation_exposures_targetToolKey_shownAt_idx" ON "recommendation_exposures"("targetToolKey", "shownAt");
