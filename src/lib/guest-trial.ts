import { getSession } from '@/lib/auth';

export const GUEST_TRIAL_STORAGE_KEY = 'rj_guest_exports';
/** Gerações/exportações livres antes de pedir cadastro (ferramentas fora do loop viral). */
export const GUEST_TRIAL_LIMIT = 2;
/** Orçamento e recibo: o PDF/link precisa sair sem conta para circular no WhatsApp. */
export const OPEN_GUEST_TOOL_IDS = ['orcamentos', 'recibos'] as const;

export function isOpenGuestTool(toolId: string | undefined): boolean {
  if (!toolId) return false;
  return (OPEN_GUEST_TOOL_IDS as readonly string[]).includes(toolId);
}

export const GUEST_TRIAL_CONSUMED_EVENT = 'rj-guest-trial-consumed';
export const POST_SIGNUP_PREMIUM_OFFER_KEY = 'rj_post_signup_premium_offer';

export function markPostSignupPremiumOffer(nextHref: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      POST_SIGNUP_PREMIUM_OFFER_KEY,
      JSON.stringify({ nextHref, createdAt: Date.now() })
    );
  } catch {
    // A oferta é opcional; falha de storage não deve bloquear o cadastro.
  }
}

export function consumePostSignupPremiumOffer(): { nextHref: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(POST_SIGNUP_PREMIUM_OFFER_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(POST_SIGNUP_PREMIUM_OFFER_KEY);
    const parsed = JSON.parse(raw) as { nextHref?: string; createdAt?: number };
    if (!parsed.createdAt || Date.now() - parsed.createdAt > 24 * 60 * 60 * 1000) return null;
    return { nextHref: parsed.nextHref || '/ferramentas' };
  } catch {
    return null;
  }
}

function readCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(GUEST_TRIAL_STORAGE_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
}

/** Ainda há a degustação completa (PDF/link/WhatsApp com rodapé da marca). */
export function hasGuestTrialAvailable(): boolean {
  if (getSession()) return false;
  return readCount() < GUEST_TRIAL_LIMIT;
}

export function getGuestExportCount(): number {
  return readCount();
}

/** Consome a degustação guest após uma geração bem-sucedida. */
export function consumeGuestTrial(detail?: { nextHref?: string }) {
  if (typeof window === 'undefined') return;
  if (getSession()) return;
  const next = Math.min(GUEST_TRIAL_LIMIT, readCount() + 1);
  try {
    window.localStorage.setItem(GUEST_TRIAL_STORAGE_KEY, String(next));
  } catch {
    // ignore quota
  }
  window.dispatchEvent(
    new CustomEvent(GUEST_TRIAL_CONSUMED_EVENT, {
      detail: { nextHref: detail?.nextHref || window.location.pathname || '/ferramentas' }
    })
  );
}
