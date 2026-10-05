import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'node:fs/promises';

test('protected PDF exports all pages after editing its penultimate footer', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const input = process.env.E2E_PRIVATE_PDF_PATH || 'e2e/fixtures/protected-empty-password.pdf';
  const bytes = await readFile(input);
  await expect(PDFDocument.load(bytes)).rejects.toThrow(/encrypted/);
  await page.route('https://cdn.jsdelivr.net/npm/@fontsource/**', route => route.abort());
  await page.route('https://unpkg.com/@fontsource/**', route => route.abort());
  await page.goto('/editor-de-pdf-online');
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'protected.pdf', mimeType: 'application/pdf', buffer: bytes
  });
  await expect(page.getByRole('button', { name: 'Editar conteúdo da página' })).toHaveCount(3);
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).first().click();
  const overlays = page.locator('[data-overlay-kind="text"]');
  await expect(overlays.first()).toBeAttached();
  const count = await overlays.count();
  expect(count).toBeGreaterThan(2);
  const textMatch = process.env.E2E_PDF_TEXT_MATCH;
  const target = textMatch
    ? page.getByLabel(new RegExp(textMatch))
    : overlays.nth(count - 2);
  const editor = page.getByRole('textbox', { name: 'Editar texto', exact: true });
  for (const fraction of [0.05, 0.5, 0.95]) {
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    await target.click({ position: { x: box!.width * fraction, y: box!.height / 2 } });
    await expect(editor).toBeVisible();
    if (textMatch) await expect(editor).toHaveValue(new RegExp(textMatch));
    await editor.press('Escape');
  }
  await target.click();
  await expect(editor).toBeVisible();
  // Marca como editado sem alterar os dados do arquivo privado opcional.
  const original = await editor.inputValue();
  await editor.fill(`${original} `);
  await page.getByRole('button', { name: 'Salvar página' }).click();
  const downloadPromise = page.waitForEvent('download', { timeout: 25000 }).catch(error => {
    throw new Error(`${error.message}\nBrowser errors: ${errors.join('\n')}`);
  });
  await page.getByRole('button', { name: 'Baixar PDF final' }).click();
  const download = await downloadPromise;
  const result = await readFile((await download.path())!);
  const output = await PDFDocument.load(result);
  expect(output.getPageCount()).toBe(3);
  await expect(page.getByText(/PDF baixado\. As páginas protegidas/)).toBeVisible();
  await page.reload();
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'exported.pdf', mimeType: 'application/pdf', buffer: result
  });
  await expect(page.getByRole('button', { name: 'Editar conteúdo da página' })).toHaveCount(3);
  await page.getByRole('button', { name: 'Editar conteúdo da página' }).first().click();
  await expect(page.locator('[data-overlay-kind="text"]').first()).toBeAttached();
  await page.screenshot({ path: 'test-results/protected-export-preview.png', fullPage: true });
});
