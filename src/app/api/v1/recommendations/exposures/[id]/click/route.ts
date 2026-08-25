import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import {
  clickRecommendationExposure,
  pseudonymizeRecommendationSession,
  validAnonymousRecommendationSession
} from '@/lib/recommendation/exposures';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Exposição inválida.' }, { status: 400 });
  const session = await getValidSessionFromCookies();
  const anonymousKey = request.headers.get('x-precisoutapronto-session-id') || '';
  if (!session && !validAnonymousRecommendationSession(anonymousKey)) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 400 });
  }
  const subject = session
    ? { userId: session.sub }
    : { sessionId: pseudonymizeRecommendationSession(anonymousKey) };
  const result = await clickRecommendationExposure(id, subject);
  if (!result) return NextResponse.json({ error: 'Recomendações temporariamente indisponíveis.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, recorded: false });
  if (result.notFound) return NextResponse.json({ error: 'Exposição não encontrada.' }, { status: 404 });
  return NextResponse.json({
    enabled: true, recorded: true, alreadyClicked: result.alreadyClicked,
    ...(result.clickedAt ? { clickedAt: result.clickedAt } : {})
  });
}
