import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Gerador de QR Code Pix grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · PIX',
    title: 'QR Code Pix e Copia e Cola grátis.',
    subtitle: 'Padrão Banco Central · sem cadastro para gerar'
  });
}
