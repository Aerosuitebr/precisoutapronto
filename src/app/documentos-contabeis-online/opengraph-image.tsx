import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Documentos contábeis online grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · CONTÁBIL',
    title: 'Documentos contábeis prontos para assinar.',
    subtitle: 'Modelos claros · PDF organizado · uso gratuito'
  });
}
