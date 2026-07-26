import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Gerador de proposta comercial online grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · PROPOSTA',
    title: 'Proposta comercial com cara de empresa.',
    subtitle: 'Itens, valores e PDF profissional em minutos'
  });
}
