import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Calculadora de rescisão trabalhista grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · RESCISÃO',
    title: 'Calcule sua rescisão em minutos.',
    subtitle: 'Saldo, férias, 13º, aviso e FGTS · grátis, sem cadastro'
  });
}
