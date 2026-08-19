import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Calculadora de férias CLT grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · FÉRIAS',
    title: 'Calcule suas férias em minutos.',
    subtitle: '1/3 constitucional e abono · grátis, sem cadastro'
  });
}
