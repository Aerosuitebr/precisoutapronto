import type { ContractData } from '@/lib/contratos/types';
import type { ResumeData } from '@/lib/curriculo/types';
import type { ProposalData } from '@/lib/propostas/types';
import type { ReceiptData } from '@/lib/recibos/types';

export interface ProfileMemory {
  companyName: string;
  occupation: string;
}

export interface ProfileMemoryResult<T> {
  document: T;
  applied: string[];
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 120) : '';
}

export function normalizeProfileMemory(value: unknown): ProfileMemory | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as Record<string, unknown>;
  const companyName = clean(source.companyName);
  const occupation = clean(source.occupation);
  return companyName || occupation ? { companyName, occupation } : null;
}

export function applyProfileToContract(
  document: ContractData,
  profile: ProfileMemory | null
): ProfileMemoryResult<ContractData> {
  if (!profile) return { document, applied: [] };
  const applied: string[] = [];
  const partyA = { ...document.partyA };

  if (!partyA.name.trim() && profile.companyName) {
    partyA.name = profile.companyName;
    applied.push('partyA.name');
  }
  if (!partyA.profession.trim() && profile.occupation) {
    partyA.profession = profile.occupation;
    applied.push('partyA.profession');
  }

  return { document: applied.length ? { ...document, partyA } : document, applied };
}

export function applyProfileToResume(
  document: ResumeData,
  profile: ProfileMemory | null
): ProfileMemoryResult<ResumeData> {
  if (!profile || document.personal.headline.trim() || !profile.occupation) {
    return { document, applied: [] };
  }
  return {
    document: {
      ...document,
      personal: { ...document.personal, headline: profile.occupation }
    },
    applied: ['personal.headline']
  };
}

export function applyProfileToReceipt(
  document: ReceiptData,
  profile: ProfileMemory | null
): ProfileMemoryResult<ReceiptData> {
  if (!profile || document.receiver.name.trim() || !profile.companyName) {
    return { document, applied: [] };
  }
  return {
    document: {
      ...document,
      receiver: { ...document.receiver, name: profile.companyName }
    },
    applied: ['receiver.name']
  };
}

export function applyProfileToProposal(
  document: ProposalData,
  profile: ProfileMemory | null
): ProfileMemoryResult<ProposalData> {
  if (!profile || !profile.companyName) return { document, applied: [] };
  const applied: string[] = [];
  const company = { ...document.company };
  const signature = { ...document.signature };

  if (!company.name.trim()) {
    company.name = profile.companyName;
    applied.push('company.name');
  }
  if (!signature.text.trim()) {
    signature.text = profile.companyName;
    applied.push('signature.text');
  }

  return {
    document: applied.length ? { ...document, company, signature } : document,
    applied
  };
}
