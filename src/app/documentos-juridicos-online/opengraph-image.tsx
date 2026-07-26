import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Documentos jurídicos online grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · JURÍDICO',
    title: 'Documentos jurídicos organizados em PDF.',
    subtitle: 'Modelos guiados · edição online · exportação grátis'
  });
}
