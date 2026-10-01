import { expect, test } from '@playwright/test';
import { peerInviteUrl } from '../src/lib/growth/peer-invite';

test('convite abre o modelo correto e preserva benefício sem copiar dados', () => {
  const url = new URL(peerInviteUrl('https://precisoutapronto.com.br', 'eletricista', 'https://precisoutapronto.com.br/orcamento-com-pix?ref=ABCD1234'));
  expect(url.pathname).toBe('/orcamento-para/eletricista');
  expect(url.searchParams.get('ref')).toBe('ABCD1234');
  expect(url.searchParams.get('utm_campaign')).toBe('peer_model_v1');
  expect(url.searchParams.has('source_document')).toBe(false);
});

test('demonstração simula resposta sem criar orçamento', async ({ page }) => {
  let writes = 0;
  page.on('request', r => { if (r.method() === 'POST' && /\/api\/orcamentos/.test(r.url())) writes++; });
  await page.goto('/demonstracao-orcamento');
  await page.getByRole('button', { name: 'Aprovar orçamento', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Aprovação simulada' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Usar este modelo', exact: true })).toHaveAttribute('href', /eletricista/);
  expect(writes).toBe(0);
});

test('modelo não mostra erros antes da interação e permite prévia sem contatos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/orcamento-para/eletricista#montar');
  const essentials = page.getByRole('button', { name: 'Apenas essenciais' });
  if (await essentials.isVisible()) await essentials.click();
  await expect(page.getByText('Valor deve ser maior que zero.', { exact: true })).toHaveCount(0);
  await expect(page.locator('#orc-profissional-nome')).toBeHidden();
  for (let i = 0; i < 3; i++) await page.locator(`#orc-item-${i}-valor`).fill('10000');
  await page.getByRole('button', { name: 'Ver prévia sem dados pessoais' }).click();
  await expect(page.getByRole('region', { name: 'Prévia do orçamento' })).toBeVisible();
  await expect(page.locator('#orc-profissional-nome')).toHaveValue('');
  await page.getByRole('button', { name: 'Continuar para dados de envio' }).click();
  await expect(page.locator('#orc-profissional-nome')).toBeVisible();
  await expect(page.locator('#orc-cliente-nome')).toHaveValue('');
});

test('kit oferece arquivos e link segmentado utilizável', async ({ page, request }) => {
  await page.goto('/conteudos-para-compartilhar#kit');
  await page.getByLabel('Seu canal ou identificador público').fill('joao_eletrica');
  await page.getByLabel('Profissão', { exact: true }).selectOption('pintor');
  await expect(page.getByLabel('Legenda pronta')).toHaveValue(/orcamento-para\/pintor\?utm_source=joao_eletrica/);
  expect((await request.get('/kit/orcamento.png')).status()).toBe(200);
  await expect(page.getByRole('link', { name: 'Baixar vídeo horizontal (16:9)' })).toHaveAttribute('href', /\.mp4$/);
  await expect(page.getByText('pasta de vídeos', { exact: false })).toHaveCount(0);
});

test('criação confirmada exibe convite por profissão e registra segunda criação', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('precisoutapronto_analytics_consent', 'accepted');
    localStorage.setItem('precisoutapronto_quote_milestones_v1', JSON.stringify({ ids: ['previous'], firstAt: Date.now() - 172800000, lastAt: Date.now() - 172800000 }));
    (window as unknown as { auditEvents: unknown[] }).auditEvents = [];
    window.gtag = (...args: unknown[]) => { (window as unknown as { auditEvents: unknown[] }).auditEvents.push(args); };
  });
  await page.route('**/api/orcamentos', route => route.request().method() === 'POST' ? route.fulfill({ json: { id: 'local-test-second', url: 'http://localhost:3100/orcamento/local-test-second', total: 300 } }) : route.fulfill({ json: { items: [] } }));
  await page.route('**/api/referral/me', route => route.fulfill({ json: { inviteUrl: 'https://precisoutapronto.com.br/orcamento-com-pix?ref=ABCD1234', whatsappUrl: 'https://wa.me/?text=invite' } }));
  await page.goto('/orcamento-para/eletricista#montar');
  for (let i = 0; i < 3; i++) await page.locator(`#orc-item-${i}-valor`).fill('10000');
  await page.getByRole('button', { name: 'Ver prévia sem dados pessoais' }).click();
  await page.getByRole('button', { name: 'Continuar para dados de envio' }).click();
  await page.locator('#orc-profissional-nome').fill('Profissional de teste');
  await page.locator('#orc-profissional-whatsapp').fill('11999999999');
  await page.locator('#orc-cliente-nome').fill('Cliente de teste');
  await page.locator('#orc-cliente-whatsapp').fill('11988888888');
  await page.getByRole('button', { name: 'Gerar orçamento e enviar', exact: true }).click();
  const invite = page.getByRole('link', { name: 'Compartilhar no WhatsApp', exact: true });
  await expect(invite).toBeVisible();
  await expect(invite).toHaveAttribute('href', /eletricista/);
  await expect(invite).toHaveAttribute('href', /ABCD1234/);
  const events = await page.evaluate(() => (window as unknown as { auditEvents: unknown[] }).auditEvents);
  expect(JSON.stringify(events)).toContain('quote_browser_second_created');
});
