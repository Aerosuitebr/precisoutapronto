import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';

for (const sample of [
  { family: 'Arial', fontId: 'arial', bold: false, foreground: '#ac2830', background: '#e2eee2' },
  { family: 'Times New Roman', fontId: 'times-new-roman', bold: true, foreground: '#727f98', background: '#394760' }
]) {
test(`replaces a scanned date and estimates the style of ${sample.family}`, async ({ page }) => {
  const image = await page.evaluate(({ family, bold, foreground, background }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = foreground;
    ctx.font = `${bold ? 'bold ' : ''}28px "${family}"`;
    ctx.fillText('17/10/2028', 180, 150);
    return canvas.toDataURL('image/png');
  }, sample);
  const doc = await PDFDocument.create();
  const sheet = doc.addPage([400, 300]);
  sheet.drawImage(await doc.embedPng(image), { x: 0, y: 0, width: 400, height: 300 });
  await page.route('https://cdn.jsdelivr.net/npm/@fontsource/**', (route) => route.abort());
  await page.route('https://unpkg.com/@fontsource/**', (route) => route.abort());
  await page.goto('/ferramentas/editor-pdf');
  const upload = page.locator('input[type=file]').first();
  await upload.setInputFiles({
    name: 'amostra.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await doc.save())
  });
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).click();
  const board = page.getByRole('application', { name: 'Área de edição da página' });
  await expect.poll(() => board.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(320);
  await expect(board.getByText('Lendo texto, imagens e linhas…')).toBeHidden();
  await expect(board.getByText('Carregando página…')).toBeHidden();
  await page.getByRole('button', { name: 'Texto sobre imagem' }).click();
  const bounds = (await board.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * 0.22, bounds.y + bounds.height * 0.21);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.42, bounds.y + bounds.height * 0.26, { steps: 5 });
  await page.mouse.up();
  const editor = page.getByRole('textbox', { name: 'Editar texto', exact: true });
  await expect(editor).toBeVisible();
  const fontSize = page.getByRole('spinbutton', { name: 'Tamanho da fonte' });
  const detectedSize = Number(await fontSize.inputValue());
  expect(detectedSize).toBeGreaterThan(12);
  expect(detectedSize).toBeLessThan(16);
  await expect(page.getByRole('combobox', { name: 'Fonte do bloco' })).toHaveValue(sample.fontId);
  expect(await page.getByRole('checkbox', { name: 'Negrito' }).isChecked()).toBe(sample.bold);
  const foreground = await editor.evaluate((element) =>
    (getComputedStyle(element).color.match(/\d+/g) || []).map(Number)
  );
  const colorChannels = (hex: string) => hex.slice(1).match(/../g)!.map((channel) => parseInt(channel, 16));
  const background = await page.getByLabel('Cor do fundo', { exact: true }).inputValue();
  for (const [actual, expected] of [
    [foreground, colorChannels(sample.foreground)],
    [colorChannels(background), colorChannels(sample.background)]
  ]) {
    expect(Math.max(...actual.map((channel, index) => Math.abs(channel - expected[index])))).toBeLessThanOrEqual(8);
  }
  await editor.fill('REVISADO');
  await editor.press('Escape');
  await page.getByRole('button', { name: 'Desfazer' }).click();
  await expect(board.getByLabel('REVISADO', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Refazer' }).click();
  const replacement = board.getByLabel('REVISADO', { exact: true });
  await replacement.click();
  await fontSize.selectText();
  await fontSize.press('1');
  await expect(fontSize).toHaveValue('1');
  await fontSize.press('2');
  await expect(fontSize).toHaveValue('12');
  await fontSize.fill('14.5');
  await fontSize.press('Tab');
  await expect(fontSize).toHaveValue('14.5');

  const position = () => replacement.evaluate((element) => {
    const { left, top } = element.getBoundingClientRect();
    return { left, top };
  });
  const initial = await position();
  const normalWidth = (await board.boundingBox())!.width;
  await page.getByRole('button', { name: '800%', exact: true }).click();
  await expect.poll(async () => (await board.boundingBox())!.width).toBeCloseTo(normalWidth * 8, 0);
  await expect(replacement).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Aumentar zoom' })).toBeDisabled();
  await page.getByRole('button', { name: '100%', exact: true }).click();
  const move = board.getByRole('button', { name: 'Mover texto' });
  await move.press('ArrowRight');
  await expect.poll(async () => (await position()).left - initial.left).toBeCloseTo(1);
  const handle = (await move.boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + 18, handle.y + handle.height / 2 + 12, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => (await position()).left - initial.left).toBeCloseTo(19, 0);
  await expect.poll(async () => (await position()).top - initial.top).toBeCloseTo(12, 0);
  await page.getByRole('button', { name: 'Salvar página' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF final' }).click();
  const bytes = await readFile((await (await downloadPromise).path())!);
  await page.reload();
  await upload.setInputFiles({ name: 'revisado.pdf', mimeType: 'application/pdf', buffer: bytes });
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).click();
  await expect(board.getByLabel('REVISADO', { exact: true })).toBeVisible();
});
}

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
