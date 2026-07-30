# Fila GSC · solicitar indexação (todas as landings SEO)

Fonte: `https://resolvajato.com.br/sitemap.xml` (~159 URLs).  
Índice por segmento (melhor visão no GSC): `https://resolvajato.com.br/sitemaps/index.xml`.  
Use a propriedade de **domínio** `resolvajato.com.br` (a de prefixo HTTPS é secundária).  
“Solicitar indexação” no GSC tem cota diária. Use os lotes abaixo.

## Já confirmados no Google

- [x] `/` · indexada
- [x] `/gerador-de-contrato` · indexada
- [x] `/gerador-de-recibo` · indexada

## Alerta · segurança (bloqueia indexação)

GSC · Problemas de segurança: **Páginas enganosas** (amostras N/D).  
Safe Browsing (27/jul): site marcado com paginas inseguras (engenharia social).

Em `/gerador-de-curriculo` (rastreio 25/jul):
- Canônica declarada pelo usuário: **nenhuma** (na época do crawl)
- Canônica escolhida pelo Google: `https://www.747live.bet/` (fora da propriedade)
- Teste live 30/jul: canônica correta, **é possível indexar**
- `/biblioteca` live OK e **já indexada**; `/para/mei` **já indexada**

Revisão GSC: formulário aberto; confirmar envio manual se o botão ainda disser SOLICITAR REVISÃO.

## Bing / Clarity

- Clarity no ar: ID `xsknm22mhw` carrega **depois** de Aceitar métricas
- Bing Webmaster: propriedade `resolvajato.com.br/` já verificada (`IsVerified: true`)
- Token `msvalidate.01`: `95E6ADBB3604C5BDD917DDC5ABEB308B` (via API GetUserSites → AuthenticationCode)
- Local: `BING_SITE_VERIFICATION` gravado no `.env`
- Produção: precisa do mesmo valor no `.env` do host + **rebuild** (build arg do Docker)
- Clarity no Bing: site já vinculado; falta só confirmar instalação no Clarity

## Status 30/jul · pós-deploy

- [x] Deploy SEO no ar (robots, sitemaps segmentados, JSON-LD)
- [x] IndexNow completo: **159 URLs** aceitas (HTTP 200)
- [x] Audit live das URLs pendentes do dia 1: 200 + canônica correta + sem spam
- [ ] Enviar no GSC (domínio): `sitemap.xml` + `sitemaps/index.xml`
- [ ] Solicitar indexação das URLs restantes do dia 1 (abaixo)

## Dia 1 · prioridade comercial · 15 URLs

Arquivo: `gsc-fila-day1.txt`

1. `/` (feito · indexada)
2. `/gerador-de-contrato` (feito · indexada)
3. `/gerador-de-recibo` (feito · indexada)
4. `/gerador-de-curriculo` (**pedir agora** · canônica live OK; crawl antigo tinha spam)
5. `/gerador-de-proposta-comercial` (feito · indexada)
6. `/calculadora-de-rescisao` (feito · indexada)
7. `/para/mei` (feito · indexada)
8. `/biblioteca` (feito · indexada)
9. `/orcamento-com-pix` (feito · indexada)
10. `/gerador-de-qr-code-pix` (**pedir agora**)
11. `/calculadora-de-ferias` (**pedir agora**)
12. `/calculadora-de-decimo-terceiro` (**pedir agora**)
13. `/calculadora-de-preco-freelancer` (**pedir agora**)
14. `/mei-ou-clt` (**pedir agora**)
15. `/assistente/documentos` (**pedir agora** · live OK)

### Colar no GSC agora (7 URLs)

```
https://resolvajato.com.br/gerador-de-curriculo
https://resolvajato.com.br/gerador-de-qr-code-pix
https://resolvajato.com.br/calculadora-de-ferias
https://resolvajato.com.br/calculadora-de-decimo-terceiro
https://resolvajato.com.br/calculadora-de-preco-freelancer
https://resolvajato.com.br/mei-ou-clt
https://resolvajato.com.br/assistente/documentos
```

## Dia 2 · segmentos, modelos e guias · 20 URLs

Arquivo: `gsc-fila-day2.txt` (paths `/para/*`, `/modelos/*`, `/guias/*` restantes)

## Dia 3 · demais landings de ferramenta · ~19 URLs

Arquivo: `gsc-fila-day3.txt`

## Dias 4+ · restante do sitemap · ~95 URLs

Arquivo: `gsc-fila-rest.txt` (inclui EN/ES, games, institucionais)

## Como pedir no GSC

1. Abrir propriedade de **domínio**: https://search.google.com/search-console?resource_id=sc-domain%3Aresolvajato.com.br
2. Sitemaps → adicionar:
   - `https://resolvajato.com.br/sitemap.xml`
   - `https://resolvajato.com.br/sitemaps/index.xml`
3. Colar cada URL na barra “Inspecionar qualquer URL”
4. Se **não** estiver indexada: **Solicitar indexação**
5. Se já estiver indexada: pular (não gastar cota)
6. Parar quando o GSC avisar limite diário

## Cobertura automática (todas as ~159)

- Sitemap completo: `/sitemap.xml`
- Índice segmentado: `/sitemaps/index.xml` (core, tools, growth, guides, games, i18n)
- IndexNow no deploy lê o sitemap ao vivo (lote completo)
- Reenvio manual 30/jul: 159 URLs aceitas
