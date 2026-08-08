import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function fixture(name: string, pages: number, width: number, height: number) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < pages; index += 1) {
    const page = doc.addPage([width, height]);
    page.drawText(`${name} page ${index + 1}`, { x: 36, y: height - 54, size: 18, font, color: rgb(0.05, 0.2, 0.4) });
    page.drawRectangle({ x: 36, y: 36, width: width - 72, height: 80, color: rgb(0.9, 0.95, 1) });
  }
  return Buffer.from(await doc.save());
}

test('merge PDF preserves all pages and source page sizes', async ({ page }) => {
  const first = await fixture('FIRST', 2, 595.28, 841.89);
  const second = await fixture('SECOND', 1, 612, 792);
  await page.goto('/juntar-pdf-online');
  await expect(page.locator('h1')).toHaveText('Juntar PDF online grátis');
  await page.locator('input[type=file]').first().setInputFiles([
    { name: 'first.pdf', mimeType: 'application/pdf', buffer: first },
    { name: 'second.pdf', mimeType: 'application/pdf', buffer: second }
  ]);
  await expect(page.getByAltText(/Página 3/)).toBeVisible({ timeout: 20_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF final' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const output = await PDFDocument.load(await (await import('node:fs/promises')).readFile(path!));
  expect(output.getPageCount()).toBe(3);
  expect(output.getPage(0).getWidth()).toBeCloseTo(595.28, 1);
  expect(output.getPage(2).getWidth()).toBeCloseTo(612, 1);
});

test('split PDF exports only selected pages without changing source', async ({ page }) => {
  const source = await fixture('SPLIT', 3, 595.28, 841.89);
  await page.goto('/dividir-pdf-online');
  await expect(page.locator('h1')).toHaveText('Dividir PDF e extrair páginas online');
  await page.locator('input[type=file]').first().setInputFiles({ name: 'split.pdf', mimeType: 'application/pdf', buffer: source });
  await expect(page.getByAltText(/Página 3/)).toBeVisible({ timeout: 20_000 });
  await page.getByLabel('Selecionar página').nth(1).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Extrair' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const output = await PDFDocument.load(await (await import('node:fs/promises')).readFile(path!));
  const original = await PDFDocument.load(source);
  expect(output.getPageCount()).toBe(1);
  expect(original.getPageCount()).toBe(3);
});

test('PT, EN and ES PDF task pages expose one H1 and reciprocal hreflang', async ({ page }) => {
  for (const path of ['/juntar-pdf-online', '/en/tools/merge-pdf', '/es/tools/merge-pdf']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(path.replaceAll('/', '\\/')));
    await expect(page.locator('link[hreflang="pt-BR"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="es"]')).toHaveCount(1);
  }
});
