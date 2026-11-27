import { expect, test } from '@playwright/test';

test('home retains quote creation and demonstrates the customer experience', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crie orçamentos profissionais e envie pelo WhatsApp.');
  await expect(page.getByRole('link', { name: 'Criar orçamento grátis', exact: true })).toHaveAttribute('href', '/orcamento-com-pix#montar');
  await page.getByRole('link', { name: 'Ver exemplos', exact: true }).click();
  await expect(page).toHaveURL(/#exemplos$/);
  const demo = page.locator('#exemplos');
  await demo.getByRole('button', { name: 'Aprovar orçamento', exact: true }).click();
  await expect(demo.getByRole('status')).toContainText('Aprovação simulada');
  await demo.getByRole('button', { name: 'Pedir ajuste', exact: true }).click();
  await expect(demo.getByRole('status')).toContainText('Pedido de ajuste simulado');
});
test('workflow follows the hero and utilities are grouped farther down', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main > section').nth(1)).toHaveAttribute('id', 'como-funciona');
  await expect(page.locator('#como-funciona')).toContainText('Recibo final emitido');
  await expect(page.locator('#ferramentas').getByRole('link', { name: 'Calcular rescisão' })).toHaveAttribute('href', '/calculadora-de-rescisao');
});

test('profession shortcuts open the prefilled editor and the catalog is linked', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: 'Ver todas as ferramentas', exact: true }).first()).toHaveAttribute('href', '/recursos');
  await page.getByRole('link', { name: 'Criar orçamento para eletricista' }).click();
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

test('resume preview transfers the selected model and entered name to the editor', async ({ page }) => {
  await page.goto('/gerador-de-curriculo#ferramenta');
  await expect(page.getByText('Agência Horizonte · São Paulo, SP', { exact: true })).toHaveCount(1);
  const models = page.getByRole('group', { name: 'Comparar modelos' });
  await models.getByRole('button', { name: 'Moderno' }).click();
  await page.getByLabel('Seu nome', { exact: true }).fill('Pessoa de teste');
  await page.getByRole('link', { name: 'Abrir gerador e baixar PDF', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Nome completo', exact: true })).toHaveValue('Pessoa de teste');
  await expect(page.getByRole('button', { name: /^Moderno/ })).toHaveAttribute('aria-pressed', 'true');
});

test('mobile home exposes plans and keeps the focused hero inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const shortcuts = page.locator('#ferramentas').getByRole('list', { name: 'Atalhos para ferramentas' }).getByRole('link');
  const targets = [
    '/gerador-de-curriculo#ferramenta',
    '/gerador-de-recibo#ferramenta',
    '/editor-de-pdf-online#ferramenta',
    '/gerador-de-qr-code-pix#gerar',
    '/calculadora-de-rescisao',
    '/gerador-de-proposta-comercial#ferramenta'
  ];
  await expect(shortcuts).toHaveCount(targets.length);
  for (const [index, target] of targets.entries()) {
    await expect(shortcuts.nth(index)).toHaveAttribute('href', target);
  }
  await expect(page.getByRole('link', { name: 'Criar orçamento grátis', exact: true })).toBeInViewport();
  await expect(page.getByRole('link', { name: 'Testar aprovação' })).toBeInViewport();
  await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Planos', exact: true })).toHaveAttribute('href', '#planos');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('full reviews remain available on the testimonial page', async ({ page }) => {
  await page.goto('/depoimentos#avaliacoes-pdf');
  expect(await page.locator('#avaliacoes-pdf blockquote').count()).toBeGreaterThan(3);
  await expect(page.getByRole('heading', { name: 'Conte sua experiência', exact: true })).toBeVisible();
});
