import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Ferramentas grátis para estudantes';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · ESTUDANTES',
    title: 'Capa ABNT e currículo antes do prazo.',
    subtitle: 'Trabalhos, currículo e documentos sem enrolação'
  });
}
