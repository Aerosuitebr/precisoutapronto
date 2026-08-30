import { expect, test } from '@playwright/test';

test.describe('brand distinctiveness', () => {
  test('homepage presents one focused quote-to-payment journey', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Orçamento enviado. Serviço fechado.');
    await expect(page.getByRole('link', { name: 'Criar orçamento grátis' })).toHaveAttribute('href', '/orcamento-com-pix#montar');
    await expect(page.getByRole('link', { name: 'Ver exemplo pronto' })).toHaveAttribute('href', '/orcamento-para/eletricista');
    await expect(page.getByText('R$ 490', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Da conversa ao pagamento.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seu cliente decide mais rápido.' })).toBeVisible();
    await expect(page.locator('main a[href^="/recursos#category-"]')).toHaveCount(0);
    await expect(page.getByRole('search', { name: 'Buscar ferramenta' })).toHaveCount(0);
  });

  test('mobile focused homepage stays inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const viewport = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    expect(viewport.documentWidth).toBeLessThanOrEqual(viewport.viewportWidth);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const primaryCta = page.getByRole('link', { name: 'Criar orçamento grátis' });
    await expect(primaryCta).toBeVisible();
    const ctaBox = await primaryCta.boundingBox();
    expect(ctaBox?.x).toBeGreaterThanOrEqual(0);
    expect((ctaBox?.x || 0) + (ctaBox?.width || 0)).toBeLessThanOrEqual(390);
  });

  test('official brand page has unique entity signals', async ({ page }) => {
    await page.goto('/precisou-ta-pronto');
    await expect(page.locator('h1')).toHaveText('Precisou? Tá Pronto! Site oficial');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/precisou-ta-pronto$/);
    await expect(page.getByText(/único domínio oficial é precisoutapronto\.com\.br/)).toBeVisible();
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.join('\n')).toContain('AboutPage');
    expect(schemas.join('\n')).toContain('Precisou? Tá Pronto!');
  });

  test('quality page documents test and privacy commitments', async ({ page }) => {
    await page.goto('/qualidade-e-seguranca');
    await expect(page.locator('h1')).toHaveText('Qualidade e segurança');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Testes antes da publicação' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Processamento local' })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/qualidade-e-seguranca$/);
  });
});
