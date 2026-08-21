import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { redactFeedbackPii } from './helpfulness';

const SOURCES = new Set(['search', 'tool', 'feedback', 'assistant', 'unknown']);

export function normalizeResolutionIntent(value: string) {
  const text = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const rules: Array<[string, RegExp]> = [
    ['document.contract', /contrato|clausula|juridic/],
    ['document.receipt', /recibo|comprovante/],
    ['document.quote', /orcamento|proposta|cotacao/],
    ['finance.calculation', /calculo|rescisao|ferias|salario|preco/],
    ['pdf.operation', /\bpdf\b|juntar|editar arquivo/],
    ['image.operation', /imagem|foto|fundo/],
    ['account.support', /conta|login|senha|assinatura/]
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || 'unclassified';
}

export function parseResolutionRequest(value: unknown):
  { ok: true; data: { rawText: string; source: string } } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid-input' };
  const input = value as Record<string, unknown>;
  const allowed = new Set(['rawText', 'source']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { ok: false, error: 'unknown-field' };
  if (typeof input.rawText !== 'string') return { ok: false, error: 'invalid-text' };
  const rawText = input.rawText.trim();
  if (rawText.length < 3 || rawText.length > 2000) return { ok: false, error: 'invalid-text' };
  if (typeof input.source !== 'string' || !SOURCES.has(input.source)) return { ok: false, error: 'invalid-source' };
  return { ok: true, data: { rawText: redactFeedbackPii(rawText), source: input.source } };
}

interface RequestDependencies {
  databaseConfigured: () => boolean;
  persist: (request: Prisma.ResolutionRequestUncheckedCreateInput) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: RequestDependencies = {
  databaseConfigured: isDatabaseConfigured,
  persist: async (request) => { await getPrisma().resolutionRequest.create({ data: request }); },
  uuid: randomUUID,
  now: () => new Date()
};

export async function createResolutionRequest(
  identity: { userId?: string; anonymousId: string },
  input: unknown,
  dependencies: RequestDependencies = defaultDependencies
) {
  try {
    const parsed = parseResolutionRequest(input);
    if (!parsed.ok || !identity.anonymousId || !dependencies.databaseConfigured()) return null;
    const id = dependencies.uuid();
    const createdAt = dependencies.now();
    const normalizedIntent = normalizeResolutionIntent(parsed.data.rawText);
    await dependencies.persist({
      id,
      userId: identity.userId || null,
      anonymousId: identity.anonymousId,
      rawText: parsed.data.rawText,
      normalizedIntent,
      source: parsed.data.source,
      status: 'received',
      createdAt
    });
    return { requestId: id, normalizedIntent, createdAt: createdAt.toISOString() };
  } catch (error) {
    console.error('[feedback] resolution request create failed', { error });
    return null;
  }
}
