#!/usr/bin/env bash
set -euo pipefail
cd /opt/precisoutapronto
patch=/tmp/precisoutapronto-seo-20261007.patch
backup=/opt/precisoutapronto-backups/seo-20261007
previous_image=precisoutapronto-seo-before:20261007
compose=(docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.vultr.yml)
files=(src/app/imprensa/page.tsx 'src/app/recibos/[slug]/page.tsx' src/app/recibos/page.tsx src/app/sobre/page.tsx src/lib/brand.ts src/lib/seo/authority-assets.ts src/lib/seo/receipt-cluster.ts src/lib/seo/sitemap-entries.ts)
# The container retains the old brand name; verify its project and public identity.
test "$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}' resolva-jato-app)" = /opt/precisoutapronto
test "$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.service" }}' resolva-jato-app)" = app
identity_html=$(curl -fsS http://127.0.0.1:3000/)
grep -Fq '<link rel="canonical" href="https://precisoutapronto.com.br"' <<< "$identity_html"
git apply --check "$patch"
test ! -e "$backup"
mkdir -p "$backup"
tar -czf "$backup/source-before.tgz" "${files[@]}"
docker inspect --format '{{.Image}}' resolva-jato-app > "$backup/image-before.txt"
docker image tag "$(cat "$backup/image-before.txt")" "$previous_image"
git apply "$patch"
rollback() {
  echo 'Restoring previous source and application image.'
  tar -xzf "$backup/source-before.tgz" -C /opt/precisoutapronto
  docker image tag "$previous_image" resolva-jato-app:latest
  "${compose[@]}" up -d --no-deps --no-build app
}
trap 'rollback' ERR
"${compose[@]}" config -q
"${compose[@]}" build app
"${compose[@]}" up -d --no-deps --no-build app
healthy=0
for attempt in $(seq 1 40); do
  if [ "$(docker inspect --format '{{.State.Health.Status}}' resolva-jato-app)" = healthy ]; then
    healthy=1
    break
  fi
  sleep 3
done
test "$healthy" = 1
curl -fsS http://127.0.0.1:3000/recibos/recibo-pagamento-pix > "$backup/receipt-after.html"
grep -q 'Recibo de Pix em PDF grátis: modelo sem cadastro' "$backup/receipt-after.html"
curl -fsS http://127.0.0.1:3000/sitemaps/growth > "$backup/growth-after.xml"
test "$(grep -o '<loc>https://precisoutapronto.com.br/para/freelancers</loc>' "$backup/growth-after.xml" | wc -l)" = 1
trap - ERR
echo "Published and verified. Backup: $backup"
