import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Gerador de contrato online grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · CONTRATO',
    title: 'Contrato claro, pronto para assinar.',
    subtitle: 'Escopo, prazo e pagamento organizados em PDF'
  });
}
