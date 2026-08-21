-- V006: personal template foundation. Additive only; no artifact or legacy backfill.
CREATE TABLE "personal_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerUserId" TEXT NOT NULL,
    "sourceArtifactId" UUID NOT NULL,
    "toolKey" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "templatePayload" JSONB NOT NULL DEFAULT '{}',
    "visibility" VARCHAR(16) NOT NULL DEFAULT 'private',
    "status" VARCHAR(24) NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "personal_templates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "personal_templates_sourceArtifactId_fkey" FOREIGN KEY ("sourceArtifactId") REFERENCES "artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "personal_templates_visibility_check" CHECK ("visibility" IN ('private', 'community')),
    CONSTRAINT "personal_templates_status_check" CHECK ("status" IN ('active', 'archived'))
);

CREATE INDEX "personal_templates_ownerUserId_updatedAt_idx" ON "personal_templates"("ownerUserId", "updatedAt");
CREATE INDEX "personal_templates_toolKey_visibility_status_idx" ON "personal_templates"("toolKey", "visibility", "status");
CREATE INDEX "personal_templates_sourceArtifactId_idx" ON "personal_templates"("sourceArtifactId");

ALTER TABLE "artifacts"
ADD CONSTRAINT "artifacts_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "personal_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
