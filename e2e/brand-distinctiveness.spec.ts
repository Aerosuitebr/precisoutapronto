import { expect, test } from '@playwright/test';

test.describe('brand distinctiveness', () => {
  test('homepage presents task-first journeys and exposes the tools hub', async ({ page }) => {
    await page.goto('/');
    const toolsHubLink = page.locator('main a[href="/recursos"]', { hasText: 'Encontrar uma solução' });
    await expect(toolsHubLink).toHaveCount(1);
    await expect(toolsHubLink).toContainText('Encontrar uma solução');
    await expect(page.locator('a[href="/para/autonomos"]')).toHaveCount(0);
    await expect(page.locator('main a[href^="/recursos#category-"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Não é uma lista de ferramentas. É um caminho até o resultado.' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Encontrar meu recibo/ })).toHaveAttribute('href', '/recibos');
    await expect(page.getByRole('link', { name: /Montar um orçamento/ })).toHaveAttribute('href', '/orcamento-com-pix');
    await expect(page.getByRole('link', { name: /Ver calculadoras/ })).toHaveAttribute('href', '/calculadora-de-rescisao');
  });

  test('official brand page has unique entity signals', async ({ page }) => {
    await page.goto('/resolva-jato');
    await expect(page.locator('h1')).toHaveText('Resolva Jato: site oficial');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/resolva-jato$/);
    await expect(page.getByText('Não somos uma empresa de cobrança de dívidas')).toBeVisible();
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.join('\n')).toContain('AboutPage');
    expect(schemas.join('\n')).toContain('ResolvaJato');
    expect(schemas.join('\n')).toContain('Ferramentas online que resolvem de verdade');
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
