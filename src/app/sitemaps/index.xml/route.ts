import { isStagingEnv } from '@/lib/app-env';
import { SITEMAP_SEGMENTS } from '@/lib/seo/sitemap-entries';
import { getViralBaseUrl } from '@/lib/viral-loop';

export const dynamic = 'force-static';

/** Índice de sitemaps por segmento, para o GSC mostrar cobertura por grupo. */
export async function GET() {
  const base = getViralBaseUrl().replace(/\/$/, '');

  if (isStagingEnv()) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>`,
      { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }

  const lastmod = new Date().toISOString();
  const body = SITEMAP_SEGMENTS.map(
    (segment) =>
      `<sitemap><loc>${base}/sitemaps/${segment}</loc><lastmod>${lastmod}</lastmod></sitemap>`
  ).join('');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'noindex'
    }
  });
}
