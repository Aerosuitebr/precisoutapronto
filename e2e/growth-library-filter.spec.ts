import { expect, test } from '@playwright/test';
import { intentPages } from '../src/lib/growth/intents';
import { filterLibraryIntents } from '../src/lib/growth/library';

test('library search ignores accents and combines with segment filter', () => {
  const result = filterLibraryIntents(intentPages, 'curriculo', 'estudantes');
  expect(result.map((item) => item.slug)).toContain('curriculo-para-primeiro-emprego');
  expect(result.every((item) => item.segmentSlugs.includes('estudantes'))).toBe(true);
});

test('library returns no false matches for an unknown query', () => {
  expect(filterLibraryIntents(intentPages, 'conteudo-que-nao-existe-xyz', '')).toEqual([]);
});
