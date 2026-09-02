# Analytics e SEO operacional

## Medição

Defina no ambiente de build:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=xsknm22mhw
```

As integrações são opcionais: sem os IDs, nenhum script externo é carregado. Os eventos implementados não enviam CPF, e-mail, telefone, nomes nem conteúdo de documentos.

Eventos iniciais:

- `begin_checkout`: escolha de PIX ou cartão, com provedor ASAAS.
- `purchase`: confirmação do Premium, sem identificadores pessoais.

No GA4, marque `purchase` como evento principal. Para comparar aquisição orgânica e resultado, use origem/mídia, landing page e o evento de compra. O Search Console pode ser vinculado à propriedade GA4.

## Atribuição do funil por landing

Ao clicar em um CTA público, o site grava somente o caminho da landing na sessão do navegador. Os eventos seguintes recebem `landing_path` automaticamente, sem nome, e-mail, telefone ou conteúdo do documento. Isso permite relacionar aquisição a `quote_started`, `quote_link_created`, envio, aprovação, checkout e compra.

Exporte do GA4 um CSV com `landing_path`, `event_name` e `event_count` e gere o painel com:

```bash
npm run seo:dashboard -- --gsc paginas.csv --queries consultas.csv --funnel funil.csv --output docs/seo/painel-semanal-AAAA-MM-DD.md
```

O painel calcula `CTA→link` e `envio→aprovação` para as sete páginas prioritárias. Ausência de exportação permanece como `n/d`.

## Google Workspace e e-mail

Caixa oficial e SMTP: `contato@precisoutapronto.com.br` via `smtp.gmail.com`.  
Playbook (DNS SPF/DKIM/DMARC, senha de app, `.env` no VPS, testes):  
[`docs/divulgacao/GOOGLE-WORKSPACE.md`](./divulgacao/GOOGLE-WORKSPACE.md).

## Microsoft Clarity e Bing

O projeto de produção usa o ID acima e deve permanecer vinculado ao Bing Webmaster Tools. O compose de produção adota esse ID como padrão; o staging continua explicitamente sem rastreamento. Conteúdo sensível deve permanecer mascarado nas configurações do Clarity.

## IndexNow

O deploy Vultr executa `npm run seo:indexnow` depois do health check. Falhas do serviço não derrubam uma publicação bem-sucedida. Para enviar manualmente:

```bash
npm run seo:indexnow
node scripts/seo/submit-indexnow.mjs --url https://precisoutapronto.com.br/guias
```

## Rotina após publicação

1. Conferir `/sitemap.xml`, `/sitemaps/index.xml`, `/robots.txt`, `/llms.txt` e `/.well-known/security.txt`.
2. Inspecionar as novas URLs no Google Search Console (propriedade de **domínio**).
3. Rodar Site Scan e URL Inspection no Bing Webmaster Tools.
4. Acompanhar consultas, páginas de entrada, início de checkout e compra.
