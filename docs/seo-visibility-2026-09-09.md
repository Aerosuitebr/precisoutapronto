# Revisão de visibilidade — 09/09/2026

## Mudanças

- O sitemap anterior tinha 32 entradas por seleção editorial explícita em `focus-cycle.ts`; não era um defeito de geração.
- Incluídas nove páginas comerciais de apoio: biblioteca, freelancers, recibos de serviço e autônomo e cinco guias de cobrança, Pix, precificação e proposta. Total esperado: 41 entradas.
- A mesma seleção habilita indexação nos dois modelos de recibo antes marcados como noindex.
- Biblioteca passa a destacar orçamento, Pix e recibo, com links para guias comerciais. O catálogo completo continua acessível.
- Metadados dos guias alinhados ao assunto principal da página.
- Gerador de recibo recebe exemplo fictício preenchido, cenário de sinal e links para orçamento e recibo de serviço.
- Removida a data fixa do índice de sitemaps: ela não representava a atualização de cada arquivo. As datas editoriais das páginas permanecem específicas.

## Validação

Executar com o servidor local em execução:

```powershell
$env:E2E_BASE_URL='http://127.0.0.1:3100'
npx playwright test e2e/seo-commercial-coverage.spec.ts --workers=1
npm run seo:audit
```

O teste verifica sitemap, HTTP 200 sem redirecionamento para login, canonical e ausência de noindex nas nove páginas. Também verifica o conteúdo principal da biblioteca e a exclusão de rotas privadas do sitemap.

## Publicação e acompanhamento

Estas mudanças precisam ser publicadas pelo fluxo normal do projeto. Após publicar, repetir os testes com a URL de produção e enviar o índice de sitemaps pelo Search Console.

Há exportações históricas de 28/08 em `reports/seo/search-console`; elas não demonstram o desempenho atual nem uma comparação de dois períodos de 90 dias. Para medir o resultado, exportar consultas e páginas de períodos equivalentes no Search Console, separar consultas de marca e comparar cliques, impressões, CTR e posição. Associar ao funil de orçamento criado e aprovado; posição isolada não mede aquisição.

Priorizar divulgação do exemplo de orçamento para eletricista e da ferramenta de recibos com contadores e comunidades de prestadores. O site já possui páginas de imprensa e parcerias. Não foram enviados contatos, criadas menções externas ou simulados backlinks nesta revisão.

O bloqueio de áreas privadas em robots.txt foi preservado: existe um mapa de ferramentas para landings públicas em `src/lib/seo/public-tool-landings.ts`.
