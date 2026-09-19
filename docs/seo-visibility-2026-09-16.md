# Visibilidade e execução — 16/09/2026

## Search Console consultado diretamente

Propriedade: `sc-domain:precisoutapronto.com.br`. Pesquisa Web, intervalo solicitado de 17/06 a 14/09/2026 (90 dias inclusivos, até a última data consolidada exibida). O gráfico disponível começa em 18/08. Há aviso de migração de outro domínio para esta propriedade; não interpretar ausência anterior como zero de todo o negócio.

| Métrica | Valor exibido |
| --- | --- |
| Cliques | 23 |
| Impressões | 2,62 mil (arredondado na interface) |
| CTR | 0,9% |
| Posição média | 47,1 |

Páginas consultadas, ordenadas por cliques:

| Página | Cliques | Impressões |
| --- | ---: | ---: |
| /recibos/recibo-pagamento-pix | 6 | 347 |
| /corretor-de-redacao-enem | 6 | 55 |
| / | 2 | 40 |
| /es/tools/pix | 2 | 19 |
| /gerador-de-recibo | 1 | 175 |
| /games/ferramentas/meu-pc-roda | 1 | 87 |
| /gerador-de-qr-code-pix | 1 | 48 |
| /precisou-ta-pronto | 1 | 43 |
| /proposta-comercial-mei | 1 | 20 |
| /contato | 1 | 17 |

Consulta comercial observada: “comprovante de pix serve como recibo”, 1 clique / 19 impressões. “analisar redação”: 4 / 12. A tabela de consultas contém 723 linhas; a de páginas, 172. Esta leitura registra a amostra exibida, não uma exportação integral. As somas por consulta podem diferir do total.

## Indexação

Relatório com atualização indicada de 03/09/2026: 203 indexadas, 165 não indexadas. Motivos: noindex 36; robots 24; alternativa canônica 16; redirecionamento 8; 404 5; rastreada não indexada 45; detectada não indexada 30; canônica diferente escolhida pelo Google 1. Não remover bloqueios de áreas privadas nem alterar o ciclo editorial com base somente nesses totais.

Exemplos 404: `/cdn-cgi/l/email-protection`, `/resolva-jato`, `/$`, `/&`, `http://precisoutapronto.com.br/`. A lista é histórica; não implica que todos ainda falhem hoje. Não solicitada validação sem comprovar correção.

## Melhorias

- Orçamento com Pix: exemplo de R$ 490, mensagem de WhatsApp, entrada de R$ 150 e saldo de R$ 340; apresentação em vídeo já existente; atalho do topo para o exemplo.
- Modelos profissionais com exemplo: orientação para adaptar os itens e links contextuais para recibo Pix e guia de sinal/saldo.
- Recibo Pix: título preservado, exemplo completo de entrada, comparação de dois recebimentos e CTA intermediário com evento existente `landing_cta_click`.
- Datas do sitemap atualizadas nas duas páginas centrais revisadas.
- Divulgação: canais pesquisados e peças com UTMs em `docs/divulgacao/RODADA-2026-09-16.md`. Sem envio repetido a contatos históricos.

## Validação

- Auditoria estática SEO: 165 rotas verificadas, aprovada.
- Playwright `seo-commercial-coverage`: 5 testes aprovados localmente.
- Checagem TypeScript global aprovada após corrigir dois problemas anteriores em testes: removida uma flag de regex desnecessária incompatível com ES2017 e substituído import de Vitest ausente pelo Playwright já instalado. Os três testes envolvidos passaram; nenhuma checagem foi desativada.
- Prévia local: exemplo, vídeo e links confirmados no navegador.
- Publicação concluída no servidor configurado do projeto. Backup dos arquivos e imagem anterior preservado em `/opt/precisoutapronto-backups/seo-20260916` e `precisoutapronto-seo-before:20260916`.
- Build de produção aprovado; aplicação saudável. Os cinco testes SEO também passaram em `https://precisoutapronto.com.br`.
- HTTP 200 e novos trechos confirmados publicamente em orçamento com Pix, modelo para eletricista e recibo Pix.
- IndexNow aceitou quatro URLs atualizadas com HTTP 200 (orçamento, recibo Pix, eletricista e pedreiro). Aceitação do aviso não garante indexação nem posição.

## Medição posterior

Comparar períodos equivalentes apenas após existir histórico suficiente. Separar marca, recibos e orçamento. No GA4, usar origem/mídia/campanha da sessão e eventos existentes `landing_cta_click`, `quote_started`, `quote_link_created`, `document_completed` (tool_name=recibos). A medição depende do ID configurado e do consentimento do visitante. Não criar UTMs em links internos. Ausência de dados = não medido, não zero. Cliques em CTA não equivalem a documento concluído.
