const SAFE_KEY_RE = /^[a-z][a-z0-9_-]{0,79}$/;
const SAFE_FIELD_RE = /^[a-z][a-z0-9_]{0,63}$/;
const MAX_TRANSFER_FIELDS = 32;

export interface IntentTransferSchemaV1 {
  version: 1;
  fields: string[];
}

export interface IntentEdgeRuleV1 {
  requiresOutcome?: 'completed';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isSafeIntentKey(value: string) {
  return SAFE_KEY_RE.test(value);
}

export function parseIntentTransferSchema(value: unknown): IntentTransferSchemaV1 | null {
  if (!isObject(value) || value.version !== 1 || !Array.isArray(value.fields)) return null;
  if (Object.keys(value).some((key) => !['version', 'fields'].includes(key))) return null;
  if (value.fields.length > MAX_TRANSFER_FIELDS) return null;
  if (!value.fields.every((field) => typeof field === 'string' && SAFE_FIELD_RE.test(field))) return null;
  return { version: 1, fields: [...new Set(value.fields as string[])] };
}

export function parseIntentEdgeRule(value: unknown): IntentEdgeRuleV1 | null {
  if (!isObject(value)) return null;
  if (Object.keys(value).some((key) => key !== 'requiresOutcome')) return null;
  if (value.requiresOutcome !== undefined && value.requiresOutcome !== 'completed') return null;
  return value.requiresOutcome === 'completed' ? { requiresOutcome: 'completed' } : {};
}
