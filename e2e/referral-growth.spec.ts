import { expect, test } from '@playwright/test';
import {
  buildReferralSharePayload,
  buildReferralSignupUrl,
  normalizeReferralCode
} from '../src/lib/referral-shared';

test('referral links carry attribution and a normalized code', () => {
  const code = normalizeReferralCode(' rj-abc123 ');
  expect(code).toBe('RJABC123');
  const url = buildReferralSignupUrl(code);
  expect(url).toContain('ref=RJABC123');
  expect(url).toContain('utm_source=referral');
  expect(url).toContain('utm_campaign=premium_3friends');
});

test('native referral payload contains no account identity', () => {
  const payload = buildReferralSharePayload('RJABC123');
  expect(payload.title).toBe('Convite Precisou, Tá Pronto');
  expect(payload.url).toContain('ref=RJABC123');
  expect(JSON.stringify(payload)).not.toMatch(/email|userId|name/);
});
