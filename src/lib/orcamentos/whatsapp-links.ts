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
  /** Inclui marca Resolva Jato (plano grátis do profissional). */
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
