import { buildPrecisouTaProntoDownloadName } from '@/lib/download-filename';

/**
 * Exporta um elemento DOM para PDF (A4, múltiplas páginas se necessário).
 * Versão simplificada (sem marca d'água/branding) para ferramentas utilitárias
 * como cronogramas e listas de referências.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filenameHint?: string
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const imgWidthMm = usableWidth;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  const imgData = canvas.toDataURL('image/png');

  if (imgHeightMm <= usableHeight) {
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidthMm, imgHeightMm);
  } else {
    // Paginação: corta o canvas em fatias que cabem em uma página A4.
    const pageHeightPx = (usableHeight * canvas.width) / imgWidthMm;
    let renderedPx = 0;
    let first = true;

    while (renderedPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, -renderedPx);
      }
      const sliceData = sliceCanvas.toDataURL('image/png');
      const sliceHeightMm = (sliceHeightPx * imgWidthMm) / canvas.width;

      if (!first) pdf.addPage();
      pdf.addImage(sliceData, 'PNG', margin, margin, imgWidthMm, sliceHeightMm);

      renderedPx += sliceHeightPx;
      first = false;
    }
  }

  pdf.save(buildPrecisouTaProntoDownloadName('pdf', filenameHint ? `pdf` : undefined));
}
