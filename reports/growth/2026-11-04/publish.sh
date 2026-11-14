#!/usr/bin/env bash
set -euo pipefail
cd /opt/precisoutapronto
package=/tmp/precisoutapronto-growth-20261104.tgz
backup=/opt/precisoutapronto-backups/growth-20261104
previous_image=precisoutapronto-growth-before:20261104
compose=(docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.vultr.yml)
files=(src/app/gerador-de-recibo/recibo-live-preview.tsx 'src/app/recibos/[slug]/page.tsx' src/lib/seo/receipt-cluster.ts src/lib/seo/sitemap-entries.ts)
test "$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}' resolva-jato-app)" = /opt/precisoutapronto
test "$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.service" }}' resolva-jato-app)" = app
identity_html=$(curl -fsS http://127.0.0.1:3000/)
grep -Fq 'https://precisoutapronto.com.br' <<< "$identity_html"
sha256sum --check <<'HASHES'
96d5dee2413166450233231afad8779024f6fc912471dab811d76530427363f9  src/app/gerador-de-recibo/recibo-live-preview.tsx
54f50338671b9db20cc9c03a0b62c638029fb6b298017d7ee41d99c24f569c43  src/app/recibos/[slug]/page.tsx
90c6f50686106dde39b9ca11873d67b425bb13547263e092bece2312cef530b1  src/lib/seo/receipt-cluster.ts
3915812d67ae00d179a1c5f20de5fe1261ed77074e9d49045650a3aa298f5ce7  src/lib/seo/sitemap-entries.ts
HASHES
test ! -e "$backup"
mkdir -p "$backup"
tar -czf "$backup/source-before.tgz" "${files[@]}"
docker inspect --format '{{.Image}}' resolva-jato-app > "$backup/image-before.txt"
docker image tag "$(cat "$backup/image-before.txt")" "$previous_image"
rollback() {
  echo 'Restoring source and previous app image.'
  tar -xzf "$backup/source-before.tgz" -C /opt/precisoutapronto
  docker image tag "$previous_image" resolva-jato-app:latest
  "${compose[@]}" up -d --no-deps --no-build app
}
trap 'rollback' ERR
tar -xzf "$package" -C /opt/precisoutapronto --no-same-owner "${files[@]}"
"${compose[@]}" config -q
"${compose[@]}" build app
"${compose[@]}" up -d --no-deps --no-build app
healthy=0
for attempt in $(seq 1 40); do
  if [ "$(docker inspect --format '{{.State.Health.Status}}' resolva-jato-app)" = healthy ]; then healthy=1; break; fi
  sleep 3
done
test "$healthy" = 1
curl -fsS http://127.0.0.1:3000/recibos/recibo-pagamento-pix > "$backup/receipt-after.html"
grep -Fq 'id="emitir-recibo"' "$backup/receipt-after.html"
grep -Fq 'Preencha e baixe seu recibo aqui' "$backup/receipt-after.html"
grep -Fq 'Recibo de Pix em PDF grátis: modelo sem cadastro' "$backup/receipt-after.html"
trap - ERR
echo "Published and verified. Backup: $backup"
