import { getSession } from '@/lib/auth';
import { createDefaultSignature, normalizeSignature } from '@/lib/signatures/types';
import { createProposalItem } from './defaults';
import type { ProposalData } from './types';
import { deleteRemoteDocument, listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';

const STORAGE_PREFIX = 'resolva-jato-propostas';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

function normalizeProposal(value: ProposalData): ProposalData {
  const fallbackName = value.company?.name ?? '';
  return {
    ...value,
    status: value.status ?? 'rascunho',
    validityDays: Number(value.validityDays) || 15,
    company: {
      ...value.company,
      logoDataUrl: value.company?.logoDataUrl ?? ''
    },
    items: Array.isArray(value.items) && value.items.length > 0 ? value.items : [createProposalItem()],
    discountPercent: Number(value.discountPercent) || 0,
    shipping: Number(value.shipping) || 0,
    shippingInput: value.shippingInput ?? '',
    templateId: value.templateId ?? 'corporativa',
    inkSaver: value.inkSaver ?? false,
    signature: value.signature
      ? normalizeSignature(value.signature, fallbackName)
      : createDefaultSignature(fallbackName)
  };
}

export function listProposals(): ProposalData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProposalData[];
    return Array.isArray(parsed)
      ? parsed.map(normalizeProposal).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveProposal(proposal: ProposalData) {
  if (typeof window === 'undefined') return proposal;
  const next = normalizeProposal({ ...proposal, updatedAt: new Date().toISOString() });
  const proposals = listProposals();
  const index = proposals.findIndex((item) => item.id === next.id);
  const updated = index >= 0
    ? proposals.map((item, itemIndex) => (itemIndex === index ? next : item))
    : [next, ...proposals];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void saveRemoteDocument('propostas', next).catch(() => undefined);
  return next;
}

export function deleteProposal(proposalId: string) {
  if (typeof window === 'undefined') return;
  const updated = listProposals().filter((item) => item.id !== proposalId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void deleteRemoteDocument('propostas', proposalId).catch(() => undefined);
}

export async function loadProposals(): Promise<ProposalData[]> {
  const remote = (await listRemoteDocuments<ProposalData>('propostas')).map(normalizeProposal);
  if (remote.length > 0) return remote.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const legacy = listProposals();
  if (legacy.length) await Promise.all(legacy.map((item) => saveRemoteDocument('propostas', item)));
  return legacy;
}

export async function persistProposal(proposal: ProposalData): Promise<ProposalData> {
  const next = normalizeProposal({ ...proposal, updatedAt: new Date().toISOString() });
  return normalizeProposal(await saveRemoteDocument('propostas', next));
}

export async function removeProposal(proposalId: string) {
  await deleteRemoteDocument('propostas', proposalId);
}

