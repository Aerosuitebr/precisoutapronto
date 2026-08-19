import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Simulador MEI ou CLT grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · MEI OU CLT',
    title: 'Compare MEI e CLT lado a lado.',
    subtitle: 'Renda líquida estimada · grátis, sem cadastro'
  });
}
