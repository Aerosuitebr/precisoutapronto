import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Calculadora de 13º salário grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · 13º',
    title: 'Calcule o 13º salário em minutos.',
    subtitle: 'Avos, 1ª e 2ª parcela · grátis, sem cadastro'
  });
}
