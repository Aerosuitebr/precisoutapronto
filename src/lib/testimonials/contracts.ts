export const TESTIMONIAL_CONSENT_VERSION = 'testimonial-v1';
const TOOLS = new Set(['orcamento', 'pix', 'recibo', 'proposta', 'contrato', 'curriculo', 'calculadora', 'outro']);
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';

export function parseTestimonialSubmission(input: unknown) {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  if (raw.consent !== true || raw.consentVersion !== TESTIMONIAL_CONSENT_VERSION) return null;
  const publicName = clean(raw.publicName, 80);
  const profession = clean(raw.profession, 80);
  const city = clean(raw.city, 80);
  const state = clean(raw.state, 2).toUpperCase();
  const toolKey = clean(raw.toolKey, 40);
  const quote = clean(raw.quote, 800);
  if (publicName.length < 2 || profession.length < 2 || city.length < 2 || !/^[A-Z]{2}$/.test(state) || !TOOLS.has(toolKey) || quote.length < 30) return null;
  return { publicName, profession, city, state, toolKey, quote, consentVersion: TESTIMONIAL_CONSENT_VERSION };
}
