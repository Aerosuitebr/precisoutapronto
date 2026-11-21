import { expect, test } from '@playwright/test';

test('home retains quote creation and demonstrates the customer experience', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('O que você precisa resolver hoje?');
  await expect(page.getByRole('link', { name: 'Criar orçamento grátis', exact: true })).toHaveAttribute('href', '/orcamento-com-pix#montar');
  await page.getByRole('link', { name: 'Ver como o cliente recebe', exact: true }).click();
  await expect(page).toHaveURL(/demonstracao-orcamento$/);
  await expect(page.getByRole('button', { name: 'Aprovar orçamento', exact: true })).toBeVisible();
});
test('discovery precedes the workflow and search supports keyboard selection and dismissal', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.locator('#ferramentas').evaluate(element => Boolean(element.compareDocumentPosition(document.getElementById('como-funciona')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const search = page.getByRole('combobox', { name: 'Qual ferramenta você procura?' });
  await search.fill('quero juntar dois PDFs');
  await expect(page.getByRole('option').first()).toHaveText('Juntar PDFs');
  await search.fill('rescisão');
  await expect(page.getByRole('listbox')).toBeVisible();
  await search.press('Escape');
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await search.press('ArrowDown');
  await expect(page.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/calculadora-de-rescisao/);
});

test('profession shortcuts open the prefilled editor and the catalog is linked', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: 'Ver todas as ferramentas', exact: true }).first()).toHaveAttribute('href', '/recursos');
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
  const shortcuts = page.getByRole('list', { name: 'Atalhos para ferramentas' }).getByRole('link');
  const targets = [
    '/gerador-de-curriculo#ferramenta',
    '/gerador-de-recibo#ferramenta',
    '/editor-de-pdf-online#ferramenta',
    '/gerador-de-qr-code-pix#gerar',
    '/calculadora-de-rescisao',
    '/orcamento-com-pix#montar'
  ];
  await expect(shortcuts).toHaveCount(targets.length);
  for (const [index, target] of targets.entries()) {
    await expect(shortcuts.nth(index)).toHaveAttribute('href', target);
    await expect(shortcuts.nth(index)).toBeInViewport();
  }
  await expect(page.getByRole('navigation', { name: 'Navegação rápida no celular' }).getByRole('link', { name: 'Planos', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: /Seus documentos não saem do seu dispositivo/ })).toHaveAttribute('href', '/editor-de-pdf-online#ferramenta');
  await expect(page.getByRole('navigation', { name: 'Navegação rápida no celular' }).getByRole('link', { name: 'Planos', exact: true })).toHaveAttribute('href', '/planos');
});

test('home shows three testimonials per category and links to the full list', async ({ page }) => {
  await page.goto('/');
  const groups = page.locator('#depoimentos').getByRole('article');
  await expect(groups).toHaveCount(4);
  for (const group of await groups.all()) {
    await expect(group.locator('blockquote')).toHaveCount(3);
  }
  await groups.filter({ has: page.getByRole('heading', { name: 'Editor de PDF' }) })
    .getByRole('link', { name: 'Mais avaliações' }).click();
  await expect(page).toHaveURL(/\/depoimentos#avaliacoes-pdf$/);
  expect(await page.locator('#avaliacoes-pdf blockquote').count()).toBeGreaterThan(3);
  await expect(page.getByRole('heading', { name: 'Conte sua experiência', exact: true })).toBeVisible();
});
