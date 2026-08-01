import { expect, test } from '@playwright/test';

test.describe('PT quote smoke', () => {
  test('orcamento-com-pix loads without crash', async ({ page }) => {
    const response = await page.goto('/orcamento-com-pix', { waitUntil: 'domcontentloaded' });
    expect(response, 'SEO page should respond').toBeTruthy();
    expect(response!.status()).toBeLessThan(500);

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').filter({ hasText: /orçamento|orcamento|Pix|Resolva Jato/i }).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Application error|Internal Server Error/i);
  });

  test('ferramentas/orcamentos loads without crash', async ({ page }) => {
    const response = await page.goto('/ferramentas/orcamentos', { waitUntil: 'domcontentloaded' });
    expect(response, 'tool page should respond').toBeTruthy();
    expect(response!.status()).toBeLessThan(500);

    await expect(page.locator('body')).toBeVisible();
    await expect(
      page.locator('h1, h2, main').filter({ hasText: /orçamento|orcamento|Pix|item|cliente/i }).first()
    ).toBeVisible();
  });
});
