import { expect, test } from '@playwright/test';
import { isActiveSharedLink, summarizeSharePerformance } from '../src/lib/share-performance';

const now = Date.parse('2026-07-29T12:00:00.000Z');

test('considera revogação e expiração ao calcular links ativos', () => {
  expect(isActiveSharedLink({
    title: 'Sem expiração',
    viewCount: 0,
    expiresAt: null,
    revokedAt: null
  }, now)).toBe(true);
  expect(isActiveSharedLink({
    title: 'Expirado',
    viewCount: 0,
    expiresAt: '2026-07-28T12:00:00.000Z',
    revokedAt: null
  }, now)).toBe(false);
  expect(isActiveSharedLink({
    title: 'Revogado',
    viewCount: 0,
    expiresAt: '2026-08-28T12:00:00.000Z',
    revokedAt: '2026-07-29T10:00:00.000Z'
  }, now)).toBe(false);
});

test('resume alcance sem dados individuais de visitantes', () => {
  const summary = summarizeSharePerformance([
    { title: 'Contrato', viewCount: 7, expiresAt: null, revokedAt: null },
    {
      title: 'Proposta',
      viewCount: 12,
      expiresAt: '2026-08-29T12:00:00.000Z',
      revokedAt: null
    },
    {
      title: 'Recibo',
      viewCount: 2,
      expiresAt: null,
      revokedAt: '2026-07-20T12:00:00.000Z'
    }
  ], now);
  expect(summary).toEqual({
    activeLinks: 2,
    totalLinks: 3,
    totalViews: 21,
    viewedLinks: 3,
    topLink: { title: 'Proposta', viewCount: 12 }
  });
});

test('normaliza contagens inválidas e mantém estado vazio', () => {
  expect(summarizeSharePerformance([], now).topLink).toBeNull();
  expect(summarizeSharePerformance([
    { title: 'Documento', viewCount: -4, expiresAt: null, revokedAt: null }
  ], now).totalViews).toBe(0);
});
