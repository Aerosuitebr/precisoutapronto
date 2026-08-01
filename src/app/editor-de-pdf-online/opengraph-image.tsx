import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';
import { getOrphanLanding } from '@/lib/seo/orphan-tool-landings';

const landing = getOrphanLanding('editor-pdf')!;

export const runtime = 'edge';
export const alt = landing.metaTitle;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: landing.ogEyebrow,
    title: landing.ogTitle,
    subtitle: landing.ogSubtitle
  });
}
