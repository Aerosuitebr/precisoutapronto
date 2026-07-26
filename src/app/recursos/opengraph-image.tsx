import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Catálogo de ferramentas online grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · RECURSOS',
    title: 'Todas as ferramentas em um só lugar.',
    subtitle: 'Documentos, cálculos e organização para o dia a dia'
  });
}
