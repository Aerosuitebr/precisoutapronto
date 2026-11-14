import { expect, test } from '@playwright/test';

test('home focuses on quote creation and demonstrates the customer experience', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seu orçamento profissional,aprovado pelo WhatsApp.');
  await expect(page.getByRole('link', { name: 'Criar orçamento grátis', exact: true })).toHaveAttribute('href', '/orcamento-com-pix#montar');
  await page.getByRole('link', { name: 'Ver como o cliente recebe', exact: true }).click();
  await expect(page).toHaveURL(/demonstracao-orcamento$/);
  await expect(page.getByRole('button', { name: 'Aprovar orçamento', exact: true })).toBeVisible();
});
test('discovery precedes the workflow and search supports keyboard selection and dismissal', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.locator('#ferramentas').evaluate(element => Boolean(element.compareDocumentPosition(document.getElementById('como-funciona')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const search = page.getByRole('combobox', { name: 'Qual ferramenta você procura?' });
  await search.fill('rescisão');
  await expect(page.getByRole('listbox')).toBeVisible();
  await search.press('Escape');
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await search.press('ArrowDown');
  await expect(page.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/calculadora-de-rescisao/);
});

test('profession shortcuts open the prefilled editor and the catalog can expand', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByText('Ver catálogo completo de utilidades', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'Abrir catálogo completo' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver modelos prontos para Eletricistas' }).click();
  await expect(page).toHaveURL(/\/orcamento-para\/eletricista#montar$/);
  await expect(page.getByText('Modelo carregado:', { exact: true })).toBeVisible();
  await expect(page.locator('#montar input[value="Visita técnica e diagnóstico"]')).toBeVisible();
});

test('WhatsApp link validates the number and encodes the message without sending it', async ({ page }) => {
  await page.goto('/gerador-de-link-whatsapp', { waitUntil: 'networkidle' });
  await page.getByLabel('Seu WhatsApp com código do país e DDD').fill('123');
  await expect(page.getByRole('button', { name: 'Copiar link' })).toHaveCount(0);
  await page.getByLabel('Seu WhatsApp com código do país e DDD').fill('55 (11) 99999-9999');
  await page.getByLabel('Mensagem inicial (opcional)').fill('Olá! Valor & prazo?');
  await expect(page.getByLabel('Seu link pronto')).toHaveValue(`https://wa.me/5511999999999?text=${encodeURIComponent('Olá! Valor & prazo?')}`);
});

test('mobile home exposes plans and keeps the focused hero inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Navegação rápida no celular' }).getByRole('link', { name: 'Planos', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('navigation', { name: 'Navegação rápida no celular' }).getByRole('link', { name: 'Planos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'O que muda com a conta e com o Premium?' })).toBeVisible();
});