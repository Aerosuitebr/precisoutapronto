-- V004: canonical task and artifact foundation. Additive only; no legacy backfill.
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "anonymousSessionId" TEXT,
    "toolKey" VARCHAR(80) NOT NULL,
    "intentKey" VARCHAR(80),
    "status" VARCHAR(32) NOT NULL DEFAULT 'started',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "sourceChannel" VARCHAR(48),
    "sourceUrl" TEXT,
    "parentTaskId" UUID,
    "contextSnapshot" JSONB NOT NULL DEFAULT '{}',
    "experimentSnapshot" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "artifacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taskId" UUID NOT NULL,
    "userId" TEXT,
    "artifactType" VARCHAR(48) NOT NULL,
    "toolKey" VARCHAR(80) NOT NULL,
    "publicId" VARCHAR(120),
    "visibility" VARCHAR(16) NOT NULL DEFAULT 'private',
    "title" TEXT,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "summaryJson" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(32) NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "duplicatedFromId" UUID,
    "templateId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "artifacts_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "artifacts_duplicatedFromId_fkey" FOREIGN KEY ("duplicatedFromId") REFERENCES "artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "artifacts_visibility_check" CHECK ("visibility" IN ('private', 'unlisted', 'public')),
    CONSTRAINT "artifacts_version_check" CHECK ("version" >= 1)
);

CREATE TABLE "artifact_relations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceArtifactId" UUID NOT NULL,
    "targetArtifactId" UUID NOT NULL,
    "relationType" VARCHAR(48) NOT NULL,
    "transferredFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "artifact_relations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "artifact_relations_sourceArtifactId_fkey" FOREIGN KEY ("sourceArtifactId") REFERENCES "artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "artifact_relations_targetArtifactId_fkey" FOREIGN KEY ("targetArtifactId") REFERENCES "artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "tasks_userId_startedAt_idx" ON "tasks"("userId", "startedAt");
CREATE INDEX "tasks_anonymousSessionId_startedAt_idx" ON "tasks"("anonymousSessionId", "startedAt");
CREATE INDEX "tasks_toolKey_startedAt_idx" ON "tasks"("toolKey", "startedAt");
CREATE INDEX "tasks_status_startedAt_idx" ON "tasks"("status", "startedAt");
CREATE INDEX "tasks_parentTaskId_idx" ON "tasks"("parentTaskId");
CREATE UNIQUE INDEX "artifacts_publicId_key" ON "artifacts"("publicId");
CREATE INDEX "artifacts_taskId_updatedAt_idx" ON "artifacts"("taskId", "updatedAt");
CREATE INDEX "artifacts_userId_updatedAt_idx" ON "artifacts"("userId", "updatedAt");
CREATE INDEX "artifacts_toolKey_updatedAt_idx" ON "artifacts"("toolKey", "updatedAt");
CREATE INDEX "artifacts_visibility_updatedAt_idx" ON "artifacts"("visibility", "updatedAt");
CREATE INDEX "artifacts_duplicatedFromId_idx" ON "artifacts"("duplicatedFromId");
CREATE INDEX "artifacts_templateId_idx" ON "artifacts"("templateId");
CREATE UNIQUE INDEX "artifact_relations_sourceArtifactId_targetArtifactId_relationType_key" ON "artifact_relations"("sourceArtifactId", "targetArtifactId", "relationType");
CREATE INDEX "artifact_relations_targetArtifactId_createdAt_idx" ON "artifact_relations"("targetArtifactId", "createdAt");
