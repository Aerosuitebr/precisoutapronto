-- Métricas agregadas de acesso. Nenhum identificador do visitante é armazenado.
ALTER TABLE "shared_documents"
  ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastViewedAt" TIMESTAMP(3);
