import { expect, test } from '@playwright/test';

test.describe('Home locale gate', () => {
  test('root stays PT even with precisoutapronto_locale=en cookie', async ({ context, page, baseURL }) => {
    const hostname = new URL(baseURL || 'https://staging.precisoutapronto.com.br').hostname;

    await context.addCookies([
      {
        name: 'precisoutapronto_locale',
        value: 'en',
        domain: hostname,
        path: '/',
        secure: true,
        sameSite: 'Lax'
      }
    ]);

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response, 'home should respond').toBeTruthy();
    expect(response!.status(), 'home should be 200').toBe(200);
    expect(page.url()).not.toMatch(/\/en(\/|$)/);

    await expect(page.locator('html')).toHaveAttribute('lang', /pt/i);
    await expect(page.getByText(/ferrament|orçamento|gratis|grátis|Precisou/i).first()).toBeVisible();
  });
});
