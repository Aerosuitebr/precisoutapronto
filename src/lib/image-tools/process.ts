export type ImageOutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type ImageProcessOptions = {
  width: number;
  height: number;
  format: ImageOutputFormat;
  quality: number;
};

export async function decodeImage(file: File) {
  return createImageBitmap(file, { imageOrientation: 'from-image' });
}

export function containedDimensions(sourceWidth: number, sourceHeight: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1);
  return { width: Math.max(1, Math.round(sourceWidth * scale)), height: Math.max(1, Math.round(sourceHeight * scale)) };
}

export async function processImage(file: File, options: ImageProcessOptions) {
  const bitmap = await decodeImage(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const context = canvas.getContext('2d', { alpha: options.format !== 'image/jpeg' });
    if (!context) throw new Error('canvas-unavailable');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    if (options.format === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('encode-failed')), options.format, options.quality)
    );
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    bitmap.close();
  }
}

export function extensionForFormat(format: ImageOutputFormat) {
  return format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
}

export async function imageBlobToPdf(blob: Blob, width: number, height: number) {
  const { jsPDF } = await import('jspdf');
  const orientation = width > height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height], compress: true, hotfixes: ['px_scaling'] });
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  pdf.addImage(dataUrl, blob.type === 'image/png' ? 'PNG' : blob.type === 'image/webp' ? 'WEBP' : 'JPEG', 0, 0, width, height, undefined, 'FAST');
  return pdf.output('blob');
}
