import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  buildDocumentEditorHref,
  buildDuplicateDocumentData,
  getDocumentHistoryTool
} from '@/lib/document-history';

type RouteProps = { params: Promise<{ toolId: string; artifactId: string }> };
const allowedTools = new Set([
  'curriculo', 'recibos', 'propostas', 'contratos',
  'resume-intl', 'receipt-intl', 'proposal-intl', 'service-contract-intl', 'academic-cover-intl',
  'legal-documents-intl', 'accounting-documents-intl'
]);

async function authenticatedContext(params: RouteProps['params']) {
  if (!isDatabaseConfigured()) return null;
  const session = await getValidSessionFromCookies();
  const { toolId, artifactId } = await params;
  if (!session || !allowedTools.has(toolId)) return null;
  return { userId: session.sub, toolId, artifactId };
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const auth = await authenticatedContext(params);
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated or invalid tool.' }, { status: 401 });
    }
    const body = await request.json().catch(() => null) as { isFavorite?: unknown } | null;
    if (typeof body?.isFavorite !== 'boolean') {
      return NextResponse.json({ error: 'Invalid favorite state.' }, { status: 400 });
    }
    const updated = await getPrisma().toolDocument.updateMany({
      where: auth,
      data: { isFavorite: body.isFavorite }
    });
    if (!updated.count) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }
    return NextResponse.json({ updated: true, isFavorite: body.isFavorite });
  } catch (error) {
    console.error('[documents:patch]', error);
    return NextResponse.json({ error: 'Could not update document.' }, { status: 500 });
  }
}

export async function POST(_request: Request, { params }: RouteProps) {
  try {
    const auth = await authenticatedContext(params);
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated or invalid tool.' }, { status: 401 });
    }
    const tool = getDocumentHistoryTool(auth.toolId);
    if (!tool) {
      return NextResponse.json({ error: 'Duplication unavailable for this tool.' }, { status: 400 });
    }
    const source = await getPrisma().toolDocument.findFirst({ where: auth });
    if (!source) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });

    const artifactId = `dup_${crypto.randomUUID()}`;
    const data = buildDuplicateDocumentData(source.data, artifactId, tool.label);
    if (!data) return NextResponse.json({ error: 'Invalid document data.' }, { status: 422 });

    const copy = await getPrisma().toolDocument.create({
      data: {
        userId: auth.userId,
        toolId: auth.toolId,
        artifactId,
        data: data as Prisma.InputJsonValue
      }
    });
    return NextResponse.json({
      document: {
        artifactId: copy.artifactId,
        toolId: copy.toolId,
        title: data.title,
        updatedAt: copy.updatedAt.toISOString(),
        isFavorite: copy.isFavorite,
        editorHref: buildDocumentEditorHref(copy.toolId, copy.artifactId),
        toolLabel: tool.label
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[documents:duplicate]', error);
    return NextResponse.json({ error: 'Could not duplicate document.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
    const session = await getValidSessionFromCookies();
    const { toolId, artifactId } = await params;
    if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    if (!allowedTools.has(toolId)) return NextResponse.json({ error: 'Invalid tool.' }, { status: 400 });
    const deleted = await getPrisma().toolDocument.deleteMany({
      where: { userId: session.sub, toolId, artifactId }
    });
    if (!deleted.count) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[documents:delete]', error);
    return NextResponse.json({ error: 'Could not delete document.' }, { status: 500 });
  }
}
