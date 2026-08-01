import { expect, test } from '@playwright/test';
import {
  buildDocumentEditorHref,
  buildDuplicateDocumentData,
  DOCUMENT_HISTORY_TOOL_IDS,
  filterDocumentHistory,
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

test('filtra metadados por favorito, ferramenta e busca sem acentos', () => {
  const documents = [
    {
      artifactId: '1',
      toolId: 'curriculo',
      title: 'Currículo da Ana',
      updatedAt: '2026-07-29T12:00:00.000Z',
      isFavorite: true,
      editorHref: '/curriculo',
      toolLabel: 'Currículo'
    },
    {
      artifactId: '2',
      toolId: 'contratos',
      title: 'Prestação de serviços',
      updatedAt: '2026-07-28T12:00:00.000Z',
      isFavorite: false,
      editorHref: '/contratos',
      toolLabel: 'Contrato'
    }
  ];
  expect(filterDocumentHistory(documents, 'favorites', '')).toHaveLength(1);
  expect(filterDocumentHistory(documents, 'contratos', '')[0].artifactId).toBe('2');
  expect(filterDocumentHistory(documents, 'all', 'curriculo')[0].artifactId).toBe('1');
  expect(filterDocumentHistory(documents, 'all', 'servicos')[0].artifactId).toBe('2');
  expect(filterDocumentHistory(documents, 'all', 'inexistente')).toEqual([]);
});

test('cria dados independentes para uma cópia sem alterar a origem', () => {
  const source = { id: 'old', title: 'Contrato principal', clauses: [{ id: '1' }] };
  const duplicate = buildDuplicateDocumentData(source, 'new', 'Contrato');
  expect(duplicate).toMatchObject({
    id: 'new',
    title: 'Cópia · Contrato principal',
    clauses: [{ id: '1' }]
  });
  expect(source).toEqual({ id: 'old', title: 'Contrato principal', clauses: [{ id: '1' }] });
  expect(buildDuplicateDocumentData(null, 'new', 'Documento')).toBeNull();
});
