import { buildRobotsBody } from '@/lib/seo/robots-body';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildRobotsBody(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
