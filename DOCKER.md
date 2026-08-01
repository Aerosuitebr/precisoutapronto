# Produção Docker — Resolva Jato

Stack: **Next.js + PostgreSQL + Caddy (HTTPS) + Evolution/WhatsApp**.

## Pré-requisitos

- Docker Engine + Docker Compose v2
- DNS de `resolvajato.com.br` (ou o valor de `DOMAIN`) apontando para o IP do VPS
- Portas **80** e **443** livres no host

## Subir

```bash
cp .env.production.example .env
# Edite .env: POSTGRES_PASSWORD, EVOLUTION_API_KEY, Mercado Pago produção, etc.

docker compose up -d --build
# ou: npm run docker:up
```

Aguarde o healthcheck do `app`. Certificado TLS é emitido automaticamente pelo Caddy.

## WhatsApp (Evolution)

1. Evolution fica só em `127.0.0.1:18083` no host (não na internet).
2. No servidor:

```bash
# .env com EVOLUTION_API_URL=http://127.0.0.1:18083 para o script no host
npm run whatsapp:setup
```

3. Escaneie o QR em **Minha conta** (ou via API de status).

O container `app` fala com a Evolution em `http://rj-evolution-api:8080` (rede Docker).

## Comandos úteis

| Comando | Ação |
|---------|------|
| `npm run docker:up` | Build + sobe em background |
| `npm run docker:down` | Para a stack |
| `npm run docker:logs` | Logs do app |
| `docker compose logs -f caddy` | Logs TLS / proxy |
| `docker compose ps` | Status dos serviços |

## Auth antifraude

No `.env` / `.env.production` do VPS:

```bash
# Sessão
openssl rand -hex 32   # cole em AUTH_SECRET=

# Turnstile (Cloudflare Dashboard → Turnstile → Add site)
TURNSTILE_SECRET_KEY=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
```

O entrypoint usa `PRISMA_SCHEMA_MODE` para controlar alterações no banco:

- `migrate` (forçado pelo overlay Vultr de produção e pelo compose de staging): executa `prisma migrate deploy`;
- `push` (padrão do compose base para desenvolvimento local): sincroniza o schema sem `--accept-data-loss`;
- `skip`: inicia a aplicação sem alterar o schema.

Produção e staging nunca devem usar `PRISMA_SCHEMA_MODE=push`. Para uma instalação totalmente nova, crie um baseline completo antes de usar somente as migrations incrementais atuais.

Contas antigas só em localStorage **não** migram — o usuário precisa cadastrar de novo e confirmar e-mail.

Deploy incremental após editar o `.env.production` no servidor (sem `-SkipEnv` na primeira vez com as novas vars):

```powershell
powershell -File scripts\deploy\setup-vultr-resolvajato.ps1
```

## Mercado Pago

Webhook de produção:

`https://resolvajato.com.br/api/webhooks/mercadopago`

Use credenciais de **produção** no `.env`.

## Dev local (WhatsApp só)

O arquivo `docker-compose.whatsapp.yml` continua válido para desenvolvimento:

```bash
npm run whatsapp:up
```

## Vultr (mesmo VPS do Aerosuite)

No Vultr **não** usamos Caddy (80/443). O padrão é o do Aerosuite: app só em localhost + Cloudflare Tunnel.

```powershell
cd D:\Desenvolvimento\hub-recursos-gratis
powershell -File scripts\deploy\setup-vultr-resolvajato.ps1
```

- Código: `/opt/resolva-jato`
- App: `127.0.0.1:3000`
- Tunnel: serviço `cloudflared-resolvajato` (não mexe no tunnel do Aerosuite)
- Overlay: `docker-compose.vultr.yml`
- Doc no Aerosuite: `D:\Desenvolvimento\aerosuite\scripts\deploy\RESOLVA-JATO-VULTR.md`

Deploy incremental (sem reenviar .env / tunnel):

```powershell
powershell -File scripts\deploy\setup-vultr-resolvajato.ps1 -SkipEnv -SkipTunnel
```

Fluxo completo via GitHub Actions (staging + E2E + producao automatica), com barra de progresso:

```bat
DeployMaster.bat
```

Opcoes: `DeployMaster.bat -StagingOnly` · `DeployMaster.bat -Branch nome-da-branch` · `DeployMaster.bat -SkipPush` · `DeployMaster.bat -SkipCommit`

## Staging / homolog i18n

Stack paralelo no mesmo VPS (sem Evolution), porta **3001**:

```bash
# No servidor: /opt/resolva-jato-staging
cp .env.staging.example .env.staging
# Preencha Stripe test, AUTH_SECRET, POSTGRES_PASSWORD

docker compose --env-file .env.staging \
  -f docker-compose.staging.yml -p resolva-jato-staging up -d --build
```

- Hostname: `https://staging.resolvajato.com.br`
- Checklist: [`docs/I18N-STAGING-QA.md`](docs/I18N-STAGING-QA.md)
- Deploy Action: **Deploy Resolva Jato Vultr** → target `staging`
- Tunnel: incluir hostname em [`scripts/deploy/cloudflared-config.resolvajato.yml`](scripts/deploy/cloudflared-config.resolvajato.yml)
