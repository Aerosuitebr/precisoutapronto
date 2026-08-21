ALTER TABLE "orcamentos" ADD COLUMN "firstRecruitClickedAt" TIMESTAMP(3);

CREATE INDEX "orcamentos_firstRecruitClickedAt_idx" ON "orcamentos"("firstRecruitClickedAt");
