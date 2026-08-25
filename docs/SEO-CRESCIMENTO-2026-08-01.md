# Diagnóstico de crescimento e indexação — 1 ago 2026

## Veredito

O site já está tecnicamente rastreável (robots, sitemaps, canônicos, JSON-LD). O que impede liderança em visitas é menos “bug de indexação” e mais **vazamento de autoridade para URLs noindex**, **ferramentas órfãs sem landing pública** e **autoridade de domínio ainda baixa** (GSC: poucas impressões, posição média alta).

## O que estava impedindo

1. **CTAs das landings SEO apontavam para `/ferramentas/*`** (Disallow + `noindex`). Google não segue nem ranqueia essas URLs; o PageRank interno morria no sink.
2. **Homepage e hubs** empurravam visitantes para `/ferramentas` em vez de `/recursos` e landings públicas.
3. **Redação ENEM** (alta demanda BR) só existia em rota privada; sem página indexável.
4. **Ferramentas restantes sem landing pública** (agenda, ABNT, PDF, divisor de conta, etc.) ainda só vivem em `/ferramentas` e não competem em busca.
5. **Autoridade externa**: backlinks e menções ainda são o gargalo principal fora do código.

## Mudanças feitas neste lote

- Mapa canônico `src/lib/seo/public-tool-landings.ts`.
- CTAs de `seo-pages/*` e `landing-content.ts` → âncoras públicas `#ferramenta`.
- Homepage: Pix, redação, catálogo → URLs públicas.
- Landing indexável `/corretor-de-redacao-enem`.
- Landings órfãs: `/editor-de-pdf-online`, `/gerador-de-referencias-abnt`, `/agenda-online`, `/divisor-de-conta`.
- Press kit em `/sobre` com fatos citáveis e como citar.
- CTAs virais, footer, sitemap, llms.txt, IndexNow e guardrails de auditoria.

## Pendências operacionais (fora do código)

1. Deploy produção (`npm run deploy:vultr`).
2. No GSC: solicitar indexação de `/corretor-de-redacao-enem` e reenviar `sitemaps/index.xml`.
3. IndexNow após o deploy: `npm run seo:indexnow`.
4. Próximas landings públicas prioritárias: referências ABNT, divisor de conta, editor PDF, agenda.
5. Conteúdo profundo no cluster rescisão/MEI + backlinks editoriais.

## Como validar

```bash
npm run seo:audit
SEO_BASE_URL=https://precisoutapronto.com.br npm run seo:smoke
```
