import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { duplicateOwnedArtifact } from '@/lib/artifacts/duplication';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { emitServerProductEvent } from '@/lib/events/server-emitter';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Artefato inválido.' }, { status: 400 });
  const result = await duplicateOwnedArtifact(session.sub, id);
  if (!result) return NextResponse.json({ error: 'Duplicação temporariamente indisponível.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, duplicated: false });
  if (result.notFound) return NextResponse.json({ error: 'Artefato não encontrado.' }, { status: 404 });
  await emitServerProductEvent({
    eventName: 'continuity.duplicated',
    deviceId: session.sid || session.sub,
    ...(session.sid ? { authenticatedSessionId: session.sid } : {}),
    userId: session.sub,
    toolKey: result.toolKey,
    taskId: result.taskId,
    artifactId: result.artifactId,
    properties: { source_artifact_id: id, target_task_id: result.taskId }
  });
  return NextResponse.json({ enabled: true, duplicated: true, artifactId: result.artifactId, taskId: result.taskId, toolKey: result.toolKey }, { status: 201 });
}
