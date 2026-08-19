import { expect, test } from '@playwright/test';

test.describe('brand distinctiveness', () => {
  test('homepage presents task-first journeys and exposes the tools hub', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('search', { name: 'Buscar ferramenta' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'recibo', exact: true })).toBeVisible();
    await expect(page.locator('a[href="/para/autonomos"]')).toHaveCount(0);
    await expect(page.locator('main a[href^="/recursos#category-"]')).toHaveCount(5);
    await expect(page.getByRole('tab', { name: 'Todas as áreas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filtre pelo tipo de resultado que precisa.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Não é uma lista de ferramentas. É um caminho até o resultado.' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Encontrar meu recibo/ })).toHaveAttribute('href', '/recibos');
    await expect(page.getByRole('link', { name: /Montar um orçamento/ })).toHaveAttribute('href', '/orcamento-com-pix');
    await expect(page.getByRole('link', { name: /Ver calculadoras/ })).toHaveAttribute('href', '/calculadora-de-rescisao');
  });

  test('official brand page has unique entity signals', async ({ page }) => {
    await page.goto('/precisou-ta-pronto');
    await expect(page.locator('h1')).toHaveText('Precisou? Tá Pronto! Site oficial');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/precisou-ta-pronto$/);
    await expect(page.getByText(/resolvajato\.com\.br permanece válido/)).toBeVisible();
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.join('\n')).toContain('AboutPage');
    expect(schemas.join('\n')).toContain('Precisou? Tá Pronto!');
  });

  test('quality page documents test and privacy commitments', async ({ page }) => {
    await page.goto('/qualidade-e-seguranca');
    await expect(page.locator('h1')).toHaveText('Qualidade Jato');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Testes antes da publicação' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Privacidade Jato' })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/qualidade-e-seguranca$/);
  });
});
