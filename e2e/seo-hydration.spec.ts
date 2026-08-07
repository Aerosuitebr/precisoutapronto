import { expect, test } from '@playwright/test';

const LANDINGS = ['/gerador-de-recibo', '/gerador-de-proposta-comercial'] as const;

for (const path of LANDINGS) {
  test(`${path} hydrates without duplicating structured data`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    expect(errors.filter((message) => /hydration|React error #418/i.test(message))).toEqual([]);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(4);
  });
}

test('home metadata and primary topic stay aligned', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('Ferramentas para MEI: orçamento, Pix, recibo e contrato | Resolva Jato');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Crie orçamento com Pix, recibo, proposta e contrato para enviar ao cliente pelo WhatsApp. Ferramentas online para MEI e autônomos.'
  );
  await expect(page.locator('main a[href="/games"]')).toHaveCount(0);
});
