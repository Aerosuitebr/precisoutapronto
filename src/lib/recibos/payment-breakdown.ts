import { formatCurrency } from '@/lib/formatters';

export type ReceiptPaymentKind = 'integral' | 'entrada' | 'parcial' | 'saldo';
export const RECEIPT_PAYMENT_LABELS: Record<ReceiptPaymentKind, string> = {
  integral: 'Pagamento integral', entrada: 'Entrada / sinal', parcial: 'Parcela intermediária', saldo: 'Quitação do saldo'
};

/** Unmasked Brazilian input: 490 means R$ 490,00, never R$ 4,90. */
export function parseReceiptMoney(input: string): number {
  const value = input.trim().replace(/^R\$\s*/, '');
  if (!value) return 0;
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) return NaN;
  return Number(value.replace(/\./g, '').replace(',', '.'));
}

/** Calculate in cents so an exact final installment does not leave floating-point debt. */
export function receiptPaymentBreakdown(kind: ReceiptPaymentKind, total: number, previous: number, amount: number) {
  const values = kind === 'integral' ? [amount, 0, amount] : [total, kind === 'entrada' ? 0 : previous, amount];
  if (values.some(value => !Number.isFinite(value) || value < 0 || value > 10_000_000)) {
    return { error: 'Informe valores válidos entre zero e R$ 10.000.000,00.', remaining: 0, notes: '' };
  }
  const [totalCents, previousCents, amountCents] = values.map(value => Math.round(value * 100));
  const remaining = (totalCents - previousCents - amountCents) / 100;
  if (totalCents <= 0 || amountCents <= 0) return { error: 'Informe o total do serviço e o valor recebido, maiores que zero.', remaining, notes: '' };
  if (remaining < 0) return { error: 'Os recebimentos ultrapassam o total do serviço. Confira os valores.', remaining, notes: '' };
  if (kind === 'saldo' && remaining !== 0) return { error: 'Para quitar o saldo, o valor recebido deve completar o total do serviço.', remaining, notes: '' };
  const notes = kind === 'integral' ? '' : `${RECEIPT_PAYMENT_LABELS[kind]}. Total do serviço: ${formatCurrency(totalCents / 100)}. Recebido anteriormente: ${formatCurrency(previousCents / 100)}. Recebido neste recibo: ${formatCurrency(amountCents / 100)}. Saldo a receber: ${formatCurrency(remaining)}. Este recibo registra somente o pagamento indicado, sem declarar recebidos valores pendentes.`;
  return { error: '', remaining, notes };
}
