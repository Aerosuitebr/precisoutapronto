-- Pix do orçamento público (QR e Copia e Cola após aprovação).
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "pixKey" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "pixKeyType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "pixMerchantName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "pixMerchantCity" TEXT NOT NULL DEFAULT '';
