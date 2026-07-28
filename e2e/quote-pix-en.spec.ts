import { expect, test } from '@playwright/test';

test.describe('EN quote + Pix gate', () => {
  test('unit price 1000 updates total and Generate is never silent', async ({ page }) => {
    await page.goto('/en/tools/quote-pix', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Quote \+ client approval \+ Pix/i })).toBeVisible();

    await page.getByPlaceholder('Service or product 1').fill('Website design');
    await page.getByLabel('Qty.').fill('1');
    await page.getByLabel('Unit price (BRL)').fill('1000');

    const total = page.getByText('Quote total', { exact: false }).locator('xpath=following-sibling::p[1]');
    await expect(total).toContainText(/R\$\s*1[,.]000/);
    await expect(total).not.toHaveText(/R\$0([.,]00)?$/);

    await page.getByPlaceholder('Professional or business name').fill('E2E Pro');
    await page.getByPlaceholder('Your WhatsApp with country and area code').fill('+5511999999999');
    await page.getByPlaceholder('Email for approval notifications').fill('e2e-quote@example.com');
    await page.getByPlaceholder('Client name').fill('E2E Client');
    await page.getByPlaceholder('Client WhatsApp').fill('+5511888888888');

    const generate = page.getByRole('button', { name: /Generate approval link and Pix/i });
    await generate.click();

    // Never silent: loading, alert, success card, or account modal.
    const feedback = page
      .getByRole('button', { name: /Generating/i })
      .or(page.getByRole('alert'))
      .or(page.getByRole('heading', { name: /Your quote is ready/i }))
      .or(page.getByText(/Continue grátis|Create a free account|Crie uma conta/i));

    await expect(feedback.first()).toBeVisible({ timeout: 30_000 });
  });
});
