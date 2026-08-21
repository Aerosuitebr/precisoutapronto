ALTER TABLE "orcamentos" ADD COLUMN "firstViewedAt" TIMESTAMP(3);

CREATE INDEX "orcamentos_firstViewedAt_idx" ON "orcamentos"("firstViewedAt");
