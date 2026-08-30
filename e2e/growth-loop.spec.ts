import { expect, test } from '@playwright/test';
import { parseQuickQuoteText } from '../src/lib/orcamentos/quick-entry';
import { toSafeQuoteTemplate } from '../src/lib/orcamentos/safe-template';
import { viralFunnelMetrics } from '../src/lib/growth/viral-funnel';
import { buildClienteFollowUpWhatsAppUrl, getQuoteFollowUpState } from '../src/lib/orcamentos/whatsapp-links';
import { buildApprovedQuoteShareWhatsAppUrl } from '../src/lib/viral-loop';
import { sanitizePublicStats } from '../src/lib/public-stats';
import { normalizeQuoteReceiptTransfer, receiptFromApprovedQuote } from '../src/lib/orcamentos/quote-to-receipt';
import { quoteWhatsAppAckKey } from '../src/lib/orcamentos/recipient-session';

test('quick quote parser converts bounded WhatsApp notes into editable items', () => {
  expect(parseQuickQuoteText('Instalação de tomadas 240\n2x Material elétrico R$ 140,50\nsem preço')).toEqual([
    { nome: 'Instalação de tomadas', quantidade: 1, valorUnitario: 240 },
    { nome: 'Material elétrico', quantidade: 2, valorUnitario: 140.5 }
  ]);
  expect(parseQuickQuoteText('Serviço 0\nOutro 999999999')).toEqual([]);
});

test('recipient WhatsApp acknowledgement uses only a bounded quote id', () => {
  const id = '123e4567-e89b-42d3-a456-426614174000';
  expect(quoteWhatsAppAckKey(id)).toBe(`precisoutapronto_quote_whatsapp_ack_v1:${id}`);
  expect(quoteWhatsAppAckKey('cliente@example.com')).toBe('');
  expect(quoteWhatsAppAckKey('../outro-orcamento')).toBe('');
});

test('shared quote template strips prices, ids and all identity fields', () => {
  const source = [
    { id: 'private-id', nome: 'Instalação', quantidade: 2, valorUnitario: 900, clienteNome: 'Pessoa' },
    { nome: 'Material', quantidade: 1, valorUnitario: 400 }
  ];
  const safe = toSafeQuoteTemplate(source);
  expect(safe).toEqual([
    { nome: 'Instalação', quantidade: 2 },
    { nome: 'Material', quantidade: 1 }
  ]);
  expect(JSON.stringify(safe)).not.toMatch(/900|400|private-id|Pessoa|cliente|valor/i);
});

test('viral funnel derives aggregate rates and actionable alerts without identities', () => {
  const metrics = viralFunnelMetrics({
    quotes: 100,
    viewed: 60,
    recruitClicked: 15,
    approved: 20,
    adjustments: 10,
    recruitedQuotes: 4,
    newCreators: 3,
    activeCreators: 20,
    repeatCreators: 4
  });
  expect(metrics).toMatchObject({ k100: 3, viewRate: 60, responseFromViewRate: 50, recruitClickRate: 50, recruitCompletionRate: 26.7, responseRate: 30, approvalRate: 66.7, viralQuoteRate: 4, repeatCreatorRate: 20 });
  expect(metrics.alerts).toHaveLength(3);
  expect(JSON.stringify(metrics)).not.toMatch(/email|phone|whatsapp|userId|owner/i);
});

test('quote follow-up becomes due after two days and builds a review message', () => {
  const now = new Date('2026-08-21T12:00:00.000Z');
  expect(getQuoteFollowUpState('2026-08-20T12:00:00.000Z', 'pending', now).due).toBe(false);
  expect(getQuoteFollowUpState('2026-08-19T11:59:00.000Z', 'pending', now)).toMatchObject({ due: true, ageDays: 2, urgency: 'normal' });
  expect(getQuoteFollowUpState('2026-08-10T12:00:00.000Z', 'pending', now, '2026-08-20T12:00:00.000Z')).toMatchObject({ due: false, ageDays: 1, viewed: true });
  expect(getQuoteFollowUpState('2026-08-10T12:00:00.000Z', 'approved', now).due).toBe(false);
  const url = buildClienteFollowUpWhatsAppUrl({
    clienteWhatsapp: '(11) 98888-0000', clienteNome: 'Ana', profissionalNome: 'Oficina',
    url: 'https://precisoutapronto.com.br/orcamento/teste', total: 490, branded: false
  });
  expect(url).toContain('https://wa.me/5511988880000?text=');
  expect(decodeURIComponent(url)).toContain('LEMBRETE DO ORÇAMENTO');
  expect(decodeURIComponent(url)).toContain('REVER ORÇAMENTO');
  expect(decodeURIComponent(url)).toContain('link tenha se perdido');
  const viewedUrl = buildClienteFollowUpWhatsAppUrl({
    clienteWhatsapp: '(11) 98888-0000', clienteNome: 'Ana', profissionalNome: 'Oficina',
    url: 'https://precisoutapronto.com.br/orcamento/teste', total: 490, viewed: true, branded: false
  });
  expect(decodeURIComponent(viewedUrl)).toContain('conseguiu analisar');
  expect(decodeURIComponent(viewedUrl)).not.toMatch(/visualizou|rastreamento/i);
});

test('approved quote story is shareable without customer or commercial data', () => {
  const url = buildApprovedQuoteShareWhatsAppUrl();
  const decoded = decodeURIComponent(url);
  expect(decoded).toContain('Orçamento aprovado');
  expect(decoded).toContain('utm_campaign=orcamento_aprovado');
  expect(decoded).toContain('/resultado-pronto?');
  expect(decoded).not.toMatch(/clienteNome|source_document|telefone|email|R\$|total|pixKey/i);
});

test('public proof hides small cohorts and rounds visible counters down', () => {
  const safe = sanitizePublicStats({
    orcamentosToday: 9,
    orcamentosWeek: 27,
    orcamentosApprovedWeek: 14,
    usersTotal: 149,
    docsGeneratedApprox: 987,
    updatedAt: '2026-08-21T12:00:00.000Z'
  });
  expect(safe).toMatchObject({
    orcamentosToday: 0,
    orcamentosWeek: 20,
    orcamentosApprovedWeek: 10,
    usersTotal: 100,
    docsGeneratedApprox: 900
  });
});

test('approved quote becomes an editable receipt with only necessary fields', () => {
  const transfer = normalizeQuoteReceiptTransfer({
    receiverName: 'Oficina Silva', payerName: 'Ana', amount: 490,
    itemNames: ['Instalação', 'Material'], telefone: '11999999999', pixKey: 'secret'
  });
  expect(transfer).toEqual({ receiverName: 'Oficina Silva', payerName: 'Ana', amount: 490, itemNames: ['Instalação', 'Material'] });
  const receipt = receiptFromApprovedQuote(transfer!);
  expect(receipt).toMatchObject({ amount: 490, reference: 'Instalação, Material', receiver: { name: 'Oficina Silva' }, payer: { name: 'Ana' } });
  expect(JSON.stringify(receipt)).not.toContain('11999999999');
  expect(JSON.stringify(receipt)).not.toContain('secret');
});

test('home leads with one quote-to-payment promise', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Orçamento enviado. Serviço fechado.');
  await expect(page.getByRole('link', { name: 'Criar orçamento grátis' })).toHaveAttribute('href', '/orcamento-com-pix#montar');
  await expect(page.getByRole('heading', { name: 'Da conversa ao pagamento.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Seu cliente decide mais rápido.' })).toBeVisible();
  await expect(page.getByText('R$ 490', { exact: true })).toBeVisible();
  await expect(page.getByRole('search', { name: 'Buscar ferramenta' })).toHaveCount(0);
  await expect(page.locator('main a[href^="/recursos#category-"]')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Precisou, Tá Pronto Games');
});

test('public quote editor keeps optional details out of the critical path', async ({ page }) => {
  await page.goto('/orcamento-com-pix#montar', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('O essencial já está acima.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Validade da proposta' })).toBeHidden();
  const optionalDetailsButton = page.getByRole('button', { name: 'Adicionar validade, condições ou Pix' });
  await expect(optionalDetailsButton).toBeVisible();
  await optionalDetailsButton.click();
  await expect(optionalDetailsButton).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Validade da proposta' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pix para o cliente pagar' })).toBeVisible();
});

test('public quote editor turns pasted WhatsApp text into quote items', async ({ page }) => {
  await page.goto('/orcamento-com-pix#montar', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Pedido copiado do WhatsApp').fill('Instalação 350\nMaterial 140');
  await page.getByRole('button', { name: 'Montar itens automaticamente' }).click();
  await expect(page.getByRole('status')).toContainText('2 itens montados');
  await expect(page.locator('input[value="Instalação"]')).toBeVisible();
  await expect(page.locator('input[value="Material"]')).toBeVisible();
});

test('profession landing loads an adapted quote instead of generic copy', async ({ page }) => {
  await page.goto('/orcamento-para/eletricista', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Gerador de orçamento grátis para eletricista'
  );
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
  await expect(page).toHaveTitle('Recibo de Aluguel Grátis para Imprimir e Baixar PDF | Precisou, Tá Pronto');
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
  await expect(page).toHaveTitle('Criar assinatura de e-mail profissional grátis (Gmail e Outlook) | Precisou, Tá Pronto');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crie sua assinatura de e-mail profissional grátis');
  await page.locator('#nome').fill('Ana Lima');
  await page.locator('#cargo').fill('Designer');
  await expect(page.getByText('Ana Lima', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copiar assinatura' })).toBeEnabled();
});
