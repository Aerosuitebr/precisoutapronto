import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Badges e embeds Resolva Jato';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'RESOLVA JATO · PARCEIROS',
    title: 'Badges prontos para linkar.',
    subtitle: 'HTML e Markdown com UTM de parceria'
  });
}
