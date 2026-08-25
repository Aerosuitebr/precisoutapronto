#!/usr/bin/env bash
# Limpa sinais de antifraude que bloqueiam um cadastro (cooldown/rate limit).
# Uso no servidor: EMAIL=contato@aerosuite.com.br bash scripts/ops/liberate-signup.sh
set -euo pipefail

EMAIL="${EMAIL:?Defina EMAIL=...}"
if [[ ! "${EMAIL}" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
  echo "ERRO: e-mail inválido: ${EMAIL}"
  exit 1
fi
INSTALL_DIR="${INSTALL_DIR:-/opt/precisoutapronto}"
cd "${INSTALL_DIR}"

COMPOSE=(
  docker compose
  --env-file .env.production
  -f docker-compose.yml
  -f docker-compose.vultr.yml
)

PG_USER="$("${COMPOSE[@]}" exec -T postgres printenv POSTGRES_USER | tr -d '\r')"
PG_DB="$("${COMPOSE[@]}" exec -T postgres printenv POSTGRES_DB | tr -d '\r')"
PG_USER="${PG_USER:-precisoutapronto}"
PG_DB="${PG_DB:-precisoutapronto}"

echo "==> Liberando cadastro para ${EMAIL}"

"${COMPOSE[@]}" exec -T postgres psql -v ON_ERROR_STOP=1 -U "${PG_USER}" -d "${PG_DB}" <<SQL
CREATE TEMP TABLE liberate_targets AS
SELECT DISTINCT
  NULLIF(TRIM(ip), '') AS ip,
  NULLIF(TRIM("deviceId"), '') AS device_uuid
FROM audit_logs
WHERE lower(email) = lower('${EMAIL}')
  AND event IN (
    'register_cooldown',
    'rate_block_register',
    'register_blocked_risk',
    'blacklist_hit'
  )
  AND "createdAt" >= NOW() - INTERVAL '7 days';

-- Fallback: último cooldown recente se o e-mail ainda não entrou no audit
INSERT INTO liberate_targets (ip, device_uuid)
SELECT DISTINCT
  NULLIF(TRIM(ip), ''),
  NULLIF(TRIM("deviceId"), '')
FROM audit_logs
WHERE event = 'register_cooldown'
  AND "createdAt" >= NOW() - INTERVAL '24 hours'
  AND NOT EXISTS (SELECT 1 FROM liberate_targets)
LIMIT 5;

SELECT 'targets' AS step, * FROM liberate_targets;

-- Remove vínculos do cookie de dispositivo (mesmo browser com conta anterior)
DELETE FROM device_cookie_links dcl
USING device_cookies dc, liberate_targets t
WHERE dcl."deviceCookieId" = dc.id
  AND t.device_uuid IS NOT NULL
  AND dc.uuid = t.device_uuid;

-- Rate limit por IP
DELETE FROM rate_limit_buckets r
USING liberate_targets t
WHERE t.ip IS NOT NULL
  AND r.key = 'register:ip:' || t.ip;

-- Blacklist de IP/device/e-mail/domínio
DELETE FROM blacklist_entries b
USING liberate_targets t
WHERE
  (b.type = 'ip' AND t.ip IS NOT NULL AND lower(b.value) = lower(t.ip))
  OR (b.type = 'device' AND t.device_uuid IS NOT NULL AND lower(b.value) = lower(t.device_uuid));

DELETE FROM blacklist_entries
WHERE type = 'email' AND lower(value) = lower('${EMAIL}');

DELETE FROM blacklist_entries
WHERE type = 'domain' AND lower(value) = lower(split_part('${EMAIL}', '@', 2));

-- Zera sinais de "same_ip" nas últimas 24h para os IPs alvo
DELETE FROM audit_logs a
USING liberate_targets t
WHERE a.event = 'register'
  AND t.ip IS NOT NULL
  AND a.ip = t.ip
  AND a."createdAt" >= NOW() - INTERVAL '24 hours';

INSERT INTO audit_logs (id, event, email, ip, "deviceId", meta, "createdAt")
SELECT
  md5(random()::text || clock_timestamp()::text),
  'admin_liberate_signup',
  lower('${EMAIL}'),
  t.ip,
  t.device_uuid,
  jsonb_build_object('reason', 'ops_liberate_signup'),
  NOW()
FROM liberate_targets t
LIMIT 1;

SELECT 'done' AS step, lower('${EMAIL}') AS email;
SQL

echo "==> Pronto. Tente Criar conta de novo."
