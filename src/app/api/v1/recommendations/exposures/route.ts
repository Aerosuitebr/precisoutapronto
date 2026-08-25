import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import {
  createRecommendationExposure,
  parseRecommendationExposure,
  pseudonymizeRecommendationSession,
  validAnonymousRecommendationSession
} from '@/lib/recommendation/exposures';

export async function POST(request: Request) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = parseRecommendationExposure(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Exposição inválida.', code: parsed.error }, { status: 400 });
  const session = await getValidSessionFromCookies();
  const anonymousKey = request.headers.get('x-precisoutapronto-session-id') || '';
  if (!session && !validAnonymousRecommendationSession(anonymousKey)) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 400 });
  }
  const subject = session
    ? { userId: session.sub }
    : { sessionId: pseudonymizeRecommendationSession(anonymousKey) };
  const result = await createRecommendationExposure(subject, parsed.data);
  if (!result) return NextResponse.json({ error: 'Recomendações temporariamente indisponíveis.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, recorded: false });
  return NextResponse.json({ enabled: true, recorded: true, exposureId: result.exposureId, shownAt: result.shownAt }, { status: 201 });
}
