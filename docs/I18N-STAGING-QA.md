# Staging i18n · checklist de homologação

Hostname: `https://staging.resolvajato.com.br`  
Branch: `feat/i18n-pt-en-es`  
Env: `APP_ENV=staging` (noindex obrigatório)

## Pré-requisitos no VPS

1. Copiar [`.env.staging.example`](../.env.staging.example) → `/opt/resolva-jato-staging/.env.staging` e preencher.
2. DNS Cloudflare: `staging.resolvajato.com.br` (proxied) no mesmo tunnel.
3. Ingress **remoto** do tunnel com porta 3001 (YAML local sozinho não basta).
4. Cloudflare Access no hostname `staging.resolvajato.com.br` (e-mails `@aerosuite.com.br`) + bypass do path `/api/webhooks/stripe`.
5. Deploy: GitHub Action **Deploy Resolva Jato Vultr** → target `staging`.

## Checklist QA

### SEO / isolamento

- [x] `GET /robots.txt` → `Disallow: /`
- [x] Resposta HTML com `X-Robots-Tag: noindex, nofollow, noarchive`
- [x] `GET /sitemap.xml` → vazio (sem `<loc>`)
- [x] Staging **não** aparece no IndexNow/prod (analytics desligados no compose staging)

### PT (regressão)

- [x] Home `/` 200 + noindex
- [x] Tools PT (`/gerador-de-curriculo`, `/orcamento-com-pix`) 200
- [x] Login / cadastro PT 200
- [ ] Locale switcher round-trip manual no browser (após login Access)
- [ ] Uma tool autenticada (conta staging) manual

### EN

- [x] `/en` 200 + copy EN
- [x] `/en/tools`, `/en/tools/resume`, `/en/tools/quote-pix` 200
- [x] `/en/plans`, `/en/login`, `/en/cadastro` 200
- [ ] Switcher / hreflang inspeção visual no browser
- [ ] Checkout Stripe test EN (manual, cartão test)

### ES

- [x] `/es` 200 + copy ES
- [x] `/es/tools`, `/es/tools/resume` 200
- [x] Auth ES (`/es/login`, `/es/cadastro`) 200
- [ ] Checkout Stripe test ES (manual)

### Billing Stripe test

- [x] Prices test EN/ES criados (`STRIPE_PRICE_PREMIUM_EN/ES` no `.env.staging`)
- [x] Webhook endpoint staging criado no Stripe (test mode)
- [x] Bypass Access no path do webhook
- [ ] Pagamento test end-to-end + premium na conta (manual)

### Build / runtime

- [x] Container `resolva-jato-staging-app` healthy
- [x] Postgres staging separado
- [x] Sem Evolution no staging
- [x] Deploy Action target `staging` OK (após fix sem `migrate deploy`)

## Critério de go-live

Itens automáticos acima OK. Falta só o round-trip manual (Access login + checkout Stripe test EN/ES).  
Quando fechar: merge `feat/i18n-pt-en-es` → `master` → deploy **production**.  
Staging permanece noindex.
