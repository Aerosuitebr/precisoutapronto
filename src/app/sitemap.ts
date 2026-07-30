import type { MetadataRoute } from 'next';
import { isStagingEnv } from '@/lib/app-env';
import { buildFullSitemap } from '@/lib/seo/sitemap-entries';

export default function sitemap(): MetadataRoute.Sitemap {
  if (isStagingEnv()) {
    return [];
  }

  return buildFullSitemap();
}
