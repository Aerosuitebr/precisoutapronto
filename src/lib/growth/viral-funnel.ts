export interface ViralFunnelCounts {
  quotes: number;
  viewed: number;
  recruitClicked: number;
  approved: number;
  adjustments: number;
  recruitedQuotes: number;
  newCreators: number;
  activeCreators: number;
  repeatCreators: number;
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;
}

export function viralFunnelMetrics(counts: ViralFunnelCounts) {
  const responses = counts.approved + counts.adjustments;
  const k100 = counts.quotes ? Number(((counts.newCreators / counts.quotes) * 100).toFixed(1)) : 0;
  const responseRate = pct(responses, counts.quotes);
  const viewRate = pct(counts.viewed, counts.quotes);
  const responseFromViewRate = pct(responses, counts.viewed);
  const recruitClickRate = pct(counts.recruitClicked, responses);
  const recruitCompletionRate = pct(counts.recruitedQuotes, counts.recruitClicked);
  const approvalRate = pct(counts.approved, responses);
  const viralQuoteRate = pct(counts.recruitedQuotes, counts.quotes);
  const repeatCreatorRate = pct(counts.repeatCreators, counts.activeCreators);

  const alerts: string[] = [];
  if (counts.quotes >= 10 && viewRate < 60) alerts.push('Poucos destinatários abrem o orçamento: revisar entrega e texto do WhatsApp.');
  if (counts.viewed >= 10 && responseFromViewRate < 40) alerts.push('Muitas aberturas sem resposta: tornar aprovação e pedido de ajuste mais evidentes.');
  if (responses >= 10 && recruitClickRate < 25) alerts.push('Poucos clientes iniciam o ciclo viral: testar promessa e posição do convite pós-resposta.');
  if (counts.recruitClicked >= 10 && recruitCompletionRate < 25) alerts.push('Muitos cliques não viram orçamento: reduzir campos e acelerar o primeiro resultado.');
  if (counts.quotes >= 10 && responseRate < 35) alerts.push('Poucos destinatários respondem: revisar mensagem e CTA de aprovação.');
  if (responses >= 10 && approvalRate < 55) alerts.push('Aprovação baixa: revisar clareza, validade e apresentação dos itens.');
  if (counts.quotes >= 10 && viralQuoteRate < 5) alerts.push('Poucos orçamentos nascem do ciclo viral: reforçar “crie um como este”.');
  if (counts.activeCreators >= 10 && repeatCreatorRate < 25) alerts.push('Retenção baixa: priorizar reuso de clientes, serviços e lembretes.');

  return { responses, k100, viewRate, responseFromViewRate, recruitClickRate, recruitCompletionRate, responseRate, approvalRate, viralQuoteRate, repeatCreatorRate, alerts };
}
