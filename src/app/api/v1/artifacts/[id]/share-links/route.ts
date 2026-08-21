import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { parseShareLinkCreate } from '@/lib/distribution/contracts';
import { createCanonicalShareLink } from '@/lib/distribution/share-links';
import { emitServerProductEvent } from '@/lib/events/server-emitter';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Artefato inválido.' }, { status: 400 });
  const body = await request.json().catch(() => null);
  const parsed = parseShareLinkCreate(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Compartilhamento inválido.', code: parsed.error }, { status: 400 });
  const result = await createCanonicalShareLink(session.sub, id, parsed.data);
  if (!result) return NextResponse.json({ error: 'Compartilhamento temporariamente indisponível.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, created: false });
  if (result.notFound) return NextResponse.json({ error: 'Artefato não encontrado.' }, { status: 404 });
  await emitServerProductEvent({
    eventName: 'outcome.shared',
    deviceId: session.sid || session.sub,
    ...(session.sid ? { authenticatedSessionId: session.sid } : {}),
    userId: session.sub,
    toolKey: result.toolKey,
    artifactId: id,
    properties: { share_link_id: result.shareLinkId, channel: parsed.data.channel }
  });
  return NextResponse.json({
    enabled: true, created: true, shareLinkId: result.shareLinkId,
    token: result.token, expiresAt: result.expiresAt
  }, { status: 201 });
}
