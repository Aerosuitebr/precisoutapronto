import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { parseReceiptMoney, receiptPaymentBreakdown } from '../src/lib/recibos/payment-breakdown';

test('payment amounts use reais, reject malformed input and balance in cents', () => {
  expect(parseReceiptMoney('490')).toBe(490);
  expect(parseReceiptMoney('R$ 1.490,25')).toBe(1490.25);
  for (const input of ['-150', 'abc', '1,234', '1.2.3']) expect(Number.isNaN(parseReceiptMoney(input))).toBe(true);
  expect(receiptPaymentBreakdown('entrada', 490, 0, 150).remaining).toBe(340);
  expect(receiptPaymentBreakdown('parcial', 490, 150, 100).remaining).toBe(240);
  expect(receiptPaymentBreakdown('saldo', .3, .1, .2).error).toBe('');
  expect(receiptPaymentBreakdown('saldo', 490, 150, 300).error).not.toBe('');
  expect(receiptPaymentBreakdown('parcial', 490, 450, 100).error).not.toBe('');
  expect(receiptPaymentBreakdown('entrada', 490, 0, 0).error).not.toBe('');
  expect(receiptPaymentBreakdown('entrada', Infinity, 0, 150).error).not.toBe('');
});

test('Pix landing opens entry receipt, preserves attribution and exports actual data', async ({ page }, testInfo) => {
  await page.goto('/recibos/recibo-pagamento-pix');
  await page.getByRole('link', { name: /Recibo de entrada Primeiro Pix/ }).click();
  await expect(page.locator('#rec-kind')).toHaveValue('entrada');
  await expect(page.locator('#rec-receiver')).toHaveValue('');
  await page.getByRole('button', { name: 'Baixar PDF agora', exact: true }).click();
  await expect(page.locator('#ferramenta').getByRole('alert')).toContainText('Preencha');
  await page.locator('#rec-receiver').fill('Prestador de teste');
  await page.locator('#rec-payer').fill('Cliente de teste');
  await page.locator('#rec-reference').fill('Instalação de tomadas, orçamento 018');
  await page.locator('#rec-valor').fill('150');
  await page.locator('#rec-total').fill('490');
  await expect(page.getByRole('status').filter({ hasText: 'Saldo a receber' })).toContainText(/340,00/);
  await page.getByRole('button', { name: 'Baixar PDF agora', exact: true }).click();
  await expect(page.locator('#ferramenta').getByRole('alert')).toContainText('Confirme');
  await page.getByRole('checkbox', { name: /Conferi o recebimento/ }).check();
  await page.evaluate(() => {
    window.dataLayer = [];
    window.gtag = (...args: unknown[]) => { window.dataLayer!.push(args); };
  });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF agora', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(await download.failure()).toBeNull();
  const file = testInfo.outputPath('recibo-entrada.pdf');
  await download.saveAs(file);
  const pdf = await PDFDocument.load(await readFile(file));
  expect(pdf.getPageCount()).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.dataLayer)).toEqual(expect.arrayContaining([
    ['event', 'document_completed', expect.objectContaining({ tool_name: 'recibos', payment_kind: 'entrada', landing_path: '/recibos/recibo-pagamento-pix' })]
  ]));
  const events = await page.evaluate(() => window.dataLayer);
  expect(JSON.stringify(events)).not.toContain('Cliente de teste');
  expect(JSON.stringify(events)).not.toContain('Prestador de teste');
});

test('mobile receipt validates final installment and never restores example fields', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/gerador-de-recibo?tipo=saldo#ferramenta');
  await expect(page.locator('#rec-kind')).toHaveValue('saldo');
  await page.locator('#rec-total').fill('490');
  await page.locator('#rec-previous').fill('150');
  await page.locator('#rec-valor').fill('300');
  await expect(page.getByRole('status').filter({ hasText: 'Para quitar' })).toBeVisible();
  await page.locator('#rec-valor').fill('340');
  await expect(page.getByRole('status').filter({ hasText: 'Saldo a receber' })).toContainText('0,00');
  await page.locator('#rec-valor').fill('');
  await expect(page.getByRole('status').filter({ hasText: 'maiores que zero' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Ver preview ao vivo' }).click();
  await expect(page.locator('#ferramenta')).not.toContainText('123.456.789-09');
  await expect(page.locator('#ferramenta')).not.toContainText('Ana Lima Design');
});
