import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Ferramentas grátis para MEI';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · PARA MEI',
    title: 'Cobrar e profissionalizar sem burocracia.',
    subtitle: 'Orçamento com Pix, recibo, contrato e proposta'
  });
}
