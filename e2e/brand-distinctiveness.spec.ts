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
    await expect(page.getByRole('heading', { name: 'Comece pelo contexto do problema.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ferramentas que entregam um resultado, não mais uma tarefa.' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Criar orçamento/ })).toHaveAttribute('href', '/ferramentas/orcamentos');
    await expect(page.getByRole('link', { name: /Gerar recibo/ })).toHaveAttribute('href', '/ferramentas/recibos');
    await expect(page.getByRole('button', { name: 'Favoritar Orçamentos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compartilhar Recibos' })).toBeVisible();
  });

  test('mobile homepage navigation and categories stay inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const viewport = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    expect(viewport.documentWidth).toBeLessThanOrEqual(viewport.viewportWidth);

    await expect(page.getByRole('heading', { name: 'Comece pelo contexto do problema.' })).toBeVisible();
    const categoryCards = page.locator('main a[href^="/recursos#category-"]');
    await expect(categoryCards.first()).toBeVisible();
    const firstCardBox = await categoryCards.first().boundingBox();
    expect(firstCardBox?.x).toBeGreaterThanOrEqual(0);
    expect((firstCardBox?.x || 0) + (firstCardBox?.width || 0)).toBeLessThanOrEqual(390);

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const mobileMenu = page.locator('#menu-principal-mobile');
    await expect(mobileMenu).toBeVisible();
    const menuBox = await mobileMenu.boundingBox();
    expect(menuBox?.width).toBeLessThanOrEqual(390);
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
