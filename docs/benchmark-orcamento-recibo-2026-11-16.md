# Benchmark de orçamento e recibo Pix — 16/11/2026

Recorte: prestadores e MEIs no Brasil que enviam orçamentos pelo WhatsApp e recebem em mais de um Pix. Pesquisa de páginas públicas oficiais, sem criação de contas, transações ou testes em planos pagos. “Não descrito” não significa “não existe”.

| Fonte | Recursos divulgados | Implicação para o Precisou, Tá Pronto |
|---|---|---|
| [OrçamentoPix](https://orcamentopix.com.br/) | Orçamento, recibo e cobrança sem conta, QR com valor, resumo para WhatsApp, PDF sem marca e armazenamento no navegador. | Pix, recibo e acesso sem cadastro já são comuns. Mostrar o link de aprovação e como o saldo passa de um recibo ao próximo. |
| [AprovaPro](https://www.aprovapro.com.br/) | PDF e XLSX sem conta e sem marca; com conta, link de aprovação, registro de entradas e parcelas, saldo e alertas. | Separar emissão de recibos de gestão de pagamentos. Exportação para Excel e histórico financeiro são oportunidades distintas. |
| [Vistobra](https://vistobra.com.br/gerador-de-orcamento) | Gerador de PDF sem conta; no app, orçamento por voz, preços regionais, aprovação por link, sinal via Pix, recibo e garantia. | O concorrente tem um fluxo conectado para obras. Para o nosso público, priorizar a continuidade sem cadastro e documentar cada recebimento. |
| [OrçamentoZap](https://www.orcamentozap.com.br/) | Plataforma com cadastro, teste anunciado de 14 dias, orçamento via WhatsApp e cobrança Pix com acompanhamento em tempo real. | Deixar claro que nossa conferência é manual. Avaliar automação apenas se a demanda justificar a integração. |

Implementado: o orçamento recém-gerado abre o recibo Pix com prestador, cliente, serviço e valor total. O histórico oferece o mesmo caminho em orçamentos aprovados. O valor recebido começa vazio. Depois de baixar um recibo parcial, o próximo leva o acumulado e pede nova conferência. Exemplo: R$ 490 combinados, R$ 150 recebidos e R$ 340 pendentes; ao receber R$ 340, o usuário pode registrar a quitação. O gerador público não salva automaticamente um histórico de pagamentos.

O comparativo fica em `/orcamento-com-pix#comparativo`, com acesso pela página inicial. A proposta é reduzir redigitação e deixar o saldo claro para quem recebe em etapas. A pesquisa pública não comprova exclusividade ou superioridade em todas as funções.

Próxima prioridade: medir quantas pessoas abrem o recibo a partir do orçamento e quantas concluem o PDF. A partir do uso, avaliar cobrança Pix do saldo e histórico de pagamentos por orçamento. Exportação XLSX e confirmação automática seguem como lacunas frente às ofertas que divulgam esses recursos.
