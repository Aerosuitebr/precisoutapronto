'use client';

type EventParams = Record<string, string | number | boolean | undefined>;

const ATTRIBUTION_KEY = 'rj_content_attribution';

type ContentAttribution = {
  guideSource?: string;
  contentCluster?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/** Envia apenas eventos sem dados pessoais. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  let attribution: ContentAttribution = {};
  try {
    attribution = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || '{}');
  } catch {
    // sessionStorage pode estar indisponível por política do navegador.
  }
  const safeParams = Object.fromEntries(
    Object.entries({
      ...(attribution.guideSource ? { guide_source: attribution.guideSource } : {}),
      ...(attribution.contentCluster ? { content_cluster: attribution.contentCluster } : {}),
      ...params
    }).filter(([, value]) =>
      ['string', 'number', 'boolean'].includes(typeof value)
    )
  );
  window.gtag?.('event', name, safeParams);
  window.clarity?.('event', name);
}

export function setContentAttribution(attribution: ContentAttribution) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // A medição é opcional e nunca deve bloquear a navegação.
  }
}
