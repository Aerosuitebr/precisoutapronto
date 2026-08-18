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
  await expect(page).toHaveTitle('Precisou? Tá Pronto! Recibos, cálculos e documentos online');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Resolva tarefas práticas com recibos, calculadoras, documentos e ferramentas online. Encontre o que precisa e saia com o resultado pronto.'
  );
  await expect(page.locator('main a[href="/games"]')).toHaveCount(0);
});
