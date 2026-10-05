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
