import { expect, test } from '@playwright/test';
import { getIntentPage, getRelatedIntentPages } from '../src/lib/growth/intents';

test('related intent links are relevant, unique and never self-referential', () => {
  const page = getIntentPage('contrato-de-prestacao-de-servicos');
  expect(page).toBeTruthy();
  const related = getRelatedIntentPages(page!, 3);
  expect(related).toHaveLength(3);
  expect(new Set(related.map((item) => item.slug)).size).toBe(3);
  expect(related.some((item) => item.slug === page!.slug)).toBe(false);
  expect(related.every((item) => item.segmentSlugs.some((slug) => page!.segmentSlugs.includes(slug)) || item.toolHref === page!.toolHref)).toBe(true);
});
