import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Planos e preços do Precisou, Tá Pronto';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · PLANOS',
    title: 'Comece grátis. Premium quando precisar.',
    subtitle: 'Orçamento com Pix, recibo, contrato e proposta'
  });
}
