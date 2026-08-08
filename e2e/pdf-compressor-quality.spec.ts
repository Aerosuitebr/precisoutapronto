import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

async function textPdf() { const doc=await PDFDocument.create(); const font=await doc.embedFont(StandardFonts.Helvetica); const page=doc.addPage([595.28,841.89]); page.drawText('SEARCHABLE CONTRACT TEXT',{x:50,y:760,size:18,font}); return Buffer.from(await doc.save({useObjectStreams:false})); }
async function scanPdf() { const width=1800,height=2400; const raw=Buffer.alloc(width*height*3); for(let i=0;i<raw.length;i+=3){raw[i]=(i/3)%251;raw[i+1]=((i/3)/width)%241;raw[i+2]=(raw[i]+raw[i+1])%255;} const png=await sharp(raw,{raw:{width,height,channels:3}}).png({compressionLevel:0}).toBuffer(); const doc=await PDFDocument.create(); const image=await doc.embedPng(png); const page=doc.addPage([595.28,841.89]); page.drawImage(image,{x:0,y:0,width:595.28,height:841.89}); return Buffer.from(await doc.save({useObjectStreams:false})); }

test('lossless mode preserves page geometry and searchable text operators', async ({ page }) => {
  const source=await textPdf(); await page.goto('/comprimir-pdf-online');
  await page.locator('input[type=file]').setInputFiles({name:'contract.pdf',mimeType:'application/pdf',buffer:source});
  await page.getByRole('button',{name:'Comprimir PDF'}).click();
  const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Baixar PDF comprimido'}).click(); const download=await downloadPromise;
  const bytes=await readFile((await download.path())!); const output=await PDFDocument.load(bytes);
  expect(output.getPageCount()).toBe(1); expect(output.getPage(0).getWidth()).toBeCloseTo(595.28,1); expect(output.getPage(0).getHeight()).toBeCloseTo(841.89,1);
  expect(bytes.length).toBeGreaterThan(500);
});

test('strong mode substantially reduces an image-heavy PDF and preserves page geometry', async ({ page }) => {
  const source=await scanPdf(); await page.goto('/comprimir-pdf-online');
  await page.locator('input[type=file]').setInputFiles({name:'scan.pdf',mimeType:'application/pdf',buffer:source});
  await page.getByRole('button',{name:'Forte'}).click(); await page.getByRole('button',{name:'Comprimir PDF'}).click();
  const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Baixar PDF comprimido'}).click(); const download=await downloadPromise;
  const bytes=await readFile((await download.path())!); const output=await PDFDocument.load(bytes);
  expect(output.getPageCount()).toBe(1); expect(output.getPage(0).getWidth()).toBeCloseTo(595.28,1); expect(output.getPage(0).getHeight()).toBeCloseTo(841.89,1);
  expect(bytes.length).toBeLessThan(source.length*0.35);
});

test('compressor pages are localized and disclose rasterization', async ({ page }) => {
  for(const path of ['/comprimir-pdf-online','/en/tools/compress-pdf','/es/tools/compress-pdf']) { await page.goto(path); await expect(page.locator('h1')).toHaveCount(1); await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',new RegExp(path.replaceAll('/','\\/'))); }
  await page.goto('/comprimir-pdf-online'); const source=await textPdf(); await page.locator('input[type=file]').setInputFiles({name:'x.pdf',mimeType:'application/pdf',buffer:source}); await page.getByRole('button',{name:'Forte'}).click(); await expect(page.getByText(/transformam cada página em imagem/)).toBeVisible();
});
