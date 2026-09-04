import { isStagingEnv } from '@/lib/app-env';
import { buildFullSitemap, sitemapEntriesToXml } from '@/lib/seo/sitemap-entries';

export const revalidate = 3600;
export const runtime = 'nodejs';

const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  'X-Robots-Tag': 'noindex'
} as const;

const EMPTY_URLSET =
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

/** `/sitemap.xml` canônico, sem depender do rewrite que 500 em produção. */
export function GET() {
  if (isStagingEnv()) {
    return new Response(EMPTY_URLSET, { headers: XML_HEADERS });
  }

  try {
    return new Response(sitemapEntriesToXml(buildFullSitemap()), { headers: XML_HEADERS });
  } catch (error) {
    console.error('[sitemap.xml]', error);
    return new Response(EMPTY_URLSET, { status: 200, headers: XML_HEADERS });
  }
}
