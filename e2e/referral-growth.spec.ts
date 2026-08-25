import { expect, test } from '@playwright/test';
import {
  buildReferralSharePayload,
  buildReferralSignupUrl,
  normalizeReferralCode,
  REFERRAL_MILESTONE_DAYS,
  REFERRED_WELCOME_PREMIUM_DAYS
} from '../src/lib/referral-shared';

test('referral links carry attribution and a normalized code', () => {
  const code = normalizeReferralCode(' ptp-abc123 ');
  expect(code).toBe('PTPABC123');
  const url = buildReferralSignupUrl(code);
  expect(url).toContain('ref=PTPABC123');
  expect(url).toContain('/orcamento-com-pix?');
  expect(url).not.toContain('/cadastro');
  expect(url).toContain('utm_source=referral');
  expect(url).toContain('utm_campaign=premium_3friends');
});

test('referral rewards start on the first activation and total 30 days per cycle', () => {
  expect(REFERRAL_MILESTONE_DAYS).toEqual([7, 7, 16]);
  expect(REFERRAL_MILESTONE_DAYS.reduce((total, days) => total + days, 0)).toBe(30);
  expect(REFERRED_WELCOME_PREMIUM_DAYS).toBe(7);
});

test('native referral payload contains no account identity', () => {
  const payload = buildReferralSharePayload('PTPABC123');
  expect(payload.title).toBe('Convite Precisou, Tá Pronto');
  expect(payload.url).toContain('ref=PTPABC123');
  expect(JSON.stringify(payload)).not.toMatch(/email|userId|name/);
});
