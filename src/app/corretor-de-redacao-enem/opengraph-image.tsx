import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Corretor de redação ENEM grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · ENEM',
    title: 'Corrija sua redação por competência.',
    subtitle: 'Estimativa C1 a C5 · 2 análises grátis sem cadastro'
  });
}
