import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { parseShareEvent, recordCanonicalShareEvent } from '@/lib/distribution/events';

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const { token } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = parseShareEvent(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Evento inválido.', code: parsed.error }, { status: 400 });
  const session = await getValidSessionFromCookies();
  const result = await recordCanonicalShareEvent(token, parsed.data, session?.sub);
  if (!result) return NextResponse.json({ error: 'Evento temporariamente indisponível.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, recorded: false });
  if (result.unavailable) return NextResponse.json({ error: 'Compartilhamento não encontrado.' }, { status: 404 });
  return NextResponse.json({ enabled: true, recorded: true, eventId: result.eventId }, { status: 201 });
}
