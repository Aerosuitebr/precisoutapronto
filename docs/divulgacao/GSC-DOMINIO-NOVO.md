# Indexação Google · domínio novo (Resolva Jato)

Auditoria pública (2026-07-30): homepage, `robots.txt` e `sitemap.xml` em HTTP 200;
sitemap com ~149 URLs; canônicas corretas; sem `noindex` / `X-Robots-Tag` em páginas
públicas. `site:resolvajato.com.br` ainda vazio. Diagnóstico: domínio recente + descoberta,
não bloqueio técnico.

Meta de verificação já publicada no HTML:

`google-site-verification` = `DK13pDrQ06EP4nkGF8Dyqp_pby4oOT14LvkL0bBOSSk`

## Prioridade no Google Search Console

1. Validar propriedade de domínio (`resolvajato.com.br`), preferencialmente DNS.
2. Enviar sitemap: `https://resolvajato.com.br/sitemap.xml`.
3. Inspecionar e solicitar indexação, nesta ordem:
   - `/`
   - `/gerador-de-contrato`
   - `/gerador-de-recibo`
   - `/gerador-de-curriculo`
   - `/gerador-de-proposta-comercial`
   - `/calculadora-de-rescisao`
   - `/para/mei`
   - `/biblioteca`
4. Relatório **Páginas**: separar
   - Descoberta, mas não indexada
   - Rastreada, mas não indexada
   - Duplicada
   - Bloqueada
   - Página com redirecionamento
   - Erro de servidor
5. Acompanhar impressões, CTR e consultas por 14 a 30 dias.

## Checklist

- [ ] Propriedade de domínio validada no GSC
- [ ] Sitemap enviado e aceito
- [ ] Inspeção + pedido de indexação das 8 URLs prioritárias
- [ ] Relatório Páginas revisado (sem bloqueio inesperado)
- [ ] IndexNow reenviado após mudanças editoriais relevantes
- [ ] Revisar GSC em 14 dias e em 30 dias

## IndexNow (Bing e parceiros; não substitui o GSC)

```bash
npm run seo:indexnow

node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/gerador-de-contrato
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/gerador-de-recibo
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/gerador-de-curriculo
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/gerador-de-proposta-comercial
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/calculadora-de-rescisao
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/para/mei
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/biblioteca
```
