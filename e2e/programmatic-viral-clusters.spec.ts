import { expect, test } from '@playwright/test';
import { receiptClusterPages } from '../src/lib/seo/receipt-cluster';
import { viralClusters } from '../src/lib/seo/viral-clusters';

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
