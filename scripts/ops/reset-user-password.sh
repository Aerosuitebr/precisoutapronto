#!/usr/bin/env bash
# Redefine senha de um usuário em produção.
# Uso: EMAIL=... PASSWORD_HASH='scrypt$...' bash scripts/ops/reset-user-password.sh
set -euo pipefail

EMAIL="${EMAIL:?Defina EMAIL=...}"
PASSWORD_HASH="${PASSWORD_HASH:?Defina PASSWORD_HASH=...}"

if [[ ! "${EMAIL}" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
  echo "ERRO: e-mail inválido: ${EMAIL}"
  exit 1
fi

if [[ ! "${PASSWORD_HASH}" =~ ^scrypt\$[0-9a-f]+\$[0-9a-f]+$ ]]; then
  echo "ERRO: PASSWORD_HASH inválido (esperado scrypt\$salt\$hash)"
  exit 1
fi

INSTALL_DIR="${INSTALL_DIR:-/opt/resolva-jato}"
cd "${INSTALL_DIR}"

COMPOSE=(
  docker compose
  --env-file .env.production
  -f docker-compose.yml
  -f docker-compose.vultr.yml
)

PG_USER="$("${COMPOSE[@]}" exec -T postgres printenv POSTGRES_USER | tr -d '\r')"
PG_DB="$("${COMPOSE[@]}" exec -T postgres printenv POSTGRES_DB | tr -d '\r')"
PG_USER="${PG_USER:-resolvajato}"
PG_DB="${PG_DB:-resolvajato}"

echo "==> Redefinindo senha de ${EMAIL}"

# Escapa aspas simples para SQL literal
EMAIL_SQL="${EMAIL//\'/\'\'}"
HASH_SQL="${PASSWORD_HASH//\'/\'\'}"

"${COMPOSE[@]}" exec -T postgres psql -v ON_ERROR_STOP=1 -U "${PG_USER}" -d "${PG_DB}" <<SQL
UPDATE users
SET
  "passwordHash" = '${HASH_SQL}',
  "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()),
  "updatedAt" = NOW()
WHERE lower(email) = lower('${EMAIL_SQL}');

DO \$\$
DECLARE
  n integer;
BEGIN
  SELECT COUNT(*) INTO n FROM users WHERE lower(email) = lower('${EMAIL_SQL}');
  IF n <> 1 THEN
    RAISE EXCEPTION 'user_not_found: %', lower('${EMAIL_SQL}');
  END IF;
END
\$\$;

DELETE FROM user_sessions
WHERE "userId" IN (
  SELECT id FROM users WHERE lower(email) = lower('${EMAIL_SQL}')
);

INSERT INTO audit_logs (id, event, email, meta, "createdAt")
VALUES (
  md5(random()::text || clock_timestamp()::text),
  'admin_reset_password',
  lower('${EMAIL_SQL}'),
  jsonb_build_object('reason', 'ops_reset_user_password'),
  NOW()
);

SELECT 'updated' AS status, lower('${EMAIL_SQL}') AS email;
SQL

echo "==> Pronto. Faça login com a nova senha."
