/**
 * Device ID do script Mercado Pago (security.js → MP_DEVICE_SESSION_ID).
 * Usado no header X-meli-session-id ao criar a preferência (Checkout Pro).
 * Sem esse ID o antifraude costuma marcar cartão como cc_rejected_high_risk.
 */

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID?: string;
  }
}

function readDeviceId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const id = window.MP_DEVICE_SESSION_ID;
  return typeof id === 'string' && id.trim() ? id.trim() : undefined;
}

/** Garante que o security.js está no DOM (idempotente). */
function ensureMpSecurityScript(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const existing = document.getElementById('mp-security-js') as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === '1' || readDeviceId()) return Promise.resolve();
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => resolve(), { once: true });
      // Já pode ter carregado antes dos listeners.
      window.setTimeout(() => resolve(), 0);
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = 'mp-security-js';
    script.src = 'https://www.mercadopago.com/v2/security.js';
    script.async = true;
    script.setAttribute('view', 'checkout');
    script.dataset.loaded = '0';
    script.onload = () => {
      script.dataset.loaded = '1';
      resolve();
    };
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

/**
 * Aguarda o Device ID do security.js. Retorna undefined se o script falhar
 * (ex.: CSP): o checkout ainda segue, mas com risco maior de high_risk.
 */
export async function getMpDeviceSessionId(timeoutMs = 4000): Promise<string | undefined> {
  if (typeof window === 'undefined') return undefined;

  const immediate = readDeviceId();
  if (immediate) return immediate;

  await ensureMpSecurityScript();

  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const next = readDeviceId();
    if (next) return next;
    await new Promise((r) => setTimeout(r, 50));
  }

  return readDeviceId();
}
