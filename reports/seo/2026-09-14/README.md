# Execução de visibilidade — 14/09/2026

## Alterações

- Home: três caminhos comerciais para orçamento, recibo Pix e proposta; cinco atalhos para profissões com indexação habilitada e link ao catálogo de modelos.
- Links dos cartões e profissões usam o evento existente `landing_cta_click` com origem `/`, destino e posição. O envio ao GA4 depende da configuração e do consentimento existentes.
- Data editorial da home atualizada no sitemap para 14/09. IndexNow recebe somente a home nesta versão.
- Auditoria HTTP corrigida: a faixa antiga de 15–40 URLs não correspondia ao foco atual de 46. Agora verifica também presença de nove destinos comerciais e duplicações.
- Títulos e regras de indexação preservados. Teste de títulos vigente até 28/09.
- Textos e links de divulgação em `divulgacao.md`, sem publicação externa nesta tarefa.

## Search Console consultado em 14/09

Propriedade `sc-domain:precisoutapronto.com.br`, pesquisa Web, sem filtro de página, país ou dispositivo. Recorte completo disponível: 06–12/09/2026. Atualização da interface: há 6,5 horas.

| Métrica | 30/08–05/09 (histórico salvo em 07/09) | 06–12/09 (interface em 14/09) |
|---|---:|---:|
| Cliques da propriedade | 6 | 8 |
| Impressões da propriedade | 918 | 625 |
| CTR exibida | 0,7% | 1,3% |
| Posição média | 42 | 30,6 |

São dois cliques adicionais e 293 impressões a menos. Não atribuir esta comparação às mudanças de 14/09. Amostra pequena e composição das consultas variável; a melhora da posição agregada não significa melhora de todas as páginas. Não somar linhas por página para substituir os totais da propriedade.

109 linhas da tabela de páginas foram capturadas diretamente da interface em `gsc-pages-2026-09-06_2026-09-12.json`. O arquivo registra o recorte e as colunas; não é exportação da API. Destaques:

| Página | Cliques | Impressões | CTR | Posição |
|---|---:|---:|---:|---:|
| Recibo Pix | 1 | 102 | 1% | 6,7 |
| Gerador de recibo | 1 | 65 | 1,5% | 45,1 |
| Orçamento com Pix | 0 | 26 | 0% | 8,1 |
| Gerador de proposta | 0 | 22 | 0% | 16,3 |
| Guia como fazer orçamento com Pix | 0 | 18 | 0% | 2,8 |
| Orçamento para eletricista | 0 | 9 | 0% | 3,3 |

Sitemaps já processados pelo Google, com última leitura em 13/09: `/sitemap.xml` (46 páginas, um vídeo) e `/sitemaps/index` (72 páginas encontradas no relatório). O número do índice é o exibido pelo GSC, não a contagem atual de URLs únicas. Não foi necessário cadastrar outro sitemap.

Inspeção da página de chaveiro inicialmente mostrou exclusão por noindex, com último rastreamento em 09/09 às 23:29:58. A URL já consta no sitemap e os testes HTTP de produção confirmaram indexação permitida. A inspeção histórica antecede a reabertura de 10/09.

Teste em tempo real da página de chaveiro, em 14/09 às 08:16: disponível para o Google e possível de indexar. Solicitação confirmada pela mensagem “Indexação solicitada” e pela inclusão na fila prioritária. Uma segunda tentativa acidental retornou erro; após dispensar, a página continuou indicando “Indexação solicitada”. Não houve nova tentativa.

Marceneiro também constava excluído por noindex, rastreamento de 05/09 às 20:44:28. O teste HTTP atual permite indexação, mas a solicitação pelo GSC retornou “Ocorreu um erro ao enviar sua solicitação de indexação. Tente novamente mais tarde”. Permanece pendente; não confundir solicitação com indexação concluída.

Teste em tempo real de marceneiro concluído em 14/09 às 08:22: disponível para o Google e indexação possível. Uma nova solicitação após o teste também retornou o mesmo erro. Interrompidas as tentativas para essa URL; descoberta continua possível pelo sitemap e pelos novos links internos.

Relatório de links externos: “Dados em processamento: volte em mais ou menos um dia”. Sem contagem atual de backlinks disponível.

Recibo Pix: inspeção confirmou “O URL está no Google”, indexação permitida e canônica declarada/selecionada coincidentes. Último rastreamento exibido: 06/09 às 04:53:52, Googlebot Smartphone. Sem necessidade de nova solicitação para essa URL nesta tarefa.

## Validação

- Auditoria estática: oito arquivos essenciais e 165 rotas.
- ESLint dos arquivos de código alterados e `git diff --check`: aprovados.
- Cinco testes SEO comerciais: aprovados localmente e em produção antes desta publicação.
- Auditoria HTTP: 11 endpoints, 46 URLs e quatro segmentos aprovados localmente e em produção.
- Mobile 390 × 844: sem rolagem horizontal; atalhos por profissão com altura de 44 pixels.
- Clique no cartão de recibo validado no navegador local com captura de `landing_cta_click`, destino correto e atribuição `/`. Isso não comprova recepção de eventos em uma propriedade GA4.
- Domínio antigo `/orcamento-com-pix` retorna HTTP 301 para a mesma rota no domínio atual.

## Publicação

Commit inicial `8a859155ce35d8dcdfd237c958fb232b61385779`. Fluxo inicial de staging: https://github.com/Aerosuitebr/precisoutapronto/actions/runs/34837057293 .

A primeira homologação compilou e executou 207 testes: 204 aprovados, três falhas pela repetição do texto do botão principal no novo cartão. Texto secundário alterado para “Montar meu orçamento”; os 21 testes dos dois arquivos envolvidos passaram localmente, sem alterar testes. Correção no commit `db402fe92f1ff344f24d7ecec22d3cec07f3579c`; nova homologação: https://github.com/Aerosuitebr/precisoutapronto/actions/runs/34837643256 .

Versão final publicada em 14/09/2026 às 08:27 de São Paulo (11:27 UTC). A homologação aprovou os 207 testes e promoveu automaticamente o commit corrigido. Produção concluída com sucesso: https://github.com/Aerosuitebr/precisoutapronto/actions/runs/34838056993 . IndexNow retornou HTTP 200 para a notificação da home.

Após publicar: nove testes comerciais/de marca aprovados, auditoria HTTP aprovada e navegador confirmou os três cartões, cinco profissões e catálogo. No celular, largura de conteúdo de 390 pixels para viewport de 390 pixels. A presença dos links foi confirmada no HTML publicado. Não há medição de ganho de cliques após esta publicação.

## Pendências externas e próximo ciclo

- GSC: repetir a solicitação de marceneiro quando o serviço permitir; o teste ao vivo já confirma indexação possível. Indexação de chaveiro depende do processamento do Google.
- Links externos: aguardar disponibilidade do relatório. Textos de divulgação preparados, mas não enviados/publicados em canais de terceiros.
- Avaliar teste de títulos após 28/09 com `proximo-teste-de-titulos.md`; nenhuma alteração agendada automaticamente.
- Comparar semanas completas posteriores ao deploy e acompanhar uso das ferramentas. Não há acesso/medição de conversões GA4 nesta execução.
