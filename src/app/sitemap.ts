import type { MetadataRoute } from 'next';
import { isStagingEnv } from '@/lib/app-env';
import { buildFullSitemap } from '@/lib/seo/sitemap-entries';

export const revalidate = 3600;

/** `/sitemap.xml` via convenção do Next, sem pasta `sitemap.xml` (que 500 no App Router). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (isStagingEnv()) return [];
  try {
    return buildFullSitemap();
  } catch (error) {
    console.error('[sitemap.xml]', error);
    return [];
  }
}
