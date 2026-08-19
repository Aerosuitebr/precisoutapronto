import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Calculadora de preço para freelancer grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · PRECIFICAÇÃO',
    title: 'Descubra quanto cobrar de verdade.',
    subtitle: 'Custos, horas, taxas e margem · grátis, sem cadastro'
  });
}
