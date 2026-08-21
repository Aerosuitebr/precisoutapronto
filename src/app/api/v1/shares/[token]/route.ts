import { NextResponse } from 'next/server';
import { resolveCanonicalShareLink } from '@/lib/distribution/resolver';

type RouteContext = { params: Promise<{ token: string }> };

function privateResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive'
    }
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const result = await resolveCanonicalShareLink(token);
  if (!result) return privateResponse({ error: 'Compartilhamento indisponível.' }, 503);
  if (!result.enabled) return privateResponse({ enabled: false, available: false });
  if (result.unavailable) return privateResponse({ error: 'Compartilhamento não encontrado.' }, 404);
  return privateResponse({ enabled: true, available: true, shareLink: result.shareLink });
}
