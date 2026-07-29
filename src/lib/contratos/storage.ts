import { normalizeDocumentParty } from '@/lib/document-party';
import { getSession } from '@/lib/auth';
import { buildDefaultClauses } from './clauses';
import { createEmptyContrato } from './defaults';
import type { ContractData, ContractParty } from './types';
import { deleteRemoteDocument, listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';

const STORAGE_PREFIX = 'resolva-jato-contratos';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

function normalizeParty(value?: Partial<ContractParty>): ContractParty {
  return normalizeDocumentParty(value) as ContractParty;
}

function normalizeContrato(value: ContractData): ContractData {
  const base = createEmptyContrato(value.templateId ?? 'prestacao-servicos');
  const merged: ContractData = {
    ...base,
    ...value,
    partyA: normalizeParty(value.partyA),
    partyB: normalizeParty(value.partyB),
    clauses: Array.isArray(value.clauses) && value.clauses.length > 0 ? value.clauses : []
  };
  if (!merged.clauses.length) {
    merged.clauses = buildDefaultClauses(merged);
  }
  return merged;
}

export function listContratos(): ContractData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContractData[];
    return Array.isArray(parsed)
      ? parsed.map(normalizeContrato).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveContrato(contrato: ContractData) {
  if (typeof window === 'undefined') return contrato;
  const next = normalizeContrato({ ...contrato, updatedAt: new Date().toISOString() });
  const items = listContratos();
  const index = items.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? items.map((item, i) => (i === index ? next : item)) : [next, ...items];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void saveRemoteDocument('contratos', next).catch(() => undefined);
  return next;
}

export function deleteContrato(contratoId: string) {
  if (typeof window === 'undefined') return;
  const updated = listContratos().filter((item) => item.id !== contratoId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void deleteRemoteDocument('contratos', contratoId).catch(() => undefined);
}

export async function loadContratos(): Promise<ContractData[]> {
  const remote = (await listRemoteDocuments<ContractData>('contratos')).map(normalizeContrato);
  if (remote.length > 0) return remote.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const legacy = listContratos();
  if (legacy.length) await Promise.all(legacy.map((item) => saveRemoteDocument('contratos', item)));
  return legacy;
}

export async function persistContrato(contrato: ContractData): Promise<ContractData> {
  const next = normalizeContrato({ ...contrato, updatedAt: new Date().toISOString() });
  return normalizeContrato(await saveRemoteDocument('contratos', next));
}

export async function removeContrato(contratoId: string) {
  await deleteRemoteDocument('contratos', contratoId);
}
