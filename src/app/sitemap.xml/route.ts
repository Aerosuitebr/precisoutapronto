import { isStagingEnv } from '@/lib/app-env';
import { buildSitemapIndexXml } from '@/lib/seo/sitemap-entries';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMPTY_INDEX =
  '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>';

/** Google lê `/sitemap.xml` como índice dos segmentos em `/sitemaps/{segment}`. */
export async function GET() {
  const xml = isStagingEnv() ? EMPTY_INDEX : buildSitemapIndexXml();
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'noindex'
    }
  });
}
