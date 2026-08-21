import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { revokeCanonicalShareLink } from '@/lib/distribution/share-links';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Compartilhamento inválido.' }, { status: 400 });
  const result = await revokeCanonicalShareLink(session.sub, id);
  if (!result) return NextResponse.json({ error: 'Compartilhamento temporariamente indisponível.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, revoked: false });
  if (result.notFound) return NextResponse.json({ error: 'Compartilhamento não encontrado.' }, { status: 404 });
  return NextResponse.json({ enabled: true, revoked: true, revokedAt: result.revokedAt });
}
