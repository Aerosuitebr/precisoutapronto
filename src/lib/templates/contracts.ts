export interface PersonalTemplateCreateInput {
  sourceArtifactId: string;
  name: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parsePersonalTemplateCreate(value: unknown):
  { ok: true; data: PersonalTemplateCreateInput } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid-input' };
  const input = value as Record<string, unknown>;
  const allowed = new Set(['sourceArtifactId', 'name']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { ok: false, error: 'unknown-field' };
  if (typeof input.sourceArtifactId !== 'string' || !UUID.test(input.sourceArtifactId)) {
    return { ok: false, error: 'invalid-source-artifact' };
  }
  if (typeof input.name !== 'string') return { ok: false, error: 'invalid-name' };
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120 || /[<>\u0000-\u001f]/.test(name)) {
    return { ok: false, error: 'invalid-name' };
  }
  return { ok: true, data: { sourceArtifactId: input.sourceArtifactId, name } };
}
