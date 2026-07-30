# Analytics e SEO operacional

## Medição

Defina no ambiente de build:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxxx
```

As integrações são opcionais: sem os IDs, nenhum script externo é carregado. Os eventos implementados não enviam CPF, e-mail, telefone, nomes nem conteúdo de documentos.

Eventos iniciais:

- `begin_checkout`: escolha de PIX ou cartão, com provedor ASAAS.
- `purchase`: confirmação do Premium, sem identificadores pessoais.

No GA4, marque `purchase` como evento principal. Para comparar aquisição orgânica e resultado, use origem/mídia, landing page e o evento de compra. O Search Console pode ser vinculado à propriedade GA4.

## Microsoft Clarity e Bing

Crie o projeto no Clarity, informe o ID acima e vincule-o ao Bing Webmaster Tools. Conteúdo sensível deve permanecer mascarado nas configurações do Clarity.

## IndexNow

O deploy Vultr executa `npm run seo:indexnow` depois do health check. Falhas do serviço não derrubam uma publicação bem-sucedida. Para enviar manualmente:

```bash
npm run seo:indexnow
node scripts/seo/submit-indexnow.mjs --url https://resolvajato.com.br/guias
```

## Rotina após publicação

1. Conferir `/sitemap.xml`, `/sitemaps/index.xml`, `/robots.txt` e `/llms.txt`.
2. Inspecionar as novas URLs no Google Search Console (propriedade de **domínio**).
3. Rodar Site Scan e URL Inspection no Bing Webmaster Tools.
4. Acompanhar consultas, páginas de entrada, início de checkout e compra.
