export const CONTEXT_CONSENT_VERSION = 'context-v1';

const PROFILE_FIELDS = new Set([
  'consent', 'consentVersion', 'mode', 'displayName', 'legalName', 'taxId',
  'email', 'phone', 'address', 'pix', 'preferences'
]);
const ADDRESS_FIELDS = new Set(['line1', 'line2', 'city', 'state', 'postalCode', 'country']);
const PIX_FIELDS = new Set(['keyType', 'key']);
const PREFERENCE_FIELDS = new Set(['defaultCurrency', 'locale', 'reuseBusinessContext']);

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function unknownKey(value: Record<string, unknown>, allowed: Set<string>) {
  return Object.keys(value).find((key) => !allowed.has(key));
}

function optionalText(value: unknown, max: number) {
  return value === undefined || (typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max);
}

export function parseBusinessContextWrite(value: unknown):
  | { ok: true; data: Record<string, unknown> & { consentVersion: typeof CONTEXT_CONSENT_VERSION } }
  | { ok: false; error: string } {
  const input = objectRecord(value);
  if (!input) return { ok: false, error: 'invalid-input' };
  if (unknownKey(input, PROFILE_FIELDS)) return { ok: false, error: 'unknown-field' };
  if (input.consent !== true || input.consentVersion !== CONTEXT_CONSENT_VERSION) {
    return { ok: false, error: 'explicit-consent-required' };
  }
  if (input.mode !== 'patch' && input.mode !== 'replace') return { ok: false, error: 'invalid-mode' };
  if (!optionalText(input.displayName, 120) || !optionalText(input.legalName, 160)) {
    return { ok: false, error: 'invalid-name' };
  }
  if (input.taxId !== undefined && (typeof input.taxId !== 'string' || !/^(\d{11}|\d{14})$/.test(input.taxId.replace(/\D/g, '')))) {
    return { ok: false, error: 'invalid-tax-id' };
  }
  if (input.email !== undefined && (typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))) {
    return { ok: false, error: 'invalid-email' };
  }
  if (input.phone !== undefined && (typeof input.phone !== 'string' || !/^\+?[1-9]\d{7,14}$/.test(input.phone.replace(/[\s()-]/g, '')))) {
    return { ok: false, error: 'invalid-phone' };
  }

  if (input.address !== undefined) {
    const address = objectRecord(input.address);
    if (!address || unknownKey(address, ADDRESS_FIELDS)) return { ok: false, error: 'invalid-address' };
    if (!optionalText(address.line1, 160) || !optionalText(address.line2, 160)
      || !optionalText(address.city, 100) || !optionalText(address.state, 60)
      || !optionalText(address.postalCode, 20) || !optionalText(address.country, 2)) {
      return { ok: false, error: 'invalid-address' };
    }
  }
  if (input.pix !== undefined) {
    const pix = objectRecord(input.pix);
    if (!pix || unknownKey(pix, PIX_FIELDS)
      || !['cpf', 'cnpj', 'email', 'phone', 'random'].includes(String(pix.keyType || ''))
      || !optionalText(pix.key, 160) || pix.key === undefined) {
      return { ok: false, error: 'invalid-pix' };
    }
  }
  if (input.preferences !== undefined) {
    const preferences = objectRecord(input.preferences);
    if (!preferences || unknownKey(preferences, PREFERENCE_FIELDS)) return { ok: false, error: 'invalid-preferences' };
    if (preferences.defaultCurrency !== undefined && preferences.defaultCurrency !== 'BRL') return { ok: false, error: 'invalid-preferences' };
    if (preferences.locale !== undefined && preferences.locale !== 'pt-BR') return { ok: false, error: 'invalid-preferences' };
    if (preferences.reuseBusinessContext !== undefined && typeof preferences.reuseBusinessContext !== 'boolean') {
      return { ok: false, error: 'invalid-preferences' };
    }
  }

  const contentKeys = Object.keys(input).filter((key) => !['consent', 'consentVersion', 'mode'].includes(key));
  if (contentKeys.length === 0) return { ok: false, error: 'empty-update' };
  return { ok: true, data: { ...input, consentVersion: CONTEXT_CONSENT_VERSION } };
}
