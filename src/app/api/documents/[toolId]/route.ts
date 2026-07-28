import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

type RouteProps = { params: Promise<{ toolId: string }> };
const allowedTools = new Set([
  'curriculo', 'recibos', 'propostas', 'contratos',
  'resume-intl', 'receipt-intl', 'proposal-intl', 'service-contract-intl', 'academic-cover-intl',
  'legal-documents-intl', 'accounting-documents-intl'
]);

async function context(params: RouteProps['params']) {
  if (!isDatabaseConfigured()) return null;
  const session = await getValidSessionFromCookies();
  const { toolId } = await params;
  if (!session || !allowedTools.has(toolId)) return null;
  return { userId: session.sub, toolId };
}

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const auth = await context(params);
    if (!auth) return NextResponse.json({ error: 'Not authenticated or invalid tool.' }, { status: 401 });
    const rows = await getPrisma().toolDocument.findMany({
      where: auth,
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({
      documents: rows.map((row) => ({ ...row.data as Record<string, unknown>, id: row.artifactId, updatedAt: row.updatedAt.toISOString() }))
    });
  } catch (error) {
    console.error('[documents:get]', error);
    return NextResponse.json({ error: 'Could not load documents.' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const auth = await context(params);
    if (!auth) return NextResponse.json({ error: 'Not authenticated or invalid tool.' }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const artifactId = typeof body.id === 'string' ? body.id.slice(0, 160) : '';
    if (!artifactId) return NextResponse.json({ error: 'Invalid document ID.' }, { status: 400 });
    if (JSON.stringify(body).length > 2_500_000) {
      return NextResponse.json({ error: 'Document is too large.' }, { status: 413 });
    }
    const row = await getPrisma().toolDocument.upsert({
      where: { userId_toolId_artifactId: { ...auth, artifactId } },
      create: { ...auth, artifactId, data: body as Prisma.InputJsonValue },
      update: { data: body as Prisma.InputJsonValue }
    });
    return NextResponse.json({
      document: { ...row.data as Record<string, unknown>, id: row.artifactId, updatedAt: row.updatedAt.toISOString() }
    });
  } catch (error) {
    console.error('[documents:post]', error);
    return NextResponse.json({ error: 'Could not save document.' }, { status: 500 });
  }
}
