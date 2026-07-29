import type { ReceiptData } from './types';
import { getSession } from '@/lib/auth';
import { normalizeSignature } from '@/lib/signatures/types';
import { deleteRemoteDocument, listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';

function normalizeReceipt(receipt: ReceiptData): ReceiptData {
  return {
    ...receipt,
    inkSaver: Boolean(receipt.inkSaver),
    signature: normalizeSignature(receipt.signature, receipt.receiver?.name ?? '')
  };
}

const STORAGE_PREFIX = 'resolva-jato-recibos';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

export function listReceipts(): ReceiptData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReceiptData[];
    return Array.isArray(parsed)
      ? parsed.map(normalizeReceipt).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveReceipt(receipt: ReceiptData) {
  if (typeof window === 'undefined') return receipt;
  const receipts = listReceipts();
  const next = normalizeReceipt({ ...receipt, updatedAt: new Date().toISOString() });
  const index = receipts.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? receipts.map((item, i) => (i === index ? next : item)) : [next, ...receipts];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void saveRemoteDocument('recibos', next).catch(() => undefined);
  return next;
}

export function deleteReceipt(receiptId: string) {
  if (typeof window === 'undefined') return;
  const updated = listReceipts().filter((item) => item.id !== receiptId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void deleteRemoteDocument('recibos', receiptId).catch(() => undefined);
}

export async function loadReceipts(): Promise<ReceiptData[]> {
  const remote = (await listRemoteDocuments<ReceiptData>('recibos')).map(normalizeReceipt);
  if (remote.length > 0) return remote.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const legacy = listReceipts();
  if (legacy.length) await Promise.all(legacy.map((item) => saveRemoteDocument('recibos', item)));
  return legacy;
}

export async function persistReceipt(receipt: ReceiptData): Promise<ReceiptData> {
  const next = normalizeReceipt({ ...receipt, updatedAt: new Date().toISOString() });
  return normalizeReceipt(await saveRemoteDocument('recibos', next));
}

export async function removeReceipt(receiptId: string) {
  await deleteRemoteDocument('recibos', receiptId);
}
