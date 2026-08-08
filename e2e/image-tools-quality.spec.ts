import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'node:fs/promises';

async function photoFixture() {
  const width = 1200, height = 800;
  const raw = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 3; raw[i] = x % 256; raw[i + 1] = y % 256; raw[i + 2] = (x + y) % 256;
  }
  return sharp(raw, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

test('optimizer produces a smaller WebP with exact proportional dimensions', async ({ page }) => {
  const source = await photoFixture();
  await page.goto('/comprimir-redimensionar-imagem');
  await page.locator('input[type=file]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: source });
  await page.getByLabel('Largura').fill('600');
  await expect(page.getByLabel('Altura')).toHaveValue('400');
  await page.getByRole('button', { name: 'Gerar resultado' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo' }).click();
  const download = await downloadPromise;
  const bytes = await readFile((await download.path())!);
  const metadata = await sharp(bytes).metadata();
  expect(metadata.format).toBe('webp');
  expect(metadata.width).toBe(600); expect(metadata.height).toBe(400);
  expect(bytes.length).toBeLessThan(source.length * 0.7);
});

test('PNG conversion preserves alpha channel', async ({ page }) => {
  const source = await sharp({ create: { width: 320, height: 200, channels: 4, background: { r: 20, g: 120, b: 220, alpha: 0.35 } } }).png().toBuffer();
  await page.goto('/converter-imagem-online');
  await page.locator('input[type=file]').setInputFiles({ name: 'alpha.png', mimeType: 'image/png', buffer: source });
  await page.getByLabel('Formato').selectOption('image/png');
  await page.getByRole('button', { name: 'Gerar resultado' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo' }).click();
  const download = await downloadPromise;
  const bytes = await readFile((await download.path())!);
  const metadata = await sharp(bytes).metadata();
  expect(metadata.format).toBe('png'); expect(metadata.hasAlpha).toBe(true);
  expect(metadata.width).toBe(320); expect(metadata.height).toBe(200);
});

test('image to PDF produces a valid one-page document', async ({ page }) => {
  const source = await sharp({ create: { width: 640, height: 480, channels: 3, background: '#38bdf8' } }).jpeg({ quality: 95 }).toBuffer();
  await page.goto('/converter-imagem-online');
  await page.locator('input[type=file]').setInputFiles({ name: 'photo.jpg', mimeType: 'image/jpeg', buffer: source });
  await page.getByLabel('Formato').selectOption('application/pdf');
  await page.getByRole('button', { name: 'Gerar resultado' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo' }).click();
  const download = await downloadPromise;
  const bytes = await readFile((await download.path())!);
  const pdf = await PDFDocument.load(bytes);
  expect(pdf.getPageCount()).toBe(1);
  expect(bytes.subarray(0, 4).toString()).toBe('%PDF');
});

test('image tools expose localized canonical and one H1', async ({ page }) => {
  for (const path of ['/comprimir-redimensionar-imagem', '/en/tools/image-optimizer', '/es/tools/image-optimizer']) {
    await page.goto(path); await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(path.replaceAll('/', '\\/')));
  }
});
