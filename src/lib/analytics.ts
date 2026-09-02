'use client';

type EventParams = Record<string, string | number | boolean | undefined>;

const ATTRIBUTION_KEY = 'precisoutapronto_content_attribution';
const LANDING_ATTRIBUTION_KEY = 'precisoutapronto_landing_attribution';

type ContentAttribution = {
  guideSource?: string;
  contentCluster?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Envia apenas eventos sem dados pessoais. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  let attribution: ContentAttribution = {};
  let landingPath = '';
  try {
    attribution = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || '{}');
    landingPath = window.sessionStorage.getItem(LANDING_ATTRIBUTION_KEY) || '';
  } catch {
    // sessionStorage pode estar indisponível por política do navegador.
  }
  const safeParams = Object.fromEntries(
    Object.entries({
      ...(attribution.guideSource ? { guide_source: attribution.guideSource } : {}),
      ...(attribution.contentCluster ? { content_cluster: attribution.contentCluster } : {}),
      ...(landingPath ? { landing_path: landingPath } : {}),
      ...params
    }).filter(([, value]) =>
      ['string', 'number', 'boolean'].includes(typeof value)
    )
  );
  window.gtag?.('event', name, safeParams);
}

/** Preserva a landing que iniciou o fluxo para atribuir criação, envio, aprovação e compra. */
export function setLandingAttribution(landingPath: string) {
  if (typeof window === 'undefined' || !landingPath.startsWith('/')) return;
  try {
    window.sessionStorage.setItem(LANDING_ATTRIBUTION_KEY, landingPath);
  } catch {
    // A medição é opcional e nunca deve bloquear a navegação.
  }
}

export function setContentAttribution(attribution: ContentAttribution) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // A medição é opcional e nunca deve bloquear a navegação.
  }
}
