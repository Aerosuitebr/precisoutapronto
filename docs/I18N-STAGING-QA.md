# Staging i18n · checklist de homologação

Hostname: `https://staging.resolvajato.com.br`  
Branch: `feat/i18n-pt-en-es`  
Env: `APP_ENV=staging` (noindex obrigatório)

## Pré-requisitos no VPS

1. Copiar [`.env.staging.example`](../.env.staging.example) → `/opt/resolva-jato-staging/.env.staging` e preencher.
2. DNS Cloudflare: `staging.resolvajato.com.br` (proxied) no mesmo tunnel.
3. Atualizar config do tunnel com [`scripts/deploy/cloudflared-config.resolvajato.yml`](../scripts/deploy/cloudflared-config.resolvajato.yml) e reiniciar `cloudflared`.
4. Cloudflare Access (Zero Trust) no hostname `staging.resolvajato.com.br` (e-mails do time).
5. Deploy: GitHub Action **Deploy Resolva Jato Vultr** → target `staging`.

## Checklist QA

### SEO / isolamento

- [ ] `GET /robots.txt` → `Disallow: /`
- [ ] Resposta HTML com `X-Robots-Tag: noindex, nofollow, noarchive`
- [ ] `GET /sitemap.xml` → vazio (`[]` / sem URLs)
- [ ] Staging **não** aparece no IndexNow/prod

### PT (regressão)

- [ ] Home `/` igual ao comportamento esperado (header, CTA, tools)
- [ ] Locale switcher presente e navega para `/en` e `/es`
- [ ] Login / cadastro / conta em PT
- [ ] Uma tool pública (ex. currículo) e uma autenticada

### EN

- [ ] `/en` carrega landing internacional
- [ ] `/en/tools` e 2 tools (ex. resume + quote-pix)
- [ ] `/en/plans`, `/en/login`, `/en/cadastro`
- [ ] Switcher volta para PT e ES
- [ ] Canonical / hreflang coerentes (inspect metadata)

### ES

- [ ] `/es` carrega landing
- [ ] `/es/tools` + 1 tool
- [ ] Auth ES (`/es/login`, `/es/cadastro`)

### Billing Stripe test

- [ ] Checkout EN com `STRIPE_PRICE_PREMIUM_EN` (modo test)
- [ ] Checkout ES com `STRIPE_PRICE_PREMIUM_ES`
- [ ] Webhook `https://staging.resolvajato.com.br/api/webhooks/stripe` recebe evento test
- [ ] Confirm premium no account EN/ES após pagamento test

### Build / runtime

- [ ] Container `resolva-jato-staging-app` healthy
- [ ] Postgres staging separado (não misturar com prod)
- [ ] Sem Evolution no staging

## Critério de go-live

Todos os itens acima OK → merge `feat/i18n-pt-en-es` → `master` → deploy **production**.  
Só então liberar indexação EN/ES no sitemap de produção (já listadas; staging permanece noindex).
