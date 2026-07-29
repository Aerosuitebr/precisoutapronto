-- Growth architecture: user personalization and public document sharing.
-- This migration is additive and does not rewrite existing rows.

BEGIN;

CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "occupation" TEXT,
    "companyName" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shared_documents" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "toolDocumentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "shared_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_profiles_userId_key"
    ON "user_profiles"("userId");

CREATE INDEX "user_profiles_segment_idx"
    ON "user_profiles"("segment");

CREATE UNIQUE INDEX "shared_documents_token_key"
    ON "shared_documents"("token");

CREATE INDEX "shared_documents_ownerId_createdAt_idx"
    ON "shared_documents"("ownerId", "createdAt");

CREATE INDEX "shared_documents_toolDocumentId_idx"
    ON "shared_documents"("toolDocumentId");

ALTER TABLE "user_profiles"
    ADD CONSTRAINT "user_profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shared_documents"
    ADD CONSTRAINT "shared_documents_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shared_documents"
    ADD CONSTRAINT "shared_documents_toolDocumentId_fkey"
    FOREIGN KEY ("toolDocumentId") REFERENCES "tool_documents"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
