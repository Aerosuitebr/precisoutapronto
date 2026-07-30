import type { AssistantDocumentType } from '@/lib/assistant-briefing';

export type AssistantReview = {
  summary: string;
  suggestions: string[];
  alerts: string[];
  provider: 'local' | 'remote';
};

function cleanList(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 400)).filter(Boolean).slice(0, limit);
}

export function localAssistantReview(type: AssistantDocumentType, answers: Record<string, string>): AssistantReview {
  const suggestions: string[] = [];
  const alerts: string[] = [];
  const subject = answers.case?.trim() || 'o documento';
  if ((answers.case || '').length < 30) suggestions.push('Detalhe melhor o objetivo, as entregas e o resultado esperado.');
  if ((answers.payment || '').length < 15) suggestions.push('Informe valores, vencimentos, parcelas e forma de pagamento com precisão.');
  if (!(answers.risk || '').trim()) suggestions.push('Registre limites, exceções, responsabilidades e situações de cancelamento.');
  if (type === 'contrato') {
    alerts.push('Confirme a identificação completa das partes e o critério de aceite.');
    if (!/prazo|data|mês|dia/i.test(`${answers.case} ${answers.risk}`)) alerts.push('Nenhum prazo claro foi identificado.');
  } else if (type === 'curriculo') {
    suggestions.push('Adapte palavras-chave e resultados para a vaga desejada.');
    alerts.push('Evite documentos pessoais, endereço completo e informações sensíveis.');
  } else if (type === 'recibo') {
    alerts.push('Recibo comprova pagamento, mas não substitui nota fiscal quando ela for obrigatória.');
    if (!/r\$|real|pix|dinheiro|cartão|transfer/i.test(answers.payment || '')) alerts.push('Valor ou forma de pagamento não estão claros.');
  } else {
    suggestions.push('Separe entregáveis, cronograma, quantidade de revisões e critérios de aprovação.');
    alerts.push('Confira validade da proposta e itens fora do escopo.');
  }
  return {
    summary: `Briefing organizado para ${subject.slice(0, 100)}. Revise os pontos abaixo antes de gerar a versão final.`,
    suggestions: suggestions.slice(0, 4),
    alerts: alerts.slice(0, 4),
    provider: 'local'
  };
}

export async function reviewWithConfiguredProvider(type: AssistantDocumentType, answers: Record<string, string>) {
  const fallback = localAssistantReview(type, answers);
  const endpoint = process.env.DOCUMENT_AI_ENDPOINT?.trim();
  const apiKey = process.env.DOCUMENT_AI_API_KEY?.trim();
  if (!endpoint || !apiKey) return fallback;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        task: 'review_document_briefing',
        locale: 'pt-BR',
        documentType: type,
        answers,
        responseSchema: { summary: 'string', suggestions: 'string[]', alerts: 'string[]' }
      }),
      signal: AbortSignal.timeout(12_000),
      cache: 'no-store'
    });
    if (!response.ok) return fallback;
    const data = await response.json() as Record<string, unknown>;
    const suggestions = cleanList(data.suggestions, 5);
    const alerts = cleanList(data.alerts, 5);
    if (!suggestions.length && !alerts.length) return fallback;
    return {
      summary: typeof data.summary === 'string' ? data.summary.trim().slice(0, 600) : fallback.summary,
      suggestions,
      alerts,
      provider: 'remote' as const
    };
  } catch {
    return fallback;
  }
}
