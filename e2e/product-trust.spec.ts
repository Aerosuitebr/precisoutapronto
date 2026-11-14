import { expect, test } from '@playwright/test';

test('product characteristics are not presented as activity statistics', async ({ page }) => {
  await page.route('**/api/stats/public', route => route.fulfill({ json: { orcamentosToday: 0, orcamentosApprovedWeek: 0, docsGeneratedApprox: 0, usersTotal: 0, updatedAt: '2026-11-08T12:00:00Z' } }));
  await page.goto('/recibos/recibo-pagamento-pix');
  await expect(page.getByRole('list', { name: 'Características de funcionamento', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Estatísticas de uso', exact: true })).toHaveCount(0);
  await expect(page.getByText('Os indicadores abaixo são calculados a partir de registros agregados', { exact: false })).toHaveCount(0);
});

test('available activity counts show source and date separately from features', async ({ page }) => {
  await page.route('**/api/stats/public', route => route.fulfill({ json: { orcamentosToday: 15, orcamentosApprovedWeek: 20, docsGeneratedApprox: 100, usersTotal: 50, updatedAt: '2026-11-08T12:00:00Z' } }));
  await page.goto('/recibos/recibo-pagamento-pix');
  const stats = page.getByRole('region', { name: 'Estatísticas de uso', exact: true });
  await expect(stats).toContainText('Fonte: registros do produto');
  await expect(stats).toContainText('08/11/2026');
  await expect(stats).not.toContainText('apps para o cliente instalar');
});
