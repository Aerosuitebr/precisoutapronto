import { expect, test } from '@playwright/test';
import { intentPages } from '../src/lib/growth/intents';
import { validateGrowthContent } from '../src/lib/growth/validation';

test('growth content has valid references and editorial minimums', () => {
  expect(validateGrowthContent()).toEqual([]);
  expect(intentPages.length).toBeGreaterThanOrEqual(20);
});
