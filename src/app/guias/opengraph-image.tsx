import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Guias práticos do Precisou, Tá Pronto';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · GUIAS',
    title: 'Respostas claras para o dia a dia.',
    subtitle: 'Recibos, contratos, currículo, rescisão e precificação'
  });
}
