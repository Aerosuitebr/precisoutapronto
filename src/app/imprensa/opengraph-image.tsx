import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Imprensa Precisou, Tá Pronto';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · IMPRENSA',
    title: 'Press kit e fatos citáveis.',
    subtitle: 'Boilerplates, logos e contato de mídia'
  });
}
