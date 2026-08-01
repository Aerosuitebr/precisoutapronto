#!/bin/sh
set -eu

PRISMA_SCHEMA_MODE="${PRISMA_SCHEMA_MODE:-push}"

case "${PRISMA_SCHEMA_MODE}" in
  migrate)
    echo "[resolva-jato] Aplicando migrations versionadas (prisma migrate deploy)..."
    # Bancos criados antes via db push nao tem _prisma_migrations.
    # P3005: marcar o baseline vazio como aplicado e seguir com as migrations aditivas.
    if ! deploy_out="$(npx prisma migrate deploy 2>&1)"; then
      deploy_code=$?
      printf "%s\n" "${deploy_out}"
      if printf "%s" "${deploy_out}" | grep -q "P3005"; then
        echo "[resolva-jato] P3005 detectado. Baseline de schema existente..."
        npx prisma migrate resolve --applied 20260729000000_baseline_existing_schema
        npx prisma migrate deploy
      else
        exit "${deploy_code}"
      fi
    else
      printf "%s\n" "${deploy_out}"
    fi
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
