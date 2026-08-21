import type { IntentEdgeRuleV1, IntentTransferSchemaV1 } from '@/lib/intent-graph/contracts';
import { parseIntentEdgeRule, parseIntentTransferSchema } from '@/lib/intent-graph/contracts';

export interface IntentEdgeAdminPatch {
  active?: boolean;
  weight?: number;
  transferSchema?: IntentTransferSchemaV1;
  ruleJson?: IntentEdgeRuleV1;
}

const FREQUENCY_CLASSES = new Set(['low', 'medium', 'high']);
const RISK_LEVELS = new Set(['low', 'medium', 'high']);

export interface IntentNodeAdminPatch {
  active?: boolean;
  label?: string;
  description?: string;
  frequencyClass?: string;
  riskLevel?: string;
}

function safeEditorialText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength || /[<>\u0000-\u001f]/.test(normalized)) return null;
  return normalized;
}

export function parseIntentNodeAdminPatch(value: unknown):
  | { ok: true; patch: IntentNodeAdminPatch }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Payload inválido.' };
  }
  const body = value as Record<string, unknown>;
  const allowed = new Set(['active', 'label', 'description', 'frequencyClass', 'riskLevel']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return { ok: false, error: 'Campo não permitido.' };
  }
  const patch: IntentNodeAdminPatch = {};
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') return { ok: false, error: 'active deve ser boolean.' };
    patch.active = body.active;
  }
  if (body.label !== undefined) {
    const label = safeEditorialText(body.label, 120);
    if (!label) return { ok: false, error: 'label inválido.' };
    patch.label = label;
  }
  if (body.description !== undefined) {
    const description = safeEditorialText(body.description, 500);
    if (!description) return { ok: false, error: 'description inválido.' };
    patch.description = description;
  }
  if (body.frequencyClass !== undefined) {
    if (typeof body.frequencyClass !== 'string' || !FREQUENCY_CLASSES.has(body.frequencyClass)) {
      return { ok: false, error: 'frequencyClass inválido.' };
    }
    patch.frequencyClass = body.frequencyClass;
  }
  if (body.riskLevel !== undefined) {
    if (typeof body.riskLevel !== 'string' || !RISK_LEVELS.has(body.riskLevel)) {
      return { ok: false, error: 'riskLevel inválido.' };
    }
    patch.riskLevel = body.riskLevel;
  }
  if (!Object.keys(patch).length) return { ok: false, error: 'Nenhuma alteração informada.' };
  return { ok: true, patch };
}

export function parseIntentEdgeAdminPatch(value: unknown):
  | { ok: true; patch: IntentEdgeAdminPatch }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Payload inválido.' };
  }
  const body = value as Record<string, unknown>;
  const allowed = new Set(['active', 'weight', 'transferSchema', 'ruleJson']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return { ok: false, error: 'Campo não permitido.' };
  }
  const patch: IntentEdgeAdminPatch = {};
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') return { ok: false, error: 'active deve ser boolean.' };
    patch.active = body.active;
  }
  if (body.weight !== undefined) {
    const weight = Number(body.weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 1 || Math.round(weight * 1000) !== weight * 1000) {
      return { ok: false, error: 'weight deve estar entre 0 e 1, com no máximo três casas decimais.' };
    }
    patch.weight = weight;
  }
  if (body.transferSchema !== undefined) {
    const transferSchema = parseIntentTransferSchema(body.transferSchema);
    if (!transferSchema) return { ok: false, error: 'transferSchema inválido.' };
    patch.transferSchema = transferSchema;
  }
  if (body.ruleJson !== undefined) {
    const ruleJson = parseIntentEdgeRule(body.ruleJson);
    if (!ruleJson) return { ok: false, error: 'ruleJson inválido.' };
    patch.ruleJson = ruleJson;
  }
  if (!Object.keys(patch).length) return { ok: false, error: 'Nenhuma alteração informada.' };
  return { ok: true, patch };
}
