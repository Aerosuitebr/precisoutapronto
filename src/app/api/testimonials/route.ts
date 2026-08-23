import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { parseTestimonialSubmission } from '@/lib/testimonials/contracts';

export async function POST(request: Request) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Entre na sua conta para enviar.' }, { status: 401 });
  const data = parseTestimonialSubmission(await request.json().catch(() => null));
  if (!data) return NextResponse.json({ error: 'Revise os campos e confirme a autorização.' }, { status: 400 });
  const prisma = getPrisma();
  const recent = await prisma.testimonialSubmission.count({ where: { userId: session.sub, createdAt: { gte: new Date(Date.now() - 86_400_000) } } });
  if (recent >= 2) return NextResponse.json({ error: 'Limite diário de relatos atingido.' }, { status: 429 });
  await prisma.testimonialSubmission.create({ data: { ...data, userId: session.sub } });
  return NextResponse.json({ submitted: true, status: 'pending' }, { status: 201 });
}
