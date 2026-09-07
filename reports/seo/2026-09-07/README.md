# Execução de foco — 07/09/2026

## Migração Google

Na propriedade de domínio `sc-domain:resolvajato.com.br`, Configurações → Mudança de endereço confirma mudança ativa para `precisoutapronto.com.br`, iniciada em **19/08/2026**. Não foi cancelada nem reenviada uma mudança já ativa.

- Guia antiga `/guias/como-fazer-orcamento-com-pix`: fora do índice por redirecionamento, último rastreamento em **06/09/2026 20:43:47**, conforme horário exibido pelo GSC. Canônica declarada e escolhida pelo Google: a mesma guia no domínio novo. Não foi solicitada indexação redundante para essa URL já consolidada.
- URL antiga `/orcamento-com-pix`: ainda constava como indexada. Solicitação enviada em 07/09; o GSC confirmou **“Indexação solicitada”** e inclusão em fila de rastreamento prioritário. Isso não comprova atualização imediata da SERP nem término da migração.
- Pesquisa nova `/pesquisa/orcamentos-prestadores`: inspeção atual confirmou **“O URL está no Google”**, com um item de conjunto de dados válido e problemas não críticos. Não foi reenviada para indexação.

Não foram inspecionadas todas as URLs antigas nem criada rotina automática de recrawl. Não há comprovação de substituição completa do domínio nas SERPs.

## Guia e teste de CTR

Incluída chamada contextual com link direto para `/orcamento-com-pix` após a resposta inicial, restrita à guia solicitada. Usa o evento existente `guide_tool_click` com `placement=intro` e mantém a atribuição da origem. Link lateral preservado.

Title, H1, description e metadados não foram alterados. Manter title até 28/09/2026. Nenhuma alteração em sitemap, robots, `/ferramentas` ou rotas por profissão. Ciclo de 32 URLs preservado até 03/12/2026.

Verificação: ESLint dos dois arquivos alterados e `git diff --check` passaram. Página local retornou HTTP 200; árvore acessível e conferência visual mostraram a nova chamada e o destino correto. Ambiente local usou fontes alternativas porque o download de Google Fonts foi negado pela rede. `tsc --noEmit` encontra dois erros fora dos arquivos alterados: flag de regex incompatível com target em `e2e/event-platform-contract.spec.ts:664` e módulo `vitest` ausente em `src/lib/seo/public-indexable-path.test.ts:1`. Não houve deploy nesta execução.

## GSC: dados atuais salvos localmente

Propriedade: `sc-domain:precisoutapronto.com.br`. Pesquisa Web, últimos sete dias disponíveis, **30/08 a 05/09/2026**, extração em 07/09. Atualização da interface: há 5,5 horas. Esse recorte não equivale à semana 07–13/09, que acaba de começar.

| Métrica | Total exibido |
|---|---:|
| Cliques | 6 |
| Impressões | 918 |
| CTR | 0,7% |
| Posição média | 42 |

Arquivos CSV locais contêm **286 consultas, 139 páginas e 7 dias**, obtidos das tabelas visíveis pela sessão autenticada. Paginação conferida em 500 linhas para consultas e páginas. As casas decimais e percentuais seguem a apresentação da interface. Não são os arquivos nativos do botão Exportar: o download foi acionado, mas nenhum arquivo local foi disponibilizado de modo verificável pelo navegador. Países, dispositivos e aspecto da pesquisa não foram exportados.

A extração local usa apenas as respostas de tabelas já observadas nesta tarefa; `save-observed-gsc.cjs` recebe o arquivo de registro da sessão como argumento e copia somente as tabelas reconhecidas para CSV. Consultas omitidas pelo GSC não são reconstruídas. Totais por página e por consulta não devem ser somados entre si nem usados para substituir o total agregado da propriedade.

| Página | Cliques | Impressões | Posição média |
|---|---:|---:|---:|
| `/guias/como-fazer-orcamento-com-pix` | 0 | 3 | 5,7 |
| `/orcamento-com-pix` | 0 | 12 | 6,8 |
| `/proposta-comercial-mei` | 1 | 11 | 5,0 |
| `/orcamento-para/chaveiro` | 1 | 11 | 7,4 |
| `/recibos/recibo-pagamento-pix` | 2 | 112 | 7,0 |

O recorte novo não sustenta a premissa de que a guia seja a única entrada comercial com posição média abaixo de 10. Média de posição não é prova de uma SERP específica. Os volumes são pequenos e não justificam encerrar o teste de title ou expandir o sitemap.

## Bing, outreach e distribuição

Login no Bing com `contato@precisoutapronto.com.br` abriu conta sem sites cadastrados. Não foi importado site nem criada propriedade nova para simular histórico. Exportação Bing pendente da identificação da conta correta.

Na continuação solicitada pelo usuário, a conta passou a apresentar apenas `https://www.precisoutapronto.com.br/`, adicionada em 07/09/2026 e ainda não verificada. O teste de verificação HTML retornou “Verification key incorrect”: a conta solicita `73205F615F5216E0F7C9B9BB51D4CBF6`, enquanto a página pública publica `95E6ADBB3604C5BDD917DDC5ABEB308B`. Este último coincide com o registro de propriedade já verificada em `docs/divulgacao/GSC-FILA-INDEXACAO.md`. A conta atual foi confirmada como `contato@precisoutapronto.com.br`; não há relatório de desempenho disponível nela. Nenhum token foi substituído e nenhuma propriedade foi excluída. É necessário identificar a conta da propriedade anterior para recuperar seu histórico.

[Rodada de divulgação](../../../docs/divulgacao/RODADA-2026-09-07.md): cinco mensagens personalizadas para Contabilizei, Já Calculei, MaisMei, Portal Contábeis e Conube, com fontes, limites metodológicos e bloco `/embed`; três peças em texto para orçamento, WhatsApp/Pix e recibo. Nenhuma enviada ou publicada nesta execução. Canais de publicação e contatos editoriais ainda pendentes. **0 menções publicadas verificadas nesta rodada.**

## Exportação nativa para Google Planilhas concluída

Após autorização explícita do usuário em 07/09/2026, foi concluída a exportação nativa do mesmo recorte de 30/08 a 05/09/2026 para [Google Planilhas](https://docs.google.com/spreadsheets/d/1YXaAzYoyuHXXNTeu7Am7S4QL11EVhRUro7gHB-GGPLY/edit). Nome: `precisoutapronto.com.br-Performance-on-Search-2026-09-07`. A interface confirmou “Alterações salvas no Drive” e “Apenas eu posso acessar”, na conta `contato@aerosuite.com.br`.

Foram conferidas as abas Gráfico, Consultas, Páginas, Países, Dispositivos, Aspecto da pesquisa e Filtros. A exportação nativa complementa os CSVs locais, incluindo as dimensões que não haviam sido salvas localmente. A pendência do Bing permanece.

## Histórico da restrição da exportação alternativa

A revisão automática inicialmente bloqueou “Google Planilhas”, por criar exportação persistente dos dados do GSC na conta Google sem autorização específica. A ação ficou pendente até o usuário responder “sim” à solicitação específica. Após essa autorização, a exportação foi executada e verificada conforme registro acima.

## Bing: conta correta e domínio novo verificado

Atualização em 07/09/2026, substituindo as pendências de identificação da conta acima: o usuário informou `wellemlyra@hotmail.com`. O acesso Microsoft abriu as propriedades anteriores `resolvajato.com.br` e `aerosuite.com.br`.

Após o pedido explícito para mudar Resolva Já para Precisou Tá Pronto, foi adicionada e verificada a propriedade `https://precisoutapronto.com.br/`, sem www, usando a meta tag já publicada. O Bing aceitou a verificação e liberou os relatórios da propriedade. Nenhum token do site precisou ser alterado.

O sitemap existente `https://precisoutapronto.com.br/sitemap.xml` foi enviado. A tabela confirmou envio em 07/09/2026, status **Processing**, sem rastreamento registrado e sem contagem de URLs descobertas ainda. Não houve ampliação do sitemap. A propriedade antiga foi preservada para histórico.

Não foi encontrada opção Site Move nos menus Configuration, Tools & Enhancements ou Settings da interface atual. Portanto não se registra uma solicitação formal de mudança de endereço no Bing como concluída. Verificação e envio de sitemap não comprovam substituição nas SERPs; isso permanece dependente do rastreamento e processamento dos redirecionamentos pelo Bing.

### Dados semanais recuperados do domínio antigo

Search Performance, filtro All, 7D, **30/08 a 05/09/2026**: **0 cliques, 4 impressões, CTR 0%**. Foram salvas as quatro consultas e as seis linhas diárias efetivamente exibidas nos CSVs `bing-resolvajato-consultas-2026-08-30_2026-09-05.csv` e `bing-resolvajato-dias-2026-08-30_2026-09-05.csv`. A tabela não exibiu linha para 30/08; não foi inventado um valor para esse dia.

Os CSVs são transcrições dos dados observados na interface autenticada. Os botões de download foram acionados, mas não houve arquivo nativo local verificável. Estes números pertencem ao domínio antigo, não ao novo; o cadastro novo não transfere o histórico entre relatórios.
