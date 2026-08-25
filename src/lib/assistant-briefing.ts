import { createEmptyContrato } from '@/lib/contratos/defaults';
import type { ContractData } from '@/lib/contratos/types';
import { createEmptyResume } from '@/lib/curriculo/defaults';
import type { ResumeData } from '@/lib/curriculo/types';
import { createEmptyReceipt } from '@/lib/recibos/defaults';
import type { ReceiptData } from '@/lib/recibos/types';
import { createEmptyProposal } from '@/lib/propostas/defaults';
import type { ProposalData } from '@/lib/propostas/types';

export type AssistantDocumentType = 'contrato' | 'curriculo' | 'recibo' | 'proposta';

export type AssistantBriefing = {
  type: AssistantDocumentType;
  answers: Record<string, string>;
  createdAt: string;
};

const STORAGE_KEY = 'precisoutapronto-assistant-briefing';
const MAX_AGE_MS = 30 * 60 * 1000;

export function saveAssistantBriefing(input: Omit<AssistantBriefing, 'createdAt'>) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...input, createdAt: new Date().toISOString() }));
}

export function consumeAssistantBriefing(expectedType: AssistantDocumentType) {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const briefing = JSON.parse(raw) as AssistantBriefing;
    if (briefing.type !== expectedType) return null;
    if (Date.now() - Date.parse(briefing.createdAt) > MAX_AGE_MS) return null;
    return briefing;
  } catch {
    return null;
  }
}

export function contractFromBriefing(briefing: AssistantBriefing): ContractData {
  const draft = createEmptyContrato('prestacao-servicos');
  return {
    ...draft,
    title: briefing.answers.case ? `Contrato · ${briefing.answers.case.slice(0, 70)}` : draft.title,
    objectDescription: briefing.answers.case || '',
    paymentTerms: briefing.answers.payment || '',
    extraNotes: briefing.answers.risk || ''
  };
}

export function resumeFromBriefing(briefing: AssistantBriefing): ResumeData {
  const draft = createEmptyResume();
  return {
    ...draft,
    title: briefing.answers.case ? `Currículo · ${briefing.answers.case.slice(0, 70)}` : draft.title,
    personal: {
      ...draft.personal,
      headline: briefing.answers.case || '',
      summary: briefing.answers.payment || ''
    },
    skills: (briefing.answers.risk || '').split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)
  };
}

export function receiptFromBriefing(briefing: AssistantBriefing): ReceiptData {
  const draft = createEmptyReceipt();
  return {
    ...draft,
    title: briefing.answers.case ? `Recibo · ${briefing.answers.case.slice(0, 70)}` : draft.title,
    reference: briefing.answers.case || '',
    notes: [briefing.answers.payment && `Pagamento: ${briefing.answers.payment}`, briefing.answers.risk && `Partes: ${briefing.answers.risk}`].filter(Boolean).join('\n')
  };
}

export function proposalFromBriefing(briefing: AssistantBriefing): ProposalData {
  const draft = createEmptyProposal('criativa');
  return {
    ...draft,
    title: briefing.answers.case ? `Proposta · ${briefing.answers.case.slice(0, 70)}` : draft.title,
    introduction: briefing.answers.case || draft.introduction,
    paymentTerms: briefing.answers.payment || draft.paymentTerms,
    items: [{ ...draft.items[0], name: briefing.answers.case || '', description: briefing.answers.risk || '' }]
  };
}
