import { isStagingEnv } from '@/lib/app-env';
import {
  SITEMAP_SEGMENTS,
  buildSitemapIndexXml as buildSitemapIndexXml,
  buildSitemapSegment,
  sitemapEntriesToXml as sitemapEntriesToXml,
  type SitemapSegment
} from '@/lib/seo/sitemap-entries';

export const revalidate = 3600;
export const runtime = 'nodejs';

const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  'X-Robots-Tag': 'noindex'
} as const;

const EMPTY_URLSET =
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

const EMPTY_INDEX =
  '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>';

function isSegment(value: string): value is SitemapSegment {
  return (SITEMAP_SEGMENTS as readonly string[]).includes(value);
}

function isIndex(value: string) {
  return value === 'index.xml' || value === 'index';
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ segment: string }> }
) {
  const { segment: rawSegment } = await context.params;
  const segment = rawSegment.replace(/\.xml$/i, '');

  if (isStagingEnv()) {
    return new Response(isIndex(segment) ? EMPTY_INDEX : EMPTY_URLSET, { headers: XML_HEADERS });
  }

  try {
    if (isIndex(segment)) {
      return new Response(buildSitemapIndexXml(), { headers: XML_HEADERS });
    }

    if (!isSegment(segment)) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(sitemapEntriesToXml(buildSitemapSegment(segment)), { headers: XML_HEADERS });
  } catch (error) {
    console.error('[sitemaps]', segment, error);
    return new Response(isIndex(segment) ? EMPTY_INDEX : EMPTY_URLSET, {
      status: 200,
      headers: XML_HEADERS
    });
  }
}
