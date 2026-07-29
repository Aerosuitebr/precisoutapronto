# IndexNow e Search Console · Nichos D30

Novas URLs publicadas neste ciclo:

- https://resolvajato.com.br/calculadora-de-ferias
- https://resolvajato.com.br/calculadora-de-decimo-terceiro
- https://resolvajato.com.br/recibo-de-aluguel

## IndexNow (após deploy em produção)

```bash
npm run seo:indexnow

node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/calculadora-de-ferias
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/calculadora-de-decimo-terceiro
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/recibo-de-aluguel
```

As três paths também foram incluídas em `scripts/seo/submit-indexnow.mjs` (lista `SEO_LANDINGS`) e em `src/app/sitemap.ts`.

## Google Search Console (manual)

1. Abrir a propriedade `resolvajato.com.br`.
2. Inspeção de URL para cada uma das três páginas.
3. Solicitar indexação se ainda não estiverem no índice.
4. Confirmar que aparecem em Cobertura / Páginas após alguns dias.
5. Conferir `/sitemap.xml` atualizado no ar.

## Bing Webmaster Tools

1. Site Scan ou URL Inspection nas três URLs.
2. Confirmar envio IndexNow (logs do deploy ou comando manual acima).

## Checklist pós-publicação

- [ ] Health check do site em produção
- [ ] `npm run seo:indexnow` sem erro bloqueante
- [ ] Inspeção GSC das 3 URLs
- [ ] Inspeção Bing das 3 URLs
- [ ] Smoke: abrir as páginas no mobile e gerar um cálculo/CTA
