#!/usr/bin/env bash
# Deploy Resolva Jato no Vultr (mesmo host do Aerosuite).
# Preserva segredos e aplica somente as variáveis públicas do corte de domínio.
# Uso: INSTALL_DIR=/opt/resolva-jato bash vultr-deploy-resolvajato.sh

set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/resolva-jato}"
TARBALL="${TARBALL:-/tmp/resolva-jato-repo.tgz}"

if [[ ! -f "${TARBALL}" ]]; then
  echo "ERRO: tarball ausente: ${TARBALL}"
  exit 1
fi

echo "==> Extrair codigo em ${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"

# Evita arquivos orfaos de deploys anteriores (quebram o build Docker).
if [[ -f "${INSTALL_DIR}/.env.production" ]]; then
  cp -a "${INSTALL_DIR}/.env.production" /tmp/resolva-jato.env.production.bak
fi
for state_file in .indexnow-sitemap.xml .indexnow-updated-urls.sha256; do
  if [[ -f "${INSTALL_DIR}/${state_file}" ]]; then
    cp -a "${INSTALL_DIR}/${state_file}" "/tmp/resolva-jato.${state_file}.bak"
  fi
done
find "${INSTALL_DIR}" -mindepth 1 -maxdepth 1 ! -name '.env.production' -exec rm -rf {} +
tar -xzf "${TARBALL}" -C "${INSTALL_DIR}"
if [[ ! -f "${INSTALL_DIR}/.env.production" && -f /tmp/resolva-jato.env.production.bak ]]; then
  cp -a /tmp/resolva-jato.env.production.bak "${INSTALL_DIR}/.env.production"
  chmod 600 "${INSTALL_DIR}/.env.production"
fi
for state_file in .indexnow-sitemap.xml .indexnow-updated-urls.sha256; do
  if [[ ! -f "${INSTALL_DIR}/${state_file}" && -f "/tmp/resolva-jato.${state_file}.bak" ]]; then
    cp -a "/tmp/resolva-jato.${state_file}.bak" "${INSTALL_DIR}/${state_file}"
  fi
done

cd "${INSTALL_DIR}"

if [[ ! -f .env.production ]]; then
  echo "ERRO: .env.production ausente em ${INSTALL_DIR}."
  echo "Envie o arquivo uma vez (setup) antes do deploy incremental."
  exit 1
fi

upsert_env() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" .env.production; then
    sed -i "s#^${key}=.*#${key}=${value}#" .env.production
  else
    printf '%s=%s\n' "${key}" "${value}" >> .env.production
  fi
}

# Corte canônico: o domínio antigo continua atendido pelo middleware e pelas APIs.
upsert_env DOMAIN precisoutapronto.com.br
upsert_env NEXT_PUBLIC_APP_URL https://precisoutapronto.com.br

# Publica os novos hostnames no mesmo túnel, sem remover os anteriores.
if [[ -d /etc/cloudflared-resolvajato ]] && command -v systemctl >/dev/null 2>&1; then
  bash "${INSTALL_DIR}/scripts/deploy/apply-cloudflared-resolvajato.sh"
else
  echo "AVISO: cloudflared local não encontrado; config do túnel não foi reaplicada."
fi

PUBLIC_APP_URL="$(sed -n 's/^NEXT_PUBLIC_APP_URL=//p' .env.production | tail -1 | tr -d '\r' | sed 's#/$##')"
PUBLIC_APP_URL="${PUBLIC_APP_URL:-https://precisoutapronto.com.br}"

COMPOSE=(
  docker compose
  --env-file .env.production
  -f docker-compose.yml
  -f docker-compose.vultr.yml
)

echo "==> Validar compose"
"${COMPOSE[@]}" config -q

echo "==> Build incremental apenas da aplicação"
"${COMPOSE[@]}" build app

echo "==> Subir serviços sem reconstrução adicional"
"${COMPOSE[@]}" up -d --no-build --remove-orphans

echo "==> Aguardar health do app"
ok=0
for _ in $(seq 1 60); do
  if curl -sf http://127.0.0.1:3000/ >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 5
done

if [[ "${ok}" -ne 1 ]]; then
  echo "ERRO: app nao respondeu em http://127.0.0.1:3000/"
  "${COMPOSE[@]}" ps
  docker logs resolva-jato-app --tail 80 || true
  exit 1
fi

curl -sfI http://127.0.0.1:3000/ | head -1
curl -sfI http://127.0.0.1:3000/robots.txt | head -1
curl -sfI http://127.0.0.1:3000/sitemap.xml | head -1
"${COMPOSE[@]}" ps
echo "==> Notificar mecanismos de busca via IndexNow"
PREVIOUS_SITEMAP_FILE="${INSTALL_DIR}/.indexnow-sitemap.xml"
CURRENT_SITEMAP_FILE="$(mktemp)"
INDEXNOW_URL_FILE="$(mktemp)"
UPDATED_URLS_FILE="${INSTALL_DIR}/scripts/seo/indexnow-updated-urls.txt"
UPDATED_HASH_FILE="${INSTALL_DIR}/.indexnow-updated-urls.sha256"

curl -sf "${PUBLIC_APP_URL}/sitemap.xml" -o "${CURRENT_SITEMAP_FILE}" || true
if [[ -s "${CURRENT_SITEMAP_FILE}" ]]; then
  grep -oE '<loc>[^<]+</loc>' "${CURRENT_SITEMAP_FILE}" | sed -E 's#</?loc>##g' | sort -u > "${CURRENT_SITEMAP_FILE}.urls"
  if [[ -s "${PREVIOUS_SITEMAP_FILE}" ]]; then
    grep -oE '<loc>[^<]+</loc>' "${PREVIOUS_SITEMAP_FILE}" | sed -E 's#</?loc>##g' | sort -u > "${PREVIOUS_SITEMAP_FILE}.urls"
    comm -13 "${PREVIOUS_SITEMAP_FILE}.urls" "${CURRENT_SITEMAP_FILE}.urls" >> "${INDEXNOW_URL_FILE}"
  fi
fi

CURRENT_UPDATED_HASH="$(sha256sum "${UPDATED_URLS_FILE}" 2>/dev/null | awk '{print $1}' || true)"
PREVIOUS_UPDATED_HASH="$(cat "${UPDATED_HASH_FILE}" 2>/dev/null || true)"
if [[ -n "${CURRENT_UPDATED_HASH}" && "${CURRENT_UPDATED_HASH}" != "${PREVIOUS_UPDATED_HASH}" ]]; then
  grep -vE '^[[:space:]]*(#|$)' "${UPDATED_URLS_FILE}" >> "${INDEXNOW_URL_FILE}"
fi

sort -u -o "${INDEXNOW_URL_FILE}" "${INDEXNOW_URL_FILE}"
if [[ -s "${INDEXNOW_URL_FILE}" ]]; then
  if docker run --rm \
    -v "${INSTALL_DIR}/scripts/seo/submit-indexnow.mjs:/tmp/submit-indexnow.mjs:ro" \
    -v "${INDEXNOW_URL_FILE}:/tmp/indexnow-urls.txt:ro" \
    --entrypoint node \
    resolva-jato-app:latest \
    /tmp/submit-indexnow.mjs --file /tmp/indexnow-urls.txt
  then
    echo "IndexNow: apenas URLs novas ou atualizadas foram enviadas."
    [[ -n "${CURRENT_UPDATED_HASH}" ]] && printf '%s\n' "${CURRENT_UPDATED_HASH}" > "${UPDATED_HASH_FILE}"
  else
    echo "AVISO: IndexNow nao respondeu; o deploy permanece ativo."
  fi
else
  echo "IndexNow: nenhuma URL nova ou atualizada; envio ignorado."
fi

[[ -s "${CURRENT_SITEMAP_FILE}" ]] && cp "${CURRENT_SITEMAP_FILE}" "${PREVIOUS_SITEMAP_FILE}"
rm -f "${CURRENT_SITEMAP_FILE}" "${CURRENT_SITEMAP_FILE}.urls" "${INDEXNOW_URL_FILE}" "${PREVIOUS_SITEMAP_FILE}.urls"
echo "OK - Precisou? Ta Pronto! em ${INSTALL_DIR} (localhost:3000; publico: ${PUBLIC_APP_URL})"
