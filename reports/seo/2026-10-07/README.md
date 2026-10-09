# Visibilidade — 7 de outubro de 2026

## Dados lidos diretamente no Search Console

Propriedade `sc-domain:precisoutapronto.com.br`; pesquisa Web, últimos 28 dias disponíveis: **07/09/2026 a 04/10/2026**. Última atualização de desempenho indicada: há 14,5 horas. Valores de impressões totais e médias arredondados conforme a interface. Leitura das tabelas visíveis, não exportação integral.

| Métrica | Valor |
| --- | ---: |
| Cliques | 69 |
| Impressões | 3,13 mil |
| CTR | 2,2% |
| Posição média | 16,4 |

| Página | Cliques | Impressões | CTR | Posição |
| --- | ---: | ---: | ---: | ---: |
| /recibos | 30 | 481 | 6,2% | 7,5 |
| /recibos/recibo-pagamento-pix | 8 | 760 | 1,1% | 7,8 |
| /es/tools/pix | 6 | 56 | 10,7% | 5,6 |
| /es/tools/severance | 4 | 311 | 1,3% | 6,6 |
| /gerador-de-recibo | 2 | 224 | 0,9% | 54,2 |
| /orcamento-com-pix | 2 | 87 | 2,3% | 8,7 |
| /gerador-de-qr-code-pix | 2 | 49 | 4,1% | 14,3 |
| / | 2 | 35 | 5,7% | 7,8 |

Consultas gerais: “gerador de comprovante de pix” 10 cliques / 186 impressões / posição 9,3; “gerador de comprovante de pagamento pix” 6 / 127 / 7,9. Na página de recibo Pix: “comprovante de pix serve como recibo” 0 / 20 / 8,3; “recibo pix” 0 / 16 / 7,1. Consultas visíveis não somam os totais por causa da limitação e anonimização do relatório; não inferir quais consultas produziram os demais cliques.

## Indexação e autoridade externa

Relatório atualizado em 03/10/2026: 198 páginas indexadas e 178 não indexadas no conjunto de URLs conhecidas. **Entre as enviadas: 46 indexadas e duas excluídas por noindex**. As duas são `/orcamento-para/pintor` (último rastreamento em 09/09) e `/recibos/como-preencher-recibo` (01/09). Ambas já respondem 200 em produção, com `index, follow`, canonical correto e sem `X-Robots-Tag: noindex`.

Validação da correção iniciada em 07/10/2026 e confirmada pela interface. Evidência: `gsc-validacao.jpg`. Início da validação não significa conclusão nem garantia de indexação.

Links externos: 260; 259 de `resolvajato.com.br` (domínio anterior) e um de `uicomet.com`. Não equivalem a 260 indicações independentes. Core Web Vitals sem dados na visão geral; não atribuir nota de velocidade nem afirmar melhora de desempenho.

## Alterações

- Título, descrição e data editorial do recibo Pix destacam o modelo gratuito em PDF, preservando a comparação com o comprovante bancário e as FAQs existentes. Hipótese: tornar a oferta mais clara e aumentar cliques qualificados. A página mantém sua URL e canonical.
- Atalho para o exemplo preenchido e condições do PDF gratuito no topo da página de recibo Pix.
- Botões principais e cartões da central de recibos usam o evento e a atribuição de landing já existentes. Nenhum dado de cliente, pagamento ou documento é enviado nesses eventos; dependem da configuração de analytics e do consentimento existente. CTA não é documento concluído.
- Sobre e imprensa passam a usar a mesma descrição institucional centrada no fluxo orçamento → aprovação → Pix → recibo. Pautas e links de imprensa priorizam prestadores.
- Deduplicação dos sitemaps segmentados; removida a entrada redundante de freelancers. Mantida a política editorial e de privacidade das demais rotas.
- Teste de regressão para URLs únicas dentro e entre os segmentos de sitemap.

## Medição após publicar

Comparar janelas completas de 28 dias, separando recibos, orçamento e marca. Usar 07/09–04/10 como referência registrada, reconhecendo que houve outras alterações recentes e que um antes/depois não demonstra causalidade. Preservar títulos durante a observação, salvo erro material. Acompanhar consultas e páginas; não apenas a posição média global.

No analytics, observar `landing_cta_click`, `quote_link_created` e `document_completed` com `tool_name=recibos`. A falta de acesso ao GA4 nesta execução impede afirmar quantos documentos foram gerados ou a taxa real de conversão.

## Publicação

Pacote limitado aos oito arquivos de produção listados em `publish.sh`; sem alterações de ambiente, banco de dados, permissões, serviços de WhatsApp ou bloqueios de páginas privadas. Cópia de segurança e imagem anterior previstas no servidor. Consultar o registro final abaixo para o resultado da publicação e dos testes.

## Resultado da execução

- Auditoria estática aprovada: oito arquivos essenciais e 166 rotas verificadas.
- Compilação de produção aprovada localmente e no servidor: 309 páginas estáticas. Dois avisos preexistentes sobre imagens permanecem fora do escopo. O build isolado do servidor registrou a indisponibilidade do banco para depoimentos e continuou com o tratamento existente; aplicação confirmou estado saudável após subir.
- Seis testes de cobertura SEO aprovados na prévia e repetidos com sucesso contra `https://precisoutapronto.com.br` (dois verificam o gerador de sitemap local; quatro fazem requisições HTTP ao alvo).
- Prévia inspecionada no navegador e em largura de celular, com atalho para exemplo funcionando. Versão pública também conferida visualmente.
- Publicação concluída no serviço `app` do projeto `/opt/precisoutapronto`. O contêiner conserva o nome legado `resolva-jato-app`: labels do Docker, porta local 3000 e HTML com canonical do domínio comprovaram a identidade antes da publicação. Bloqueio inicial da revisão automática resolvido com essas evidências e verificações no próprio script.
- Backup: `/opt/precisoutapronto-backups/seo-20261007/source-before.tgz`; imagem anterior: `precisoutapronto-seo-before:20261007`. Substituído somente o serviço app com `--no-deps`.
- Respostas públicas 200 e novos textos confirmados em Sobre, Imprensa e recibo Pix. O sitemap growth contém freelancers apenas uma vez.
- Sitemap `https://precisoutapronto.com.br/sitemaps/index` reenviado pelo Search Console e confirmado com “Sitemap enviado”. Os contadores da última leitura anterior ainda não refletem a nova leitura.
- Recibo Pix inspecionado: URL já presente no Google. Após publicar, solicitação de nova indexação aceita e confirmada com “Indexação solicitada”; URL adicionada à fila de rastreamento prioritário. Evidência: `gsc-indexacao-solicitada.jpg`. Não reenviar repetidamente.
- IndexNow aceitou quatro URLs com HTTP 200: Sobre, Imprensa, central de recibos e recibo Pix. Aceitação não garante indexação ou aumento de tráfego.
- Roteiros e links de divulgação em `docs/divulgacao/RODADA-2026-10-07.md`. Nenhuma mensagem ou postagem externa enviada.

Evidências: `gsc-validacao.jpg`, `gsc-sitemap-enviado.jpg`, `gsc-links.jpg`, `recibo-mobile-preview.jpg` e `recibo-publicado.jpg`. Métricas de visitas ou conversão posteriores à publicação ainda não existem nesta execução.
