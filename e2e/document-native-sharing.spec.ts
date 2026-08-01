import { expect, test } from '@playwright/test';
import {
  buildDocumentSharePayload,
  buildDocumentShareRequest,
  dispatchDocumentShareUpdated,
  DOCUMENT_SHARE_UPDATED_EVENT
} from '../src/lib/document-sharing';

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

test('share request is bounded, private and expires in 30 days', () => {
  expect(buildDocumentShareRequest({
    toolId: 'contratos',
    artifactId: 'ctr_123',
    title: '  Contrato de fotografia  '
  })).toEqual({
    toolId: 'contratos',
    artifactId: 'ctr_123',
    title: 'Contrato de fotografia',
    expiresInDays: 30
  });
  expect(buildDocumentShareRequest({
    toolId: 'recibos',
    artifactId: 'rct_123',
    title: ''
  }).title).toBe('Documento compartilhado');
});

test('share update signal is stable and safe during server rendering', () => {
  expect(DOCUMENT_SHARE_UPDATED_EVENT).toBe('resolva-jato:document-share-updated');
  expect(() => dispatchDocumentShareUpdated({
    toolId: 'contratos',
    artifactId: 'ctr_123',
    reused: true
  })).not.toThrow();
});
