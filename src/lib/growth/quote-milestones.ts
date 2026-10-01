'use client';

import { trackEvent } from '@/lib/analytics';
import { hasAnalyticsConsent } from '@/lib/analytics-consent';

const KEY = 'precisoutapronto_quote_milestones_v1';
type Milestones = { ids: string[]; firstAt: number; lastAt: number; returnDay?: string };

/** Browser-level diagnostics only; not a count of unique people. Optional consent required. */
export function recordQuoteCreated(id: string, occupation?: string) {
  try {
    if (!hasAnalyticsConsent(localStorage)) return;
    const now = Date.now();
    const previous = JSON.parse(localStorage.getItem(KEY) || 'null') as Milestones | null;
    if (previous?.ids.includes(id)) return;
    const ids = [...(previous?.ids || []), id].slice(-100);
    localStorage.setItem(KEY, JSON.stringify({ ...previous, ids, firstAt: previous?.firstAt || now, lastAt: now }));
    trackEvent(ids.length === 1 ? 'quote_browser_first_created' : ids.length === 2 ? 'quote_browser_second_created' : 'quote_browser_repeat_created', {
      source_occupation: occupation || 'geral',
      days_since_first: Math.floor((now - (previous?.firstAt || now)) / 86_400_000),
      utm_source: new URLSearchParams(location.search).get('utm_source')?.slice(0, 80),
      utm_campaign: new URLSearchParams(location.search).get('utm_campaign')?.slice(0, 80)
    });
  } catch { /* Metrics must never block document creation. */ }
}

export function recordQuoteReturn() {
  try {
    if (!hasAnalyticsConsent(localStorage)) return;
    const previous = JSON.parse(localStorage.getItem(KEY) || 'null') as Milestones | null;
    if (!previous || Date.now() - previous.lastAt < 86_400_000) return;
    const day = new Date().toISOString().slice(0, 10);
    if (previous.returnDay === day) return;
    localStorage.setItem(KEY, JSON.stringify({ ...previous, returnDay: day }));
    trackEvent('quote_browser_returned', { days_since_last: Math.floor((Date.now() - previous.lastAt) / 86_400_000) });
  } catch { /* Optional diagnostics. */ }
}
