import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { toolId?: string; artifactId?: string; title?: string };
  if (!body.toolId || !body.artifactId) return NextResponse.json({ error: 'Invalid document.' }, { status: 400 });
  const document = await getPrisma().toolDocument.findUnique({ where: { userId_toolId_artifactId: { userId: session.sub, toolId: body.toolId, artifactId: body.artifactId } } });
  if (!document) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  const token = randomBytes(12).toString('base64url');
  const shared = await getPrisma().sharedDocument.create({ data: { token, ownerId: session.sub, toolDocumentId: document.id, title: body.title?.slice(0, 140) || 'Documento compartilhado' } });
  return NextResponse.json({ token: shared.token, url: `/documento/${shared.token}` });
}
