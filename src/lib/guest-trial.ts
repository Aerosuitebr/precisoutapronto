import { getSession } from '@/lib/auth';

export const GUEST_TRIAL_STORAGE_KEY = 'rj_guest_exports';
export const GUEST_TRIAL_LIMIT = 1;
export const GUEST_TRIAL_CONSUMED_EVENT = 'rj-guest-trial-consumed';

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

/** Ainda há a degustação completa (PDF/link/WhatsApp sem marca). */
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
