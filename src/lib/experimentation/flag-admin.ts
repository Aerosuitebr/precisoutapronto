const FLAG_KEY_RE = /^[a-z][a-z0-9_]{2,79}$/;
const SUBJECT_HASH_RE = /^[0-9a-f]{64}$/;
const MAX_SUBJECT_OVERRIDES = 100;

export interface FeatureFlagAdminPatch {
  enabled?: boolean;
  rolloutPercent?: number;
  rules?: {
    includeSubjectHashes: string[];
    excludeSubjectHashes: string[];
  };
}

export function isValidFeatureFlagKey(key: string) {
  return FLAG_KEY_RE.test(key);
}

export function parseFeatureFlagAdminPatch(value: unknown):
  | { ok: true; patch: FeatureFlagAdminPatch }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Payload inválido.' };
  }
  const body = value as Record<string, unknown>;
  const allowedKeys = new Set(['enabled', 'rolloutPercent', 'rules']);
  if (Object.keys(body).some((key) => !allowedKeys.has(key))) {
    return { ok: false, error: 'Campo não permitido.' };
  }
  const patch: FeatureFlagAdminPatch = {};
  if (body.enabled !== undefined) {
    if (typeof body.enabled !== 'boolean') return { ok: false, error: 'enabled deve ser boolean.' };
    patch.enabled = body.enabled;
  }
  if (body.rolloutPercent !== undefined) {
    if (!Number.isInteger(body.rolloutPercent) || Number(body.rolloutPercent) < 0 || Number(body.rolloutPercent) > 100) {
      return { ok: false, error: 'rolloutPercent deve ser inteiro entre 0 e 100.' };
    }
    patch.rolloutPercent = Number(body.rolloutPercent);
  }
  if (body.rules !== undefined) {
    if (!body.rules || typeof body.rules !== 'object' || Array.isArray(body.rules)) {
      return { ok: false, error: 'rules inválido.' };
    }
    const rules = body.rules as Record<string, unknown>;
    const allowedRuleKeys = new Set(['includeSubjectHashes', 'excludeSubjectHashes']);
    if (Object.keys(rules).some((key) => !allowedRuleKeys.has(key))) {
      return { ok: false, error: 'Regra não permitida.' };
    }
    const readHashes = (key: string) => {
      const list = rules[key] ?? [];
      if (!Array.isArray(list) || list.length > MAX_SUBJECT_OVERRIDES) return null;
      if (!list.every((item) => typeof item === 'string' && SUBJECT_HASH_RE.test(item))) return null;
      return [...new Set(list as string[])];
    };
    const includeSubjectHashes = readHashes('includeSubjectHashes');
    const excludeSubjectHashes = readHashes('excludeSubjectHashes');
    if (!includeSubjectHashes || !excludeSubjectHashes) {
      return { ok: false, error: 'Subject hashes inválidos.' };
    }
    if (includeSubjectHashes.some((hash) => excludeSubjectHashes.includes(hash))) {
      return { ok: false, error: 'Um subject não pode estar simultaneamente incluído e excluído.' };
    }
    patch.rules = { includeSubjectHashes, excludeSubjectHashes };
  }
  if (!Object.keys(patch).length) return { ok: false, error: 'Nenhuma alteração informada.' };
  return { ok: true, patch };
}
