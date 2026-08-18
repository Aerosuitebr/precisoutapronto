import { expect, test } from '@playwright/test';

test('home leads with a task-first promise and popular outcomes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Resolva agora. Saia com algo pronto.');
  await expect(page.getByRole('search', { name: 'Buscar ferramenta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
  await expect(page.getByText('Escolha pelo que precisa fazer')).toBeVisible();
  const main = page.locator('main');
  for (const label of ['Recibo de aluguel', 'Calcular rescisão', 'Gerar QR Code Pix', 'Referência ABNT']) {
    await expect(main.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: 'Não é uma lista de ferramentas. É um caminho até o resultado.' })).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Jato Games');
});

test('profession landing loads an adapted quote instead of generic copy', async ({ page }) => {
  await page.goto('/orcamento-para/eletricista', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Orçamento para eletricista');
  await expect(page.locator('input[value="Visita técnica e diagnóstico"]')).toBeVisible();
  await expect(page.locator('input[value="Materiais elétricos"]')).toBeVisible();
  await expect(page.locator('input[value="Mão de obra de instalação"]')).toBeVisible();
});

test('priority profession cluster covers high-intent local services', async ({ page }) => {
  for (const slug of ['fotografo', 'mecanico', 'pedreiro']) {
    await page.goto(`/orcamento-para/${slug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Orçamento para');
    await expect(page.locator('input[value]').first()).toBeVisible();
  }
});

test('rental receipt landing aligns title, visible example and CTA', async ({ page }) => {
  await page.goto('/recibo-de-aluguel', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('Recibo de Aluguel Grátis para Imprimir e Baixar PDF | Resolva Jato');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Um recibo claro para quem paga e para quem recebe.');
  await expect(page.getByText('RECIBO Nº 008')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Criar meu recibo grátis' })).toHaveAttribute(
    'href',
    '/gerador-de-recibo?modelo=aluguel-residencial'
  );
});

test('shareable content always points to interactive destinations', async ({ page }) => {
  await page.goto('/conteudos-para-compartilhar', { waitUntil: 'domcontentloaded' });
  const cards = page.getByRole('link', { name: /Abrir experiência/ });
  await expect(cards).toHaveCount(11);
  const hrefs = await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs.every((href) => href?.includes('utm_source=content_hub'))).toBe(true);
});

test('public email signature landing is indexable and exposes the live editor', async ({ page }) => {
  await page.goto('/assinatura-de-email', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Criar assinatura de e-mail profissional grátis (Gmail e Outlook) | Resolva Jato');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crie sua assinatura de e-mail profissional grátis');
  await page.locator('#nome').fill('Ana Lima');
  await page.locator('#cargo').fill('Designer');
  await expect(page.getByText('Ana Lima', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copiar assinatura' })).toBeEnabled();
});
