import { isStagingEnv } from '@/lib/app-env';
import {
  SITEMAP_SEGMENTS,
  buildSitemapSegment,
  sitemapEntriesToXml,
  type SitemapSegment
} from '@/lib/seo/sitemap-entries';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isSegment(value: string): value is SitemapSegment {
  return (SITEMAP_SEGMENTS as readonly string[]).includes(value);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ segment: string }> }
) {
  if (isStagingEnv()) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } }
    );
  }

  const { segment } = await context.params;
  if (!isSegment(segment)) {
    return new Response('Not found', { status: 404 });
  }

  const xml = sitemapEntriesToXml(buildSitemapSegment(segment));
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'noindex'
    }
  });
}
