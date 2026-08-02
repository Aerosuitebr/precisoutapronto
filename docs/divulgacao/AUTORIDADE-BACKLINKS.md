# Autoridade e backlinks · execução

Objetivo: conquistar menções e links editoriais para páginas internas (não só a home).

## Ativos públicos (já no site)

| URL | Uso |
|---|---|
| `/imprensa` | Press kit, boilerplates, ângulos de pauta |
| `/embed` | Badges SVG + HTML/Markdown com UTM |
| `/checklist-cobranca-mei` | Conteúdo citável para MEI |
| `/sobre` | Fatos e como citar |
| Ferramentas âncora | rescisão, MEI/CLT, Pix, ENEM, ABNT |

## Sequência semanal (humana)

1. Enviar lote do dia com `node --env-file=.env scripts/seo/send-outreach-day.mjs --send` (lista em `outreach-day-YYYY-MM-DD.json`).
2. Oferecer guest post com outline (usar também `21-br-outreach-guestpost.txt`).
3. Pedir menção com link para página interna específica, nunca genérica demais.
4. Para blogs/cursos: colar badge de `/embed` (gera backlink rastreável via UTM).
5. Registrar no GSC: links externos → páginas de destino.

### Lote 2026-08-01

**Status:** ENVIADO (10/10 via SMTP `contato@resolvajato.com.br` no VPS)  
**Log:** `docs/divulgacao/logs/outreach-2026-08-01.json`

Destinos: Melhor RH, Revista Comunicação, Guia do Estudante, Portal Empreendedor, Junior Achievement Brasil, Sebrae SP/MS/MT/PI/SC.

### Follow-up 2026-08-01 (enviado)

**Status:** ENVIADO 10/10 via SMTP no container `resolva-jato-app`  
**Lista:** `docs/divulgacao/outreach-followup-2026-08-04.json`  
**Log:** `docs/divulgacao/logs/outreach-2026-08-01-followup.json`  
**Pedido:** link para página interna (não a home), com `Re:` + `In-Reply-To`

| Destino | URL pedida |
|---|---|
| Melhor RH | `/calculadora-de-rescisao` |
| Revista Comunicação | `/checklist-cobranca-mei` |
| Guia do Estudante | `/corretor-de-redacao-enem` (+ currículo) |
| Portal Empreendedor | `/checklist-cobranca-mei` |
| JA Brasil | `/gerador-de-curriculo` |
| Sebrae SP | `/checklist-cobranca-mei` |
| Sebrae MS | `/calculadora-de-rescisao` |
| Sebrae MT | `/checklist-cobranca-mei` |
| Sebrae PI | `/gerador-de-recibo` |
| Sebrae SC | `/gerador-de-recibo` |

Disparo (VPS, SMTP do host):

```bash
node --env-file=.env.production scripts/seo/send-outreach-day.mjs \
  --day=docs/divulgacao/outreach-followup-2026-08-04.json --send
```

Local (dry-run):

```bash
node --env-file=.env scripts/seo/send-outreach-day.mjs \
  --day=docs/divulgacao/outreach-followup-2026-08-04.json --dry-run
```

## Regras

- Não comprar backlinks disfarçados.
- Não inventar números de usuários.
- Preferir `rel` natural; não exigir nofollow/dofollow no pitch.
- Sempre apontar para URL canônica HTTPS.

## Medição

- GSC: impressões, links externos, páginas de entrada.
- GA4: `utm_medium=partner` e `utm_medium=embed`.
- Meta 30 dias: ≥3 domínios distintos linkando páginas internas.
