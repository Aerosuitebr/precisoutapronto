import { PDFDocument } from 'pdf-lib';

export type PdfCompressionMode = 'lossless' | 'balanced' | 'strong';

export async function compressPdfLossless(bytes: Uint8Array) {
  const source = await PDFDocument.load(bytes, { updateMetadata: false });
  return source.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 });
}

export async function compressPdfRasterized(bytes: Uint8Array, mode: Exclude<PdfCompressionMode, 'lossless'>, onProgress?: (page: number, total: number) => void) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  const loading = pdfjs.getDocument({ data: bytes.slice(0) });
  const input = await loading.promise;
  const output = await PDFDocument.create();
  const dpi = mode === 'balanced' ? 120 : 90;
  const quality = mode === 'balanced' ? 0.82 : 0.68;
  for (let index = 0; index < input.numPages; index += 1) {
    const page = await input.getPage(index + 1);
    const pointViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale: dpi / 72 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(renderViewport.width));
    canvas.height = Math.max(1, Math.round(renderViewport.height));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('canvas-unavailable');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport: renderViewport }).promise;
    const jpeg = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('jpeg-encode-failed')), 'image/jpeg', quality));
    const image = await output.embedJpg(await jpeg.arrayBuffer());
    const target = output.addPage([pointViewport.width, pointViewport.height]);
    target.drawImage(image, { x: 0, y: 0, width: pointViewport.width, height: pointViewport.height });
    page.cleanup(); onProgress?.(index + 1, input.numPages);
  }
  await input.destroy();
  return output.save({ useObjectStreams: true, addDefaultPage: false });
}
