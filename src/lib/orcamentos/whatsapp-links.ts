import { formatCurrency } from '@/lib/formatters';
import { withViralMessageBrand } from '@/lib/viral-loop';
import { buildStructuredWhatsAppMessage } from '@/lib/whatsapp/message-format';

function digitsPhone(value: string) {
  const digits = value.replace(/\D+/g, '');
  if (digits.length >= 10 && !digits.startsWith('55')) return `55${digits}`;
  return digits;
}

export function buildProfissionalWhatsAppNotifyText(input: {
  profissionalNome: string;
  clienteNome: string;
  total: number;
  status: 'approved' | 'declined';
  feedbackCliente?: string | null;
  publicUrl: string;
  /** Inclui marca Precisou, Tá Pronto (plano grátis do profissional). */
  branded?: boolean;
}) {
  const base = buildStructuredWhatsAppMessage({
    title: input.status === 'approved' ? 'ORÇAMENTO APROVADO' : 'AJUSTE SOLICITADO',
    subtitle: `Retorno de ${input.clienteNome}`,
    sections: [
      {
        title: 'RESUMO',
        lines: [
          `Profissional: ${input.profissionalNome}`,
          `Valor: ${formatCurrency(input.total)}`,
          input.status === 'declined' ? `Motivo: ${input.feedbackCliente || 'Não informado'}` : 'Cliente confirmou a aprovação',
        ],
      },
    ],
    actionLabel: 'ABRIR ORÇAMENTO',
    actionUrl: input.publicUrl,
  });
  return withViralMessageBrand(base, input.branded !== false, 'orcamento_notify');
}

export function buildProfissionalWhatsAppNotifyUrl(input: {
  profissionalNome: string;
  profissionalWhatsapp: string;
  clienteNome: string;
  total: number;
  status: 'approved' | 'declined';
  feedbackCliente?: string | null;
  publicUrl: string;
  branded?: boolean;
}) {
  const phone = digitsPhone(input.profissionalWhatsapp);
  const text = buildProfissionalWhatsAppNotifyText(input);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildClienteWhatsAppSendUrl(params: {
  clienteWhatsapp: string;
  clienteNome: string;
  profissionalNome: string;
  url: string;
  total: number;
  branded?: boolean;
}) {
  const phone = digitsPhone(params.clienteWhatsapp);
  const text = buildClienteOrcamentoWhatsAppText({
    clienteNome: params.clienteNome,
    profissionalNome: params.profissionalNome,
    total: params.total,
    url: params.url,
    branded: params.branded
  });
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildClienteOrcamentoWhatsAppText(params: {
  clienteNome: string;
  profissionalNome: string;
  total: number;
  url: string;
  branded?: boolean;
}) {
  const base = buildStructuredWhatsAppMessage({
    title: 'ORÇAMENTO PARA ANÁLISE',
    subtitle: `Olá, ${params.clienteNome}. ${params.profissionalNome} enviou uma proposta.`,
    sections: [
      {
        title: 'RESUMO',
        lines: [
          `Valor total: ${formatCurrency(params.total)}`,
          'Abra o link para conferir os itens, aprovar ou solicitar ajustes',
          'Não é necessário criar conta',
        ],
      },
    ],
    actionLabel: 'VER ORÇAMENTO',
    actionUrl: params.url,
  });
  return withViralMessageBrand(base, params.branded !== false, 'orcamento_whatsapp');
}

export function getQuoteFollowUpState(
  createdAt: string,
  status: string,
  now = new Date(),
  firstViewedAt = ''
) {
  const viewed = firstViewedAt ? new Date(firstViewedAt) : null;
  const created = new Date(createdAt);
  const anchor = viewed && Number.isFinite(viewed.getTime()) ? viewed : created;
  const ageDays = Number.isFinite(anchor.getTime())
    ? Math.max(0, Math.floor((now.getTime() - anchor.getTime()) / 86_400_000))
    : 0;
  return {
    ageDays,
    viewed: Boolean(viewed && Number.isFinite(viewed.getTime())),
    due: status === 'pending' && ageDays >= 2,
    urgency: ageDays >= 5 ? ('high' as const) : ageDays >= 2 ? ('normal' as const) : ('none' as const)
  };
}

export function buildClienteFollowUpWhatsAppUrl(params: {
  clienteWhatsapp: string;
  clienteNome: string;
  profissionalNome: string;
  url: string;
  total: number;
  viewed?: boolean;
  branded?: boolean;
}) {
  const phone = digitsPhone(params.clienteWhatsapp);
  const base = buildStructuredWhatsAppMessage({
    title: 'LEMBRETE DO ORÇAMENTO',
    subtitle: params.viewed
      ? `Olá, ${params.clienteNome}. Passando para saber se conseguiu analisar a proposta.`
      : `Olá, ${params.clienteNome}. Reenvio o orçamento caso o link tenha se perdido nas mensagens.`,
    sections: [{
      title: 'RESUMO',
      lines: [
        `Valor total: ${formatCurrency(params.total)}`,
        params.viewed
          ? 'Você pode aprovar ou pedir um ajuste diretamente pelo link'
          : 'Abra o link para conferir os itens, aprovar ou pedir um ajuste',
        'Se tiver alguma dúvida, responda esta mensagem'
      ]
    }],
    actionLabel: 'REVER ORÇAMENTO',
    actionUrl: params.url
  });
  const text = withViralMessageBrand(base, params.branded !== false, 'orcamento_follow_up');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
