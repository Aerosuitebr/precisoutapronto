#!/usr/bin/env bash
# Aplica a config do tunnel Resolva Jato (inclui staging) no VPS.
# Uso (no servidor): bash scripts/deploy/apply-cloudflared-resolvajato.sh

set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)/cloudflared-config.resolvajato.yml"
DEST_DIR="${CLOUDFLARED_CONF_DIR:-/etc/cloudflared-resolvajato}"
DEST="${DEST_DIR}/config.yml"
SERVICE="${CLOUDFLARED_SERVICE:-cloudflared-resolvajato}"

if [[ ! -f "${SRC}" ]]; then
  echo "ERRO: config fonte ausente: ${SRC}"
  exit 1
fi

mkdir -p "${DEST_DIR}"
cp -a "${SRC}" "${DEST}"
chmod 644 "${DEST}"

echo "==> Config aplicada em ${DEST}"
if systemctl list-unit-files | grep -q "${SERVICE}"; then
  systemctl restart "${SERVICE}"
  systemctl --no-pager --full status "${SERVICE}" | head -20
else
  echo "==> Serviço ${SERVICE} ausente; instalar conector dedicado"
  bash "$(cd "$(dirname "$0")" && pwd)/install-cloudflared-resolvajato.sh"
fi

echo "OK. Confirme DNS staging.resolvajato.com.br e Cloudflare Access."
