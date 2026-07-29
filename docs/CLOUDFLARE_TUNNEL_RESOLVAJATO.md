# Cloudflare Tunnel — Resolva Jato (conta Aero Suite)

## Conta correta

| Item | Valor |
|------|--------|
| Conta | `Sistema@aerosuite.com.br's Account` |
| Account ID | `44a7c31ca337648abef38dea0c599e79` |
| Tunnel | **`resolvajato`** (novo) |
| Tunnel ID | `3f99aa58-2811-4cd2-9b0b-a0819ee70242` |
| CNAME | `3f99aa58-2811-4cd2-9b0b-a0819ee70242.cfargotunnel.com` |
| Origem | `http://127.0.0.1:3000` |
| Config | `%USERPROFILE%\.cloudflared\config-resolvajato.yml` |

> Não usa o tunnel antigo `6d599ea8-…` (outra conta / homolog local Aero Suite).

## DNS

- `resolvajato.com.br` → CNAME tunnel (proxied)
- `www.resolvajato.com.br` → CNAME tunnel (proxied)
- `staging.resolvajato.com.br` → CNAME tunnel (proxied) · homolog i18n → `http://127.0.0.1:3001`

## Staging (homolog i18n)

Hostname: `https://staging.resolvajato.com.br` → `http://127.0.0.1:3001`

1. DNS `staging.resolvajato.com.br` CNAME → `3f99aa58-2811-4cd2-9b0b-a0819ee70242.cfargotunnel.com` (proxied).
2. **Config remota do tunnel** (obrigatória): o conector no VPS recebe ingress da Cloudflare e sobrescreve o YAML local. Inclua `staging.resolvajato.com.br` → `http://127.0.0.1:3001` na config do tunnel `resolvajato` (Zero Trust / Networks → Tunnels, ou API `cfd_tunnel/.../configurations`).
3. Manter também `scripts/deploy/cloudflared-config.resolvajato.yml` alinhado no VPS (`/etc/cloudflared-resolvajato/config.yml`) como fallback/documentação.
4. Cloudflare Access:
   - App `Resolva Jato Staging` em `staging.resolvajato.com.br` (allow `@aerosuite.com.br`).
   - App bypass em `staging.resolvajato.com.br/api/webhooks/stripe` para o webhook Stripe test.
5. Stack: `/opt/resolva-jato-staging` · ver `DOCKER.md` e `docs/I18N-STAGING-QA.md`.
   Deploy: GitHub Action **Deploy Resolva Jato Vultr** → target `staging` (branch `feat/i18n-pt-en-es`).

## Nameservers no Registro.br

```
brynne.ns.cloudflare.com
tom.ns.cloudflare.com
```

## Subir o conector

```powershell
cloudflared --config $env:USERPROFILE\.cloudflared\config-resolvajato.yml tunnel run
```

(O serviço Windows `Cloudflared` continua com o tunnel antigo do Aero Suite; o Resolva Jato roda em processo separado.)

## App

```powershell
cd D:\Desenvolvimento\hub-recursos-gratis
npm run dev
```

Teste após propagação DNS: https://resolvajato.com.br
