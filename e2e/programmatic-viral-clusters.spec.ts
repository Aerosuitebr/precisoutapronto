import { expect, test } from '@playwright/test';
import { receiptClusterPages } from '../src/lib/seo/receipt-cluster';
import { viralClusters } from '../src/lib/seo/viral-clusters';
import { viralPublicResultUrl } from '../src/lib/viral-loop';
import { RECEIPT_PROFESSION_CONTEXTS } from '../src/lib/recibos/profession-contexts';
import { CONTRACT_PROFESSION_CONTEXTS } from '../src/lib/contratos/profession-contexts';
import { PROFESSION_LANDINGS } from '../src/lib/orcamentos/profession-presets';

test('receipt cluster has unique, substantial and connected intent pages', () => {
  expect(receiptClusterPages).toHaveLength(8);
  expect(new Set(receiptClusterPages.map((page) => page.slug)).size).toBe(receiptClusterPages.length);
  for (const page of receiptClusterPages) {
    expect(page.answer.length).toBeGreaterThan(120);
    expect(page.fields.length).toBeGreaterThanOrEqual(5);
    expect(page.steps.length).toBeGreaterThanOrEqual(4);
    expect(page.sections.length).toBeGreaterThanOrEqual(2);
    expect(page.faqs.length).toBeGreaterThanOrEqual(3);
    expect(page.related.every((slug) => receiptClusterPages.some((item) => item.slug === slug))).toBe(true);
  }
});

test('viral hubs cover the priority engines with unique resources', () => {
  expect(viralClusters.map((cluster) => cluster.path)).toEqual(['/rescisao', '/redacao-enem', '/pix', '/pdf']);
  for (const cluster of viralClusters) {
    expect(cluster.resources.length).toBeGreaterThanOrEqual(4);
    expect(new Set(cluster.resources.map((item) => item.href)).size).toBe(cluster.resources.length);
    expect(cluster.faqs.length).toBeGreaterThanOrEqual(3);
    expect(cluster.primary.href.startsWith('/')).toBe(true);
  }
});

test('PDF Pronto exposes local processing and all supported page operations', () => {
  const pdf = viralClusters.find((cluster) => cluster.path === '/pdf');
  expect(pdf?.h1).toContain('sem enviar documentos');
  expect(pdf?.resources.map((item) => item.title)).toEqual(expect.arrayContaining([
    'Juntar PDF online',
    'Dividir PDF online',
    'Comprimir PDF online',
    'Editor de PDF online',
    'Extrair páginas do PDF',
    'Remover páginas do PDF',
    'Girar páginas do PDF',
    'Organizar páginas do PDF'
  ]));
});

test('public Result Jato URL carries a bounded snapshot and safe tool destination', () => {
  const url = new URL(viralPublicResultUrl({ title: 'Rescisão estimada', highlightLabel: 'Total', highlightValue: 'R$ 8.742,31', lines: [{ label: 'Saldo', value: 'R$ 1.200,00' }], toolPath: '/calculadora-de-rescisao', campaign: 'test' }));
  expect(url.pathname).toBe('/resultado-pronto');
  expect(url.searchParams.get('ferramenta')).toBe('/calculadora-de-rescisao');
  expect(url.searchParams.get('valor')).toBe('R$ 8.742,31');
  expect(url.searchParams.get('utm_medium')).toBe('resultado_pronto');
});

test('priority long-tail pages cover receipts, contracts and quotes', () => {
  expect(RECEIPT_PROFESSION_CONTEXTS.map((item) => item.slug)).toEqual(expect.arrayContaining([
    'prestacao-de-servicos', 'aluguel-residencial', 'diarista-e-domestica', 'psicologo-e-terapia'
  ]));
  expect(CONTRACT_PROFESSION_CONTEXTS.map((item) => item.slug)).toEqual(expect.arrayContaining([
    'social-media', 'desenvolvimento-de-software'
  ]));
  expect(PROFESSION_LANDINGS.map((item) => item.slug)).toEqual(expect.arrayContaining([
    'pintura-residencial', 'eletricista'
  ]));
});
