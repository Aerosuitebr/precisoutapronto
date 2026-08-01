# Auditoria técnica de SEO e performance — Resolva Jato

Data: 1 de agosto de 2026  
Projeto: `D:\Desenvolvimento\hub-recursos-gratis`  
Domínio canônico: `https://resolvajato.com.br`  
Branch: `feat/growth-nichos-d30`

## Resumo executivo

A base técnica já era madura (Next.js híbrido, sitemaps segmentados, robots, metadados, JSON-LD, segurança e 404). Nesta execução foram corrigidos gaps **críticos e altos** além dos canônicos de `/recibo-de-pagamento` e `/proposta-comercial-mei`: hreflang apontando para rotas privadas/`noindex`, `html lang` fixo em PT nas páginas EN/ES, canibalização `/para/autonomos` vs `/para/freelancers`, Open Graph incompleto em segmentos/landings, schema/breadcrumb inconsistentes, title template sem marca e E-E-A-T editorial fraco nas landings.

Validação local: `seo:audit` OK, build de produção OK (0 erros), smoke HTTP OK (10/10 endpoints, 134 URLs no sitemap, 6 segmentos).

**Produção ainda não refletiu este lote** — é necessário deploy Vultr.

## 1. Correções aplicadas

### Críticas

- Hreflang EN/ES só é emitido quando o `ptPath` é público e indexável (`isPublicIndexablePath`); ferramentas só em `/ferramentas/*` ou `/busca` deixam de publicar cluster de idiomas.
- `ptPath` de Pix → `/gerador-de-qr-code-pix`; MEI vs CLT → `/mei-ou-clt`.
- Sitemap i18n reconstruído a partir do catálogo filtrado (removeu órfãos como email-signature, PDF editor, resource-search etc. sem equivalente PT público).
- `html lang` dinâmico via middleware (`x-html-lang` + `Content-Language`) e root layout assíncrono.

### Altas

- Redirect 301/308 `/para/autonomos` → `/para/freelancers`; autonomos removido do sitemap growth.
- Open Graph/Twitter em `/para/[segmento]` e imagens explícitas em recibo/proposta/contrato/aluguel.
- `opengraph-image` criado para `/recibo-de-aluguel`.
- Title template global `%s | Resolva Jato`; jogos/diagnóstico usam `title.absolute` com marca Jato Games.
- JSON-LD: `SoftwareApplication.url` aponta para a ferramenta pública; breadcrumb alinhado a Início → Recursos → página.
- CTA de contrato de aluguel aponta para `/gerador-de-contrato` (landing pública) em vez de `/ferramentas/contratos`.
- Hreflang bidirecional nas calculadoras PT com equivalente EN/ES (rescisão, MEI/CLT, preço freelancer).
- Bloco editorial E-E-A-T nas landings SEO (política editorial + contato).
- Cache público ampliado para novas landings no middleware.
- Auditoria estática e smoke HTTP ampliados (canônicos, hreflang, redirect autonomos, title template, lang).

### Já adequados (mantidos)

- robots.txt, sitemaps segmentados, noindex de áreas privadas, Organization/WebSite JSON-LD, manifest/favicons, cabeçalhos de segurança, pré-renderização ampla.

## 2. Comparação antes/depois (esta execução)

| Indicador | Antes | Depois |
|---|---:|---:|
| Hreflang EN→PT para `/ferramentas/*` ou `/busca` | vários | 0 (guardrail) |
| `html lang` correto em EN/ES (HTML inicial) | não | sim |
| Canibalização autonomos/freelancers | 2 URLs indexáveis | 1 + redirect |
| OG em `/para/[segmento]` | ausente | presente |
| OG image `/recibo-de-aluguel` | ausente | presente |
| Title template com marca | `%s` | `%s \| Resolva Jato` |
| Smoke endpoints | 7 | 10 |
| URLs sitemap (dedupe) | ~159 | 134 (órfãos i18n removidos) |
| Build/tipos | — | 0 erros |

Linha de base externa (Search Console, execução anterior): 0 cliques, 66 impressões, CTR 0%, posição média 83,3. Sem nova coleta externa nesta execução.

## 3. Pendências externas

### Alta

1. Deploy Vultr (`npm run deploy:vultr`) a partir desta branch e merge em `master`.
2. No Google Search Console: inspecionar `/recibo-de-pagamento` e `/proposta-comercial-mei`; solicitar validação/recrawl; confirmar convergência de canônicos.
3. Reenviar `https://resolvajato.com.br/sitemaps/index.xml` no GSC e Bing Webmaster Tools.
4. Inspecionar 2–3 URLs EN afetadas (ex.: `/en/tools/email-signature` sem hreflang; `/en/tools/pix` → PT público).

### Média

5. Core Web Vitals de campo (CrUX) quando houver volume.
6. Lighthouse móvel nas landings prioritárias (rescisão, proposta MEI, recibo, Pix).
7. Rich Results Test para Organization, Breadcrumb e FAQ após o deploy.
8. Confirmar chaves `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` no ambiente de produção.

## 4. Recomendações estratégicas

### Conteúdo e E-E-A-T

- Priorizar o cluster de rescisão (comum acordo, FGTS, aviso, férias, 13º) com links para a calculadora.
- Expandir proposta comercial MEI com exemplos reais de escopo/investimento/aceite.
- Diferenciar modelos de contrato/recibo para reduzir canibalização.
- Incluir data de revisão por guia (hoje `GUIDES_UPDATED_AT` é compartilhada) e autoria/revisão identificável.

### Autoridade

- Backlinks editoriais para páginas internas (não só home).
- Parcerias com portais de MEI, contabilidade, RH e freelancers.
- Ativos citáveis: checklists, calculadoras embutíveis, estudos agregados.

### Monitoramento

- Semanal: impressões, posição e CTR por página/consulta.
- Meta inicial: posição média &lt; 50; cluster rescisão no top 20; backlinks para ≥3 páginas internas.

## 5. Como validar localmente

```bash
npm run seo:audit
npm run build
npx next start -p 3000
# em outro terminal:
SEO_BASE_URL=http://127.0.0.1:3000 npm run seo:smoke
```
