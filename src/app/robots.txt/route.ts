import { buildRobotsBody } from '@/lib/seo/robots-body';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildRobotsBody(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Curto no CDN: regras Disallow erradas em cache matam indexação (ex.: /conta → /contato).
      'Cache-Control': 'public, max-age=300, s-maxage=300, must-revalidate'
    }
  });
}
