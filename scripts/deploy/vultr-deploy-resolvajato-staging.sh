#!/usr/bin/env bash
# Deploy Resolva Jato STAGING no Vultr (homolog i18n).
# Não altera .env.staging do servidor se já existir.
# Uso: INSTALL_DIR=/opt/resolva-jato-staging bash vultr-deploy-resolvajato-staging.sh

set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/resolva-jato-staging}"
TARBALL="${TARBALL:-/tmp/resolva-jato-repo.tgz}"
APP_PORT="${APP_PORT:-3001}"

if [[ ! -f "${TARBALL}" ]]; then
  echo "ERRO: tarball ausente: ${TARBALL}"
  exit 1
fi

echo "==> Extrair codigo em ${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"

if [[ -f "${INSTALL_DIR}/.env.staging" ]]; then
  cp -a "${INSTALL_DIR}/.env.staging" /tmp/resolva-jato.env.staging.bak
fi
find "${INSTALL_DIR}" -mindepth 1 -maxdepth 1 ! -name '.env.staging' -exec rm -rf {} +
tar -xzf "${TARBALL}" -C "${INSTALL_DIR}"
if [[ ! -f "${INSTALL_DIR}/.env.staging" && -f /tmp/resolva-jato.env.staging.bak ]]; then
  cp -a /tmp/resolva-jato.env.staging.bak "${INSTALL_DIR}/.env.staging"
  chmod 600 "${INSTALL_DIR}/.env.staging"
fi

cd "${INSTALL_DIR}"

if [[ ! -f .env.staging ]]; then
  echo "ERRO: .env.staging ausente em ${INSTALL_DIR}."
  echo "Copie .env.staging.example → .env.staging e preencha (Stripe test, DB, AUTH_SECRET)."
  exit 1
fi

COMPOSE=(
  docker compose
  --env-file .env.staging
  -f docker-compose.staging.yml
  -p resolva-jato-staging
)

echo "==> Validar compose staging"
"${COMPOSE[@]}" config -q

echo "==> Build incremental apenas da aplicação staging"
"${COMPOSE[@]}" build app

echo "==> Subir staging sem reconstrução adicional (app em 127.0.0.1:${APP_PORT})"
"${COMPOSE[@]}" up -d --no-build --remove-orphans

echo "==> Schema Prisma: migrations versionadas aplicadas pelo entrypoint (PRISMA_SCHEMA_MODE=migrate)"

echo "==> Aguardar health do app staging"
ok=0
for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${APP_PORT}/" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 5
done

if [[ "${ok}" -ne 1 ]]; then
  echo "ERRO: app staging nao respondeu em http://127.0.0.1:${APP_PORT}/"
  "${COMPOSE[@]}" ps
  docker logs resolva-jato-staging-app --tail 80 || true
  exit 1
fi

curl -sfI "http://127.0.0.1:${APP_PORT}/" | head -5
curl -sfI "http://127.0.0.1:${APP_PORT}/robots.txt" | head -5 || true
"${COMPOSE[@]}" ps
echo "OK - Resolva Jato STAGING em ${INSTALL_DIR} (localhost:${APP_PORT})"
echo "URL: https://staging.resolvajato.com.br"
echo "Lembrete: configure Cloudflare Access no hostname staging."
