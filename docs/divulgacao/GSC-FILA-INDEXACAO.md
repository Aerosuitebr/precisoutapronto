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

## Dia 1 (hoje) · prioridade comercial · 15 URLs

Arquivo: `gsc-fila-day1.txt`

1. `/` (feito · indexada)
2. `/gerador-de-contrato` (feito · indexada)
3. `/gerador-de-recibo` (feito · indexada)
4. `/gerador-de-curriculo` (pedido · canônica spam no crawl antigo)
5. `/gerador-de-proposta-comercial` (feito · indexada)
6. `/calculadora-de-rescisao` (feito · indexada)
7. `/para/mei` (feito · indexada)
8. `/biblioteca` (feito · indexada)
9. `/orcamento-com-pix` (feito · indexada)
10. `/gerador-de-qr-code-pix`
11. `/calculadora-de-ferias`
12. `/calculadora-de-decimo-terceiro`
13. `/calculadora-de-preco-freelancer`
14. `/mei-ou-clt`
15. `/assistente/documentos` (pedido · Google não reconhecia o URL)

## Dia 2 · segmentos, modelos e guias · 20 URLs

Arquivo: `gsc-fila-day2.txt` (paths `/para/*`, `/modelos/*`, `/guias/*` restantes)

## Dia 3 · demais landings de ferramenta · ~19 URLs

Arquivo: `gsc-fila-day3.txt`

## Dias 4+ · restante do sitemap · ~95 URLs

Arquivo: `gsc-fila-rest.txt` (inclui EN/ES, games, institucionais)

## Como pedir no GSC

1. Abrir: https://search.google.com/search-console?resource_id=https%3A%2F%2Fresolvajato.com.br%2F
2. Colar a URL na barra “Inspecionar qualquer URL”
3. Se **não** estiver indexada: **Solicitar indexação**
4. Se já estiver indexada: pular (não gastar cota)
5. Parar quando o GSC avisar limite diário

## Cobertura automática (todas as ~159)

- Sitemap completo: `/sitemap.xml`
- Índice segmentado: `/sitemaps/index.xml` (core, tools, growth, guides, games, i18n)
- IndexNow no deploy lê o sitemap ao vivo (lote completo)
