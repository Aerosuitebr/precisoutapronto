import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';

for (const fontsAvailable of [true, false]) {
test(`long footer can be edited and downloaded (fonts available: ${fontsAvailable})`, async ({ page }) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const sheet = doc.addPage([595, 842]);
  const footer = 'Documento de teste: linha longa do rodapé que deve permanecer disponível para edição.';
  const size = 13;
  expect(font.widthOfTextAtSize(footer, size)).toBeGreaterThan(595 * 0.8);
  sheet.drawRectangle({ x: 20, y: 38, width: 555, height: 1, color: rgb(0.8, 0.8, 0.8) });
  sheet.drawText(footer, { x: 20, y: 36, size, font });
  sheet.drawText('Última linha de teste.', { x: 20, y: 18, size: 8, font });

  // A fonte é local para que o teste não dependa da disponibilidade do CDN.
  const fontPath = process.env.E2E_PDF_FONT_PATH || 'e2e/fixtures/DejaVuSans-test.ttf';
  const fontBytes = await readFile(fontPath);
  await page.route('https://cdn.jsdelivr.net/npm/@fontsource/**', route =>
    fontsAvailable
      ? route.fulfill({ body: fontBytes, contentType: 'font/ttf', headers: { 'access-control-allow-origin': '*' } })
      : route.abort()
  );
  await page.route('https://unpkg.com/@fontsource/**', route => route.abort());
  await page.goto('/ferramentas/editor-pdf');
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'footer.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await doc.save())
  });
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).click();
  await page.getByLabel(footer, { exact: true }).click();
  const edited = fontsAvailable ? 'Rodapé editado com acentuação e símbolo Ω' : 'Rodapé editado: salário R$ 2.921,20';
  await page.getByRole('textbox', { name: 'Editar texto', exact: true }).fill(edited);
  await page.getByRole('button', { name: 'Salvar página' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF final' }).click();
  const download = await downloadPromise;
  const bytes = await readFile((await download.path())!);
  const output = await PDFDocument.load(bytes);
  expect(output.getPageCount()).toBe(1);
  expect(output.getPage(0).getSize()).toEqual({ width: 595, height: 842 });

  await page.reload();
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'edited.pdf', mimeType: 'application/pdf', buffer: bytes
  });
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).click();
  await expect.poll(async () => {
    const labels = await page.locator('[data-overlay-kind="text"]').evaluateAll(nodes =>
      nodes.map(node => node.getAttribute('aria-label') || '').join(' ')
    );
    return labels;
  }).toContain(edited);
});
}

test('export keeps an edited line on its baseline even in a narrow box', async ({ page }) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const sheet = doc.addPage([595, 842]);
  const original = '01/01/2025 - Aberto';
  const edited = '01/01/2025 - 30/09/2026';
  sheet.drawText(original, { x: 24, y: 520, size: 14, font });
  sheet.drawText('Empregador de teste', { x: 24, y: 494, size: 10, font });
  await page.route('https://cdn.jsdelivr.net/npm/@fontsource/**', route => route.abort());
  await page.route('https://unpkg.com/@fontsource/**', route => route.abort());
  await page.goto('/ferramentas/editor-pdf');
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'line-layout.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await doc.save())
  });
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).click();
  await page.getByLabel(original, { exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Editar texto', exact: true });
  await editor.fill(edited);
  await expect(editor).toHaveAttribute('wrap', 'off');
  await editor.press('Escape');
  const handle = page.getByRole('button', { name: 'Redimensionar', exact: true });
  const bounds = (await handle.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x - 80, bounds.y + bounds.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Salvar página' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF final' }).click();
  const bytes = await readFile((await (await downloadPromise).path())!);
  await page.reload();
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'edited-line.pdf', mimeType: 'application/pdf', buffer: bytes
  });
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).click();
  await expect(page.getByLabel(edited, { exact: true })).toBeVisible();
  await expect(page.getByLabel('Empregador de teste', { exact: true })).toBeVisible();
});
