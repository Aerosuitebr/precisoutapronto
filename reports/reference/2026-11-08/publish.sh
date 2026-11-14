#!/usr/bin/env bash
set -euo pipefail
cd /opt/precisoutapronto
backup=/opt/precisoutapronto-backups/reference-20261108
previous_image=precisoutapronto-reference-before:20261108
compose=(docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.vultr.yml)
mapfile -t files < /tmp/reference-20261108-files.txt
test "${#files[@]}" = 13
test "$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}' resolva-jato-app)" = /opt/precisoutapronto
test "$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.service" }}' resolva-jato-app)" = app
sha256sum -c /tmp/reference-20261108-before.sha256
test ! -e src/components/marketing/professional-start-guide.tsx
test ! -e "$backup"
mkdir -p "$backup"
tar -czf "$backup/source-before.tgz" "${files[@]:0:12}"
docker inspect --format '{{.Image}}' resolva-jato-app > "$backup/image-before.txt"
docker image tag "$(cat "$backup/image-before.txt")" "$previous_image"
rollback() {
  tar -xzf "$backup/source-before.tgz" -C /opt/precisoutapronto
  rm -f src/components/marketing/professional-start-guide.tsx
  docker image tag "$previous_image" resolva-jato-app:latest
  "${compose[@]}" up -d --no-deps --no-build app
}
trap 'rollback' ERR
tar -xzf /tmp/precisoutapronto-reference-20261108.tgz -C /opt/precisoutapronto --no-same-owner "${files[@]}"
"${compose[@]}" config -q
"${compose[@]}" build app
"${compose[@]}" up -d --no-deps --no-build app
healthy=0
for attempt in $(seq 1 40); do
  if [ "$(docker inspect --format '{{.State.Health.Status}}' resolva-jato-app)" = healthy ]; then healthy=1; break; fi
  sleep 3
done
test "$healthy" = 1
curl -fsS http://127.0.0.1:3000/ > "$backup/home-after.html"
grep -Fq 'Seu orçamento profissional,' "$backup/home-after.html"
grep -Fq 'Ver como o cliente recebe' "$backup/home-after.html"
curl -fsS http://127.0.0.1:3000/planos > "$backup/pricing-after.html"
grep -Fq 'O que muda com a conta e com o Premium?' "$backup/pricing-after.html"
trap - ERR
echo "Published and verified. Backup: $backup"
