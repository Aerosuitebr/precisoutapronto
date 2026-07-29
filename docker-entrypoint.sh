#!/bin/sh
set -eu

PRISMA_SCHEMA_MODE="${PRISMA_SCHEMA_MODE:-push}"

case "${PRISMA_SCHEMA_MODE}" in
  migrate)
    echo "[resolva-jato] Aplicando migrations versionadas (prisma migrate deploy)..."
    npx prisma migrate deploy
    ;;
  push)
    echo "[resolva-jato] Sincronizando schema local (prisma db push, sem accept-data-loss)..."
    npx prisma db push --skip-generate
    ;;
  skip)
    echo "[resolva-jato] Alteracao de schema desabilitada (PRISMA_SCHEMA_MODE=skip)."
    ;;
  *)
    echo "[resolva-jato] ERRO: PRISMA_SCHEMA_MODE deve ser migrate, push ou skip." >&2
    exit 1
    ;;
esac

echo "[resolva-jato] Iniciando Next.js em 0.0.0.0:${PORT:-3000}"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
