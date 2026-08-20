ALTER TABLE "user_profiles" ADD COLUMN "logoDataUrl" TEXT;
ALTER TABLE "orcamentos" ADD COLUMN "profissionalLogoDataUrl" TEXT;
ALTER TABLE "orcamentos" ADD COLUMN "sourceOccupation" TEXT;
CREATE INDEX "orcamentos_sourceOccupation_createdAt_idx" ON "orcamentos"("sourceOccupation", "createdAt");
