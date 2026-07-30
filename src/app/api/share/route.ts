import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

async function sessionContext() {
  if (!isDatabaseConfigured()) return null;
  return getValidSessionFromCookies();
}

export async function GET() {
  const session = await sessionContext();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const links = await getPrisma().sharedDocument.findMany({
    where: { ownerId: session.sub },
    orderBy: { createdAt: 'desc' },
    include: {
      toolDocument: { select: { toolId: true, artifactId: true, updatedAt: true } }
    }
  });
  return NextResponse.json({
    links: links.map((link) => ({
      token: link.token,
      title: link.title,
      url: `/documento/${link.token}`,
      toolId: link.toolDocument.toolId,
      artifactId: link.toolDocument.artifactId,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt?.toISOString() || null,
      revokedAt: link.revokedAt?.toISOString() || null
    }))
  });
}

export async function POST(request: Request) {
  const session = await sessionContext();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as {
    toolId?: string;
    artifactId?: string;
    title?: string;
    expiresInDays?: number | null;
  };
  if (!body.toolId || !body.artifactId) return NextResponse.json({ error: 'Invalid document.' }, { status: 400 });
  const prisma = getPrisma();
  const document = await prisma.toolDocument.findUnique({ where: { userId_toolId_artifactId: { userId: session.sub, toolId: body.toolId, artifactId: body.artifactId } } });
  if (!document) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  const days = body.expiresInDays == null ? null : Math.min(365, Math.max(1, Math.trunc(body.expiresInDays)));
  const expiresAt = days ? new Date(Date.now() + days * 86_400_000) : null;
  const existing = await prisma.sharedDocument.findFirst({
    where: {
      ownerId: session.sub,
      toolDocumentId: document.id,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    },
    orderBy: { createdAt: 'desc' }
  });
  if (existing) {
    const shared = await prisma.sharedDocument.update({
      where: { id: existing.id },
      data: { title: body.title?.slice(0, 140) || existing.title, expiresAt }
    });
    return NextResponse.json({ token: shared.token, url: `/documento/${shared.token}`, reused: true });
  }
  const token = randomBytes(12).toString('base64url');
  const shared = await prisma.sharedDocument.create({
    data: {
      token,
      ownerId: session.sub,
      toolDocumentId: document.id,
      title: body.title?.slice(0, 140) || 'Documento compartilhado',
      expiresAt
    }
  });
  return NextResponse.json({ token: shared.token, url: `/documento/${shared.token}` });
}

export async function DELETE(request: Request) {
  const session = await sessionContext();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const token = new URL(request.url).searchParams.get('token')?.trim();
  if (!token) return NextResponse.json({ error: 'Invalid token.' }, { status: 400 });
  const result = await getPrisma().sharedDocument.updateMany({
    where: { token, ownerId: session.sub, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  if (!result.count) return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
  return NextResponse.json({ revoked: true });
}
