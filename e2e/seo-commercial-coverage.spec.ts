import { expect, test } from '@playwright/test';

const supportingPaths = [
  '/biblioteca',
  '/para/freelancers',
  '/recibos/recibo-prestacao-de-servico',
  '/recibos/recibo-para-autonomo',
  '/guias/como-cobrar-sinal-antes-de-comecar-servico',
  '/guias/como-gerar-qr-code-pix-para-cobranca',
  '/guias/cliente-nao-pagou-mensagem-de-cobranca',
  '/guias/como-precificar-servico-freelancer',
  '/guias/orcamento-ou-proposta-comercial'
];

test('commercial supporting pages are discoverable and indexable', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const path of supportingPaths) {
    expect(xml).toContain(`${path}</loc>`);
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['x-robots-tag'] ?? '', path).not.toMatch(/noindex/i);
    const html = await response.text();
    expect(html, path).not.toMatch(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i);
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
});
