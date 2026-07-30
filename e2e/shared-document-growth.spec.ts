import { expect, test } from '@playwright/test';
import { getSharedDocumentCta } from '../src/lib/shared-document-growth';

test('shared contract points to its editor with referral attribution', () => {
  const cta = getSharedDocumentCta('contratos');
  expect(cta.href).toContain('/ferramentas/contratos?');
  expect(cta.href).toContain('utm_source=shared_document');
  expect(cta.href).toContain('utm_content=contratos');
});

test('unknown shared tool falls back without exposing a document token', () => {
  const cta = getSharedDocumentCta('nova-ferramenta');
  expect(cta.href).toContain('/recursos?');
  expect(cta.href).not.toContain('token');
  expect(cta.label).toBe('Conhecer ferramentas');
});
