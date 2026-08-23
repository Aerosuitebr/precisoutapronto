CREATE TABLE "referral_benefits" (
    "id" TEXT NOT NULL,
    "activationId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "providerRef" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_benefits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "referral_benefits_providerRef_key" ON "referral_benefits"("providerRef");
CREATE UNIQUE INDEX "referral_benefits_activationId_kind_key" ON "referral_benefits"("activationId", "kind");
CREATE INDEX "referral_benefits_beneficiaryId_idx" ON "referral_benefits"("beneficiaryId");

ALTER TABLE "referral_benefits" ADD CONSTRAINT "referral_benefits_activationId_fkey" FOREIGN KEY ("activationId") REFERENCES "referral_activations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referral_benefits" ADD CONSTRAINT "referral_benefits_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
