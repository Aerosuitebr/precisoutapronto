import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Checklist de cobrança para MEI';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · MEI',
    title: 'Checklist de cobrança do MEI.',
    subtitle: 'Orçamento · Pix · proposta · recibo'
  });
}
