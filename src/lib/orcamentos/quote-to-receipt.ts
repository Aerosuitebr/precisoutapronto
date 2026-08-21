import { createEmptyReceipt } from '@/lib/recibos/defaults';
import type { ReceiptData } from '@/lib/recibos/types';

export const QUOTE_RECEIPT_TRANSFER_KEY = 'rj_quote_receipt_transfer_v1';

export interface QuoteReceiptTransfer {
  receiverName: string;
  payerName: string;
  amount: number;
  itemNames: string[];
}

export function normalizeQuoteReceiptTransfer(value: unknown): QuoteReceiptTransfer | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const receiverName = typeof row.receiverName === 'string' ? row.receiverName.trim().slice(0, 120) : '';
  const payerName = typeof row.payerName === 'string' ? row.payerName.trim().slice(0, 120) : '';
  const amount = Number(row.amount);
  const itemNames = Array.isArray(row.itemNames)
    ? row.itemNames.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 120)).filter(Boolean).slice(0, 20)
    : [];
  if (!receiverName || !payerName || !Number.isFinite(amount) || amount <= 0 || amount > 10_000_000 || !itemNames.length) return null;
  return { receiverName, payerName, amount, itemNames };
}

export function saveQuoteReceiptTransfer(value: QuoteReceiptTransfer) {
  if (typeof window === 'undefined') return false;
  const safe = normalizeQuoteReceiptTransfer(value);
  if (!safe) return false;
  try {
    window.sessionStorage.setItem(QUOTE_RECEIPT_TRANSFER_KEY, JSON.stringify(safe));
    return true;
  } catch { return false; }
}

export function consumeQuoteReceiptTransfer(): QuoteReceiptTransfer | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(QUOTE_RECEIPT_TRANSFER_KEY);
    window.sessionStorage.removeItem(QUOTE_RECEIPT_TRANSFER_KEY);
  } catch { return null; }
  if (!raw) return null;
  try { return normalizeQuoteReceiptTransfer(JSON.parse(raw)); } catch { return null; }
}

export function receiptFromApprovedQuote(transfer: QuoteReceiptTransfer): ReceiptData {
  const safe = normalizeQuoteReceiptTransfer(transfer);
  const receipt = createEmptyReceipt();
  if (!safe) return receipt;
  return {
    ...receipt,
    title: 'Recibo de orçamento aprovado',
    amount: safe.amount,
    amountInput: safe.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    reference: safe.itemNames.join(', ').slice(0, 300),
    receiver: { ...receipt.receiver, name: safe.receiverName },
    payer: { ...receipt.payer, name: safe.payerName },
    notes: 'Confira se o pagamento foi recebido antes de emitir este recibo.',
    updatedAt: new Date().toISOString()
  };
}
