#!/usr/bin/env bash
# Atualiza SMTP do Precisou, Tá Pronto no VPS para Google Workspace (contato@).
# Uso (no servidor, com senha de app já gerada):
#   SMTP_PASS='xxxx xxxx xxxx xxxx' bash /tmp/patch-smtp-workspace.sh
# Ou local via SSH:
#   ssh root@HOST "SMTP_PASS='...' bash -s" < scripts/deploy/patch-smtp-workspace.sh

set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/resolva-jato}"
ENVF="${INSTALL_DIR}/.env.production"
EMAIL="${SMTP_USER_VALUE:-contato@precisoutapronto.com.br}"
FROM_VALUE="${SMTP_FROM_VALUE:-Precisou, Tá Pronto <contato@precisoutapronto.com.br>}"

if [[ ! -f "${ENVF}" ]]; then
  echo "ERRO: ${ENVF} ausente"
  exit 1
fi

if [[ -z "${SMTP_PASS:-}" ]]; then
  echo "ERRO: defina SMTP_PASS com a senha de app do Google Workspace."
  exit 1
fi

cp -a "${ENVF}" "${ENVF}.bak.$(date +%Y%m%d%H%M%S)"

python3 - <<PY
from pathlib import Path
path = Path("${ENVF}")
text = path.read_text(encoding="utf-8")
updates = {
    "SMTP_HOST": "smtp.gmail.com",
    "SMTP_PORT": "587",
    "SMTP_USER": "${EMAIL}",
    "SMTP_PASS": """${SMTP_PASS}""",
    "SMTP_FROM": "${FROM_VALUE}",
    "SMTP_SSL": "false",
    "SMTP_START_TLS": "REQUIRED",
}
lines = text.splitlines()
seen = set()
out = []
for line in lines:
    if not line or line.lstrip().startswith("#") or "=" not in line:
        out.append(line)
        continue
    key, _, _ = line.partition("=")
    key = key.strip()
    if key in updates:
        out.append(f"{key}={updates[key]}")
        seen.add(key)
    else:
        out.append(line)
for key, value in updates.items():
    if key not in seen:
        out.append(f"{key}={value}")
path.write_text("\n".join(out) + "\n", encoding="utf-8")
print("OK: SMTP Workspace gravado em", path)
PY

chmod 600 "${ENVF}"

cd "${INSTALL_DIR}"
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.vultr.yml up -d --force-recreate --no-deps app

echo "OK: container app recriado. Teste um cadastro e confira o From: ${EMAIL}"
