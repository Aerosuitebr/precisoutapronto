import type { MetadataRoute } from 'next';
import { isStagingEnv } from '@/lib/app-env';
import { buildFullSitemap } from '@/lib/seo/sitemap-entries';

export const dynamic = 'force-dynamic';

/** `/sitemap.xml` via convenção do Next, sem pasta `sitemap.xml` (que 500 no App Router). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (isStagingEnv()) return [];
  return buildFullSitemap();
}
