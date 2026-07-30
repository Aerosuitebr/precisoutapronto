# Indexação Google · domínio novo (Resolva Jato)

Auditoria pública (2026-07-30): homepage, `robots.txt` e `sitemap.xml` em HTTP 200;
sitemap com ~159 URLs; canônicas corretas; sem `noindex` / `X-Robots-Tag` em páginas
públicas. `site:resolvajato.com.br` ainda frágil (domínio recente + descoberta).

Meta de verificação já publicada no HTML:

`google-site-verification` = `DK13pDrQ06EP4nkGF8Dyqp_pby4oOT14LvkL0bBOSSk`

## Duas propriedades no GSC (normal)

No seletor aparecem dois Resolva Jato:

| Propriedade | Tipo | Uso |
|---|---|---|
| `resolvajato.com.br` | **Domínio** (DNS) | Principal. Cobre apex, `www`, http e https. |
| `https://resolvajato.com.br/` | Prefixo de URL | Secundária. Só esse scheme+host. |

**Trabalhe na propriedade de domínio.** Envie sitemaps, peça indexação e acompanhe
Desempenho / Páginas lá. A de prefixo pode ficar verificada, mas evita fila duplicada.

Se Desempenho e Indexação mostrarem “Dados em processamento”, espere cerca de 1 dia.
HTTPS com URLs válidas e Core Web Vitals “Nenhum dado” é esperado no início (falta
tráfego de campo do Chrome UX Report).

## Prioridade no Google Search Console

1. Usar a propriedade de **domínio** `resolvajato.com.br`.
2. Enviar sitemaps:
   - `https://resolvajato.com.br/sitemap.xml` (completo)
   - `https://resolvajato.com.br/sitemaps/index.xml` (segmentos: core, tools, growth, guides, games, i18n)
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

- [x] Propriedade de domínio validada no GSC
- [x] Propriedade de prefixo HTTPS também verificada (secundária)
- [ ] Sitemap completo enviado e aceito na propriedade de **domínio**
- [ ] Índice segmentado (`/sitemaps/index.xml`) enviado na propriedade de domínio
- [ ] Inspeção + pedido de indexação das 8 URLs prioritárias
- [ ] Relatório Páginas revisado (sem bloqueio inesperado)
- [ ] IndexNow reenviado após mudanças editoriais relevantes
- [ ] Revisar GSC em 14 dias e em 30 dias

## IndexNow (Bing e parceiros; não substitui o GSC)

```bash
npm run seo:indexnow

node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/gerador-de-contrato
```

O script lê o `sitemap.xml` ao vivo por padrão (cobertura completa).
