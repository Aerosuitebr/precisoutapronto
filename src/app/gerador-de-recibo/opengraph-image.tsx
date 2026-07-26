import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Gerador de recibo online grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · RECIBO',
    title: 'Recibo de pagamento limpo e completo.',
    subtitle: 'Valor por extenso · PDF · assinatura digital'
  });
}
