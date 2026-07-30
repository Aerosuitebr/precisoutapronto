import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

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
