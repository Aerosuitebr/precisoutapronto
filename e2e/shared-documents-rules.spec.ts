import { expect, test } from '@playwright/test';
import { isSharedDocumentAvailable } from '../src/lib/shared-documents';

test.describe('shared document availability', () => {
  const now = new Date('2026-07-29T12:00:00.000Z');

  test('accepts an active link without expiration', () => {
    expect(isSharedDocumentAvailable({ revokedAt: null, expiresAt: null }, now)).toBe(true);
  });

  test('rejects an expired link', () => {
    expect(isSharedDocumentAvailable({
      revokedAt: null,
      expiresAt: '2026-07-29T11:59:59.000Z'
    }, now)).toBe(false);
  });

  test('rejects a revoked link even before expiration', () => {
    expect(isSharedDocumentAvailable({
      revokedAt: '2026-07-29T10:00:00.000Z',
      expiresAt: '2026-08-29T12:00:00.000Z'
    }, now)).toBe(false);
  });
});
