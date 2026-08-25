# Google Workspace · Precisou, Tá Pronto

Caixa oficial: `contato@precisoutapronto.com.br`  
SMTP do app: `smtp.gmail.com:587` (senha de app)  
Playbook para entregabilidade, marca e descoberta.

## 1) DNS (Cloudflare)

No Admin do Google Workspace, conclua a verificação do domínio e publique:

| Tipo | Nome | Valor (exemplo) |
|------|------|-----------------|
| MX | `@` | registros MX do Google (prioridades oficiais) |
| TXT | `@` | SPF: `v=spf1 include:_spf.google.com ~all` |
| TXT / CNAME | DKIM | gerado no Admin (Apps > Gmail > Autenticar e-mail) |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contato@precisoutapronto.com.br` (suba para `quarantine` depois de validar) |

Não misture SPF de outros provedores no mesmo TXT sem unificar. Se Resend também autenticar o domínio, combine includes no mesmo SPF.

Confirme no [MX Toolbox](https://mxtoolbox.com/) ou no Admin que MX/SPF/DKIM estão verdes.

## 2) Senha de app e `.env` no VPS

1. Conta `contato@precisoutapronto.com.br` com 2FA.
2. Conta Google > Segurança > Senhas de app > gerar para “Precisou, Tá Pronto SMTP”.
3. Em produção (`/opt/precisoutapronto/.env`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@precisoutapronto.com.br
SMTP_PASS=<senha-de-app>
SMTP_FROM=Precisou, Tá Pronto <contato@precisoutapronto.com.br>
SMTP_SSL=false
SMTP_START_TLS=REQUIRED
```

4. Deixe `RESEND_API_KEY` vazio se for usar só Workspace (o app prioriza Resend quando a key existe).
5. Rebuild / redeploy para o container ler o env:

```bash
# no servidor, conforme DOCKER.md / scripts de deploy
docker compose -f docker-compose.yml -f docker-compose.vultr.yml up -d --build
```

Staging (`/opt/precisoutapronto-staging`): mesma caixa, com `SMTP_FROM=Precisou, Tá Pronto Staging <contato@precisoutapronto.com.br>`.

**Nunca** commitar `SMTP_PASS`.

## 3) Teste de entrega

1. Cadastre um e-mail real em produção (ou staging).
2. Confirme que a mensagem de verificação chega de `contato@precisoutapronto.com.br`.
3. Cabeçalhos: autenticação SPF/DKIM/DMARC passa.
4. Se cair em spam: revise SPF único, DKIM ativo e volume (Workspace SMTP tem cotas diárias).

## 4) Search Console e Analytics

1. Propriedade de **domínio** `precisoutapronto.com.br` (já verificada).
2. Enviar sitemaps: `/sitemap.xml` e `/sitemaps/index.xml`.
3. Seguir a fila em [`GSC-FILA-INDEXACAO.md`](./GSC-FILA-INDEXACAO.md).
4. No GA4, vincular Search Console (origem orgânica + landings).
5. Conferir no ar: `/robots.txt` (com `# LLM context`), `/llms.txt`, `/.well-known/security.txt`.

Detalhes: [`ANALYTICS-SEO.md`](../ANALYTICS-SEO.md) e [`GSC-DOMINIO-NOVO.md`](./GSC-DOMINIO-NOVO.md).

## 5) Google Business Profile (opcional)

Produto digital, sem loja física:

- Categoria: software / ferramentas online
- Área de serviço: Brasil (sem endereço inventado)
- Site: `https://precisoutapronto.com.br`
- E-mail: `contato@precisoutapronto.com.br`
- Descrição alinhada a `/sobre`

Só publique se for manter reviews e respostas. Caso contrário, foque GSC + e-mail autenticado + Product Hunt.

## 6) Assinatura Gmail e outreach

Assinatura sugerida (sem travessão):

```text
Precisou, Tá Pronto
Ferramentas online grátis para MEI, freelancer e estudo
https://precisoutapronto.com.br/?utm_source=email&utm_medium=signature&utm_campaign=workspace
contato@precisoutapronto.com.br
```

Copies e UTMs: [`KIT-DISTRIBUICAO-VIRAL.md`](../KIT-DISTRIBUICAO-VIRAL.md) e [`EXECUCAO-PRONTA.md`](./EXECUCAO-PRONTA.md).

## Checklist rápido

- [x] MX Google no DNS (`smtp.google.com`)
- [x] DKIM `google._domainkey` publicado
- [ ] SPF TXT no apex: `v=spf1 include:_spf.google.com ~all` (**faltando**)
- [ ] DMARC TXT em `_dmarc`: `v=DMARC1; p=none; rua=mailto:contato@precisoutapronto.com.br` (**faltando**)
- [ ] Senha de app na conta `contato@` (**local `.env` rejeitou login 535 em 2026-08-01; VPS `.env.production` OK**)
- [x] `.env.production` no VPS com `SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` Workspace (outreach 10/10 enviado em 2026-08-01)
- [ ] E-mail de verificação chega na caixa de entrada (From `contato@precisoutapronto.com.br`)
- [ ] Sitemaps enviados no GSC (domínio): `/sitemap.xml` + `/sitemaps/index.xml`
- [ ] GA4 vinculado ao GSC
- [x] `security.txt`, JSON-LD com e-mail e `/contato` no ar (deploy 30/jul)
- [x] IndexNow reenviado no deploy (159 URLs)
- [ ] (Opcional) Google Business Profile área de serviço

### Cloudflare · colar agora (DNS → Records)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | DNS only |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contato@precisoutapronto.com.br` | DNS only |

Se já existir outro TXT SPF no apex, **unifique** num único registro (não crie dois `v=spf1`).
