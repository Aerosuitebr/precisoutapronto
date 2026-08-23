import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { revalidatePath } from 'next/cache';

async function internal() {
  const session = await getValidSessionFromCookies();
  return session && isInternalDashboardEmail(session.email) ? session : null;
}
export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  if (!await internal()) return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
  const rows = await getPrisma().testimonialSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ rows });
}
export async function PATCH(request: Request) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  if (!await internal()) return NextResponse.json({ error: 'Acesso restrito.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== 'string' || !['approved', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Decisão inválida.' }, { status: 400 });
  await getPrisma().testimonialSubmission.update({ where: { id: body.id }, data: { status: body.status, reviewedAt: new Date() } });
  revalidatePath('/', 'layout');
  return NextResponse.json({ updated: true });
}
