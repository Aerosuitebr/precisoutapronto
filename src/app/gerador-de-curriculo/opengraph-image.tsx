import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Gerador de currículo online grátis';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · CURRÍCULO',
    title: 'Currículo em PDF pronto para enviar.',
    subtitle: 'Modelos profissionais · edição online · download grátis'
  });
}
