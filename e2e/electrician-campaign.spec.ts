import { expect, test } from '@playwright/test';
import { campaignFromSearch, rememberCampaign } from '../src/lib/growth/campaign-attribution';
import { ELECTRICIAN_CONTENT, electricianCampaignUrl } from '../src/lib/growth/electrician-campaign';

test('campaign origin survives internal navigation without storing contact data', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const first = rememberCampaign(storage, '?utm_source=joao&utm_campaign=eletricistas_30_dias_v2&utm_content=antes_depois_a&email=private@example.com');
  expect(rememberCampaign(storage, '?utm_source=internal&utm_campaign=other')).toEqual(first);
  expect(rememberCampaign(storage, '')).toEqual(first);
  expect(JSON.stringify([...values.values()])).not.toContain('private');
  expect(campaignFromSearch('?utm_source=private@example.com&utm_campaign=valid')).toEqual({ utm_campaign: 'valid' });
});

test('campaign handles blocked storage and malformed attribution', () => {
  expect(rememberCampaign({ getItem() { throw new Error('denied'); }, setItem() {} }, '')).toEqual({});
  expect(rememberCampaign({ getItem: () => 'broken', setItem() {} }, '?utm_source=instagram&utm_campaign=campaign')).toEqual({ utm_source: 'instagram', utm_campaign: 'campaign' });
  expect(rememberCampaign({ getItem: () => 'null', setItem() {} }, '?utm_source=instagram&utm_campaign=campaign')).toEqual({ utm_source: 'instagram', utm_campaign: 'campaign' });
});

test('all six creative links identify the asset and open the electrician model', () => {
  expect(new Set(ELECTRICIAN_CONTENT.map(a => a.id)).size).toBe(6);
  for (const asset of ELECTRICIAN_CONTENT) {
    const url = new URL(electricianCampaignUrl('joao', 'creator', asset.id));
    expect(url.pathname).toBe('/orcamento-para/eletricista');
    expect(url.searchParams.get('utm_content')).toBe(asset.id);
    expect(url.searchParams.get('utm_source')).toBe('joao');
    expect(url.hash).toBe('#montar');
  }
});

test('mobile campaign creates downloadable cards and partner-specific captions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/campanhas/eletricistas-30-dias#kit-eletricistas');
  await page.getByLabel('Canal ou identificador público').fill('joao_eletrica');
  await page.getByLabel('Formato de distribuição').selectOption('creator');
  await expect(page.getByLabel('Legenda · Não mande só o preço')).toHaveValue(/utm_source=joao_eletrica&utm_medium=creator/);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar card vertical', exact: true }).first().click();
  expect((await download).suggestedFilename()).toBe('antes_depois_a-1080x1920.png');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});


test('campaign telemetry honors consent and retains origin across navigation', async ({ page }) => {
  await page.addInitScript(() => {
    const events: unknown[][] = [];
    Object.assign(window, { campaignTestEvents: events });
    window.gtag = (...args: unknown[]) => { events.push(args); };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => undefined } });
  });
  await page.goto('/campanhas/eletricistas-30-dias?utm_source=parceiro_teste&utm_campaign=eletricistas_30_dias_v2&utm_content=antes_depois_a');
  await page.getByRole('button', { name: 'Copiar legenda', exact: true }).first().click();
  expect(await page.evaluate(() => (window as unknown as { campaignTestEvents: unknown[] }).campaignTestEvents)).toEqual([]);
  await page.evaluate(() => localStorage.setItem('precisoutapronto_analytics_consent', 'accepted'));
  await page.getByRole('button', { name: 'Copiar legenda', exact: true }).first().click();
  await page.goto('/campanhas/eletricistas-30-dias?utm_source=internal&utm_campaign=other');
  await page.getByRole('button', { name: 'Copiar legenda', exact: true }).first().click();
  const events = await page.evaluate(() => (window as unknown as { campaignTestEvents: unknown[][] }).campaignTestEvents);
  expect(events).toContainEqual(['event', 'electrician_campaign_asset_copied', expect.objectContaining({ utm_source: 'parceiro_teste', utm_campaign: 'eletricistas_30_dias_v2' })]);
  expect(JSON.stringify(events)).not.toContain('internal');
});
