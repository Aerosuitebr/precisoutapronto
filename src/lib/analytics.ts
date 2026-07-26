'use client';

type EventParams = Record<string, string | number | boolean | undefined>;

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
  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) =>
      ['string', 'number', 'boolean'].includes(typeof value)
    )
  );
  window.gtag?.('event', name, safeParams);
  window.clarity?.('event', name);
}
