-- Favoritos são opcionais e todos os documentos existentes permanecem não favoritos.
ALTER TABLE "tool_documents"
ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "tool_documents_userId_isFavorite_updatedAt_idx"
ON "tool_documents"("userId", "isFavorite", "updatedAt");
