-- V005: reusable business and customer context. Additive schema only; no backfill.
CREATE TABLE "user_business_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "legalName" BYTEA,
    "taxIdEncrypted" BYTEA,
    "email" BYTEA,
    "phone" BYTEA,
    "addressJson" BYTEA,
    "logoAssetId" UUID,
    "pixJson" BYTEA,
    "signatureAssetId" UUID,
    "preferencesJson" JSONB NOT NULL DEFAULT '{}',
    "encryptionKeyVersion" VARCHAR(32),
    "consentVersion" VARCHAR(32) NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_business_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerUserId" TEXT NOT NULL,
    "type" VARCHAR(24) NOT NULL,
    "displayName" TEXT NOT NULL,
    "legalName" BYTEA,
    "taxIdEncrypted" BYTEA,
    "email" BYTEA,
    "phone" BYTEA,
    "addressJson" BYTEA,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "encryptionKeyVersion" VARCHAR(32),
    "consentVersion" VARCHAR(32) NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_business_profiles_userId_key" ON "user_business_profiles"("userId");
CREATE INDEX "customers_ownerUserId_archivedAt_idx" ON "customers"("ownerUserId", "archivedAt");
CREATE INDEX "customers_ownerUserId_displayName_idx" ON "customers"("ownerUserId", "displayName");
