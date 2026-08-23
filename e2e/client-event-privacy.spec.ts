import { expect, test } from '@playwright/test';
import { ANALYTICS_CONSENT_KEY, hasAnalyticsConsent } from '../src/lib/analytics-consent';
import { productViralFunnelMetrics } from '../src/lib/growth/product-viral-funnel';

test('canonical client analytics requires explicit accepted consent', () => {
  const storage = (value: string | null) => ({ getItem: (key: string) => key === ANALYTICS_CONSENT_KEY ? value : null });
  expect(hasAnalyticsConsent(storage('accepted'))).toBe(true);
  expect(hasAnalyticsConsent(storage('rejected'))).toBe(false);
  expect(hasAnalyticsConsent(storage(null))).toBe(false);
  expect(hasAnalyticsConsent()).toBe(false);
});

test('viral funnel rates remain safe with empty denominators', () => {
  expect(productViralFunnelMetrics({ toolKey: 'recibos', completed: 0, shared: 0, opened: 0, acted: 0, activated: 0 })).toEqual({
    toolKey: 'recibos', completed: 0, shared: 0, opened: 0, acted: 0, activated: 0,
    shareRate: 0, openRate: 0, actionRate: 0, activationRate: 0
  });
});

test('viral funnel calculates one-decimal aggregate rates', () => {
  const result = productViralFunnelMetrics({ toolKey: 'orcamentos', completed: 30, shared: 10, opened: 8, acted: 4, activated: 3 });
  expect(result.shareRate).toBe(33.3);
  expect(result.openRate).toBe(80);
  expect(result.actionRate).toBe(50);
  expect(result.activationRate).toBe(37.5);
});
