import { expect, test } from '@playwright/test';
import { getSharedDocumentCta } from '../src/lib/shared-document-growth';
import { buildViralPdfShareWhatsAppUrl, viralPdfFooterUrl } from '../src/lib/viral-loop';

test('shared contract points to its editor with referral attribution', () => {
  const cta = getSharedDocumentCta('contratos');
  expect(cta.href).toContain('/gerador-de-contrato?');
  expect(cta.href).toContain('utm_source=shared_document');
  expect(cta.href).toContain('utm_content=contratos');
});

test('unknown shared tool falls back without exposing a document token', () => {
  const cta = getSharedDocumentCta('nova-ferramenta');
  expect(cta.href).toContain('/recursos?');
  expect(cta.href).not.toContain('token');
  expect(cta.label).toBe('Conhecer ferramentas');
});

test('receipt footer and resume invite send the visitor to the respective public tool', () => {
  const receipt = new URL(viralPdfFooterUrl('recibos'));
  expect(receipt.pathname).toBe('/gerador-de-recibo');
  expect(receipt.searchParams.get('utm_campaign')).toBe('pdf_footer');
  expect(receipt.hash).toBe('#ferramenta');

  const whatsapp = new URL(buildViralPdfShareWhatsAppUrl('currículo', 'curriculo'));
  const message = whatsapp.searchParams.get('text');
  expect(message).toContain('/gerador-de-curriculo?utm_source=shared_document');
  expect(message).toContain('utm_campaign=pdf_whatsapp#ferramenta');
});
