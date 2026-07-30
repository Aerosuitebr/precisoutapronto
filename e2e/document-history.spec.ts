import { expect, test } from '@playwright/test';
import {
  buildDocumentEditorHref,
  DOCUMENT_HISTORY_TOOL_IDS,
  getDocumentHistoryTitle,
  getDocumentHistoryTool,
  sortDocumentHistory
} from '../src/lib/document-history';

test('mantém somente ferramentas com retomada exata implementada', () => {
  expect(DOCUMENT_HISTORY_TOOL_IDS).toEqual([
    'curriculo',
    'recibos',
    'propostas',
    'contratos'
  ]);
  expect(getDocumentHistoryTool('agenda')).toBeNull();
});

test('monta link seguro para retomar o documento específico', () => {
  expect(buildDocumentEditorHref('contratos', 'ctr 123')).toBe(
    '/ferramentas/contratos?document=ctr+123'
  );
  expect(buildDocumentEditorHref('desconhecida', 'abc')).toBeNull();
});

test('extrai um título curto sem expor o conteúdo completo', () => {
  expect(getDocumentHistoryTitle({ title: '  Proposta comercial  ' }, 'Proposta')).toBe(
    'Proposta comercial'
  );
  expect(getDocumentHistoryTitle({ name: 'Cliente X' }, 'Documento')).toBe('Cliente X');
  expect(getDocumentHistoryTitle({ content: 'conteúdo privado' }, 'Documento')).toBe('Documento');
  expect(getDocumentHistoryTitle({ title: 'x'.repeat(200) }, 'Documento')).toHaveLength(160);
});

test('mantém favoritos no topo e ordena cada grupo por atualização', () => {
  const sorted = sortDocumentHistory([
    { isFavorite: false, updatedAt: '2026-07-29T12:00:00.000Z', id: 'recent' },
    { isFavorite: true, updatedAt: '2026-07-27T12:00:00.000Z', id: 'favorite-old' },
    { isFavorite: true, updatedAt: '2026-07-28T12:00:00.000Z', id: 'favorite-new' }
  ]);
  expect(sorted.map((item) => item.id)).toEqual(['favorite-new', 'favorite-old', 'recent']);
});
