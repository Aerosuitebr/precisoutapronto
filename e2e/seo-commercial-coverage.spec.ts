import { expect, test } from '@playwright/test';
import { buildFullSitemap, sitemapEntriesToXml } from '../src/lib/seo/sitemap-entries';

const supportingPaths = [
  '/biblioteca',
  '/para/freelancers',
  '/recibos/recibo-prestacao-de-servico',
  '/recibos/recibo-para-autonomo',
  '/guias/como-cobrar-sinal-antes-de-comecar-servico',
  '/guias/como-gerar-qr-code-pix-para-cobranca',
  '/guias/cliente-nao-pagou-mensagem-de-cobranca',
  '/guias/como-precificar-servico-freelancer',
  '/guias/orcamento-ou-proposta-comercial',
  '/orcamento-para/chaveiro',
  '/orcamento-para/gesseiro',
  '/orcamento-para/marceneiro',
  '/orcamento-para/instalacao-de-piso',
  '/guias/como-registrar-sinal-e-saldo-pix'
];

test('production sitemap includes commercial supporting pages', () => {
  const xml = sitemapEntriesToXml(buildFullSitemap('https://precisoutapronto.com.br'));
  for (const path of supportingPaths) expect(xml).toContain(`${path}</loc>`);
  expect(xml).not.toMatch(/<loc>[^<]*\/(?:conta|ferramentas|documento|orcamento)\//);
  expect(xml).not.toContain('/orcamento-para/encanador</loc>');
  expect(xml).not.toContain('/orcamento-para/diarista</loc>');
  expect(xml).toContain('xmlns:video=');
  expect(xml).toContain('/videos/precisou-ta-pronto-promo-16x9.mp4');
});

test('commercial pages respect the target environment indexing policy', async ({ request, baseURL }) => {
  // Determine the expected policy from the target, never from a potentially broken response.
  const staging = /^(staging|homolog)\./.test(new URL(baseURL!).hostname);
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  if (staging) expect(xml).not.toContain('<loc>');
  for (const path of supportingPaths) {
    if (!staging) expect(xml).toContain(`${path}</loc>`);
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const robotsHeader = response.headers()['x-robots-tag'] ?? '';
    if (staging) expect(robotsHeader, path).toMatch(/\bnoindex\b/i);
    else expect(robotsHeader, path).not.toMatch(/noindex/i);
    const html = await response.text();
    if (!staging) expect(html, path).not.toMatch(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i);
    expect(html, path).toMatch(new RegExp(`<link[^>]*rel="canonical"[^>]*href="[^"]*${path}"`));
  }
  expect(xml).not.toMatch(/<loc>[^<]*\/(?:conta|ferramentas|documento|orcamento)\//);
});

test('library leads with service tools and keeps the full catalog available', async ({ request }) => {
  const response = await request.get('/biblioteca');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Do orçamento ao recibo');
  expect(html).toContain('Guias para o próximo serviço');
  expect(html).toContain('Todos os modelos e respostas rápidas');
  expect(html).toContain('href="/gerador-de-qr-code-pix"');
  expect(html).toContain('href="/recibos/recibo-pagamento-pix"');
});

test('receipt hub targets pix generator intent without noindex', async ({ request, baseURL }) => {
  const staging = /^(staging|homolog)\./.test(new URL(baseURL!).hostname);
  const response = await request.get('/recibos');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Gerador de recibo Pix');
  expect(html).toContain('href="/recibos/recibo-pagamento-pix"');
  expect(html).toContain('Gerador de recibo Pix cria comprovante bancário?');
  if (staging) expect(response.headers()['x-robots-tag'] ?? '').toMatch(/\bnoindex\b/i);
  else expect(html).not.toMatch(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i);
});

test('pix receipt landing keeps frozen title and explains generator intent', async ({ request }) => {
  const response = await request.get('/recibos/recibo-pagamento-pix');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Recibo de Pix: o comprovante serve? Gere o PDF');
  expect(html).toContain('Gerador de recibo Pix e gerador de comprovante são a mesma coisa?');
});
