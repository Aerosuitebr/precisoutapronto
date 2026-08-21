import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { canonicalHistoryLimit, listCanonicalHistory } from '@/lib/artifacts/history';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const limit = canonicalHistoryLimit(new URL(request.url).searchParams.get('limit'));
  const history = await listCanonicalHistory(session.sub, limit);
  return NextResponse.json({
    ...history,
    limit,
    source: 'canonical-shadow',
    legacyHistoryUnchanged: true
  });
}
