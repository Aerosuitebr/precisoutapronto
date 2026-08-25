# Cloudflare Tunnel — Precisou, Tá Pronto (conta Aero Suite)

## Conta correta

| Item | Valor |
|------|--------|
| Conta | `Sistema@aerosuite.com.br's Account` |
| Account ID | `44a7c31ca337648abef38dea0c599e79` |
| Tunnel | **`precisoutapronto`** (novo) |
| Tunnel ID | `3f99aa58-2811-4cd2-9b0b-a0819ee70242` |
| CNAME | `3f99aa58-2811-4cd2-9b0b-a0819ee70242.cfargotunnel.com` |
| Origem | `http://127.0.0.1:3000` |
| Config | `%USERPROFILE%\.cloudflared\config-precisoutapronto.yml` |

> Não usa o tunnel antigo `6d599ea8-…` (outra conta / homolog local Aero Suite).

## DNS

- `precisoutapronto.com.br` → CNAME tunnel (proxied)
- `www.precisoutapronto.com.br` → CNAME tunnel (proxied)
- `staging.precisoutapronto.com.br` → CNAME tunnel (proxied) · homolog i18n → `http://127.0.0.1:3001`

## Staging (homolog i18n)

Hostname: `https://staging.precisoutapronto.com.br` → `http://127.0.0.1:3001`

1. DNS `staging.precisoutapronto.com.br` CNAME → `3f99aa58-2811-4cd2-9b0b-a0819ee70242.cfargotunnel.com` (proxied).
2. **Config remota do tunnel** (obrigatória): o conector no VPS recebe ingress da Cloudflare e sobrescreve o YAML local. Inclua `staging.precisoutapronto.com.br` → `http://127.0.0.1:3001` na config do tunnel `precisoutapronto` (Zero Trust / Networks → Tunnels, ou API `cfd_tunnel/.../configurations`).
3. Manter também `scripts/deploy/cloudflared-config.precisoutapronto.yml` alinhado no VPS (`/etc/cloudflared-precisoutapronto/config.yml`) como fallback/documentação.
4. Cloudflare Access:
   - App `Precisou, Tá Pronto Staging` em `staging.precisoutapronto.com.br` (allow `@aerosuite.com.br`).
   - App bypass em `staging.precisoutapronto.com.br/api/webhooks/stripe` para o webhook Stripe test.
5. Stack: `/opt/precisoutapronto-staging` · ver `DOCKER.md` e `docs/I18N-STAGING-QA.md`.
   Deploy: GitHub Action **Deploy Precisou, Tá Pronto Vultr** → target `staging` (branch `feat/i18n-pt-en-es`).

## Nameservers no Registro.br

```
brynne.ns.cloudflare.com
tom.ns.cloudflare.com
```

## Subir o conector

```powershell
cloudflared --config $env:USERPROFILE\.cloudflared\config-precisoutapronto.yml tunnel run
```

(O serviço Windows `Cloudflared` continua com o tunnel antigo do Aero Suite; o Precisou, Tá Pronto roda em processo separado.)

## App

```powershell
cd D:\Desenvolvimento\hub-recursos-gratis
npm run dev
```

Teste após propagação DNS: https://precisoutapronto.com.br
