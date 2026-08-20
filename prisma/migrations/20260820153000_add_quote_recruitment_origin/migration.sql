ALTER TABLE "orcamentos" ADD COLUMN "recruitedFromDocument" UUID;
CREATE INDEX "orcamentos_recruitedFromDocument_createdAt_idx" ON "orcamentos"("recruitedFromDocument", "createdAt");
