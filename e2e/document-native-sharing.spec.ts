import { expect, test } from '@playwright/test';
import { buildDocumentSharePayload } from '../src/lib/document-sharing';

test('native share payload contains the public URL and no document body', () => {
  const payload = buildDocumentSharePayload(
    'Contrato de exemplo',
    'https://resolvajato.com.br/documento/public-token'
  );

  expect(payload).toEqual({
    title: 'Contrato de exemplo',
    text: 'Veja este documento criado no Resolva Jato.',
    url: 'https://resolvajato.com.br/documento/public-token'
  });
  expect(JSON.stringify(payload)).not.toContain('answers');
});

test('native share title is bounded and has a fallback', () => {
  expect(buildDocumentSharePayload('', '/documento/token').title).toBe('Documento compartilhado');
  expect(String(buildDocumentSharePayload('a'.repeat(200), '/documento/token').title)).toHaveLength(140);
});
