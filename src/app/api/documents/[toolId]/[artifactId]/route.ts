import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

type RouteProps = { params: Promise<{ toolId: string; artifactId: string }> };
const allowedTools = new Set([
  'curriculo', 'recibos', 'propostas', 'contratos',
  'resume-intl', 'receipt-intl', 'proposal-intl', 'service-contract-intl', 'academic-cover-intl',
  'legal-documents-intl', 'accounting-documents-intl'
]);

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
