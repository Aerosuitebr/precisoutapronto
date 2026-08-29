# Plano de CTR e autoridade — ciclo iniciado em 27/08/2026

## Linha de base

O Search Console foi exportado em 27/08/2026, com dados processados até 25/08. A janela selecionada foi de 28 dias, mas a propriedade atual só apresenta tráfego entre 18 e 25/08 por causa da mudança de site indicada pelo próprio Search Console. A amostra continua pequena e não justifica estimativas de volume. Sinais reais usados nesta rodada:

- total atual: 3 cliques, 280 impressões, CTR 1,1% e posição média 62,9.
- `/orcamento-com-pix`: 7 impressões, CTR 0% e posição 5,0.
- `/orcamento-pix-copia-e-cola`: 7 impressões, CTR 0% e posição 5,29.
- `/recibos/recibo-pagamento-pix`: 27 impressões, 1 clique, CTR 3,7% e posição 6,37.
- `/gerador-de-qr-code-pix`: 6 impressões, CTR 0% e posição 30.
- `/gerador-de-recibo`: 11 impressões, CTR 0% e posição 58,18.
- `/orcamento-para/eletricista`: 1 impressão e posição 4; `/orcamento-para/pedreiro`: 1 impressão e posição 1. A amostra é insuficiente para declarar ganho.

As alterações de 27/08 devem ser comparadas em 24/09. Não declarar vencedor antes de haver ao menos 100 impressões por página ou uma diferença consistente em duas janelas.

## URLs em teste

1. `/`
2. `/orcamento-com-pix`
3. `/gerador-de-qr-code-pix`
4. `/gerador-de-recibo`
5. `/modelos-de-orcamento`
6. `/orcamento-para/eletricista`
7. `/orcamento-para/pedreiro`
8. `/orcamento-para/encanador`
9. `/orcamento-para/pintor`
10. `/orcamento-para/instalacao-ar-condicionado`

## Agenda de 30 dias

- Semana 1: exportar Search Console por página e consulta; salvar CSV bruto e gerar painel sem substituir ausência por zero.
- Semana 2: publicar títulos, descrições, introduções, FAQs e links internos desta rodada; solicitar nova indexação apenas das URLs modificadas.
- Semana 3: revisar exemplos e fluxo móvel das cinco páginas profissionais; acompanhar clique no gerador, criação e compartilhamento.
- Semana 4: contatar até 20 parceiros relevantes, individualmente, oferecendo material útil e sem pedir troca artificial de links.

## Regra para novas URLs

Expansão programática fica suspensa durante este ciclo. Uma nova página só pode ser aprovada quando todos os itens abaixo estiverem registrados no PR:

- intenção de busca diferente de uma URL existente;
- exemplo específico e não intercambiável;
- campos, decisões ou fluxo próprios;
- conteúdo que não cabe como seção de uma página existente;
- URL canônica e três links internos planejados;
- consulta real do Search Console ou evidência externa documentada.

Variações apenas de canal, formato ou pagamento — “WhatsApp”, “PDF” ou “Pix” — devem ser consolidadas na landing existente.

## Métricas

Por URL: impressões, cliques, CTR, posição, clique no CTA, início do gerador, documento criado, link compartilhado e aprovação. Backlinks: domínio, URL de origem, destino, data, relevância e status.

## Implementação do ciclo de foco — 29/08/2026

- o sitemap canônico promove exatamente 30 URLs até a revisão de 28/09;
- `/orcamento-pix-copia-e-cola` foi consolidada por redirecionamento permanente em `/orcamento-com-pix`;
- variações programáticas de contratos, recibos por profissão, modelos genéricos e segmentos sem sinal receberam `noindex,follow` temporário;
- as páginas profissionais mantidas são eletricista, pedreiro, encanador, pintor, instalação de ar-condicionado, fotógrafo e manutenção residencial;
- a home, o gerador principal e as páginas profissionais passaram a exibir a jornada pedido → orçamento → aprovação → Pix → recibo;
- títulos de orçamento com Pix e proposta comercial entraram em teste de CTR;
- a meta de outreach de agosto já foi cumprida; o KPI seguinte é menção publicada e indexada, não novo volume de e-mails.

Fonte operacional: `outputs/seo-focus-2026-08-29/seo-action-plan-2026-08-29.xlsx`.
