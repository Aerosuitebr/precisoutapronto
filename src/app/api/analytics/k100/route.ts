import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const requested = Number(new URL(request.url).searchParams.get('days') || 30);
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const since = new Date(Date.now() - days * 86_400_000);
  const prisma = getPrisma();
  const [quotes, creators, occupations] = await Promise.all([
    prisma.orcamento.count({ where: { createdAt: { gte: since } } }),
    prisma.orcamento.groupBy({
      by: ['ownerEmail'],
      where: { ownerEmail: { not: null } },
      _min: { createdAt: true }
    }),
    prisma.orcamento.groupBy({
      by: ['sourceOccupation'],
      where: { createdAt: { gte: since }, sourceOccupation: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { sourceOccupation: 'desc' } },
      take: 8
    })
  ]);
  const newCreators = creators.filter((row) => row._min.createdAt && row._min.createdAt >= since).length;
  const k100 = quotes ? Number(((newCreators / quotes) * 100).toFixed(1)) : 0;

  return NextResponse.json({
    days,
    since: since.toISOString(),
    quotes,
    newCreators,
    k100,
    definition: 'Criadores identificados cuja primeira criação ocorreu no período, por 100 orçamentos.',
    occupations: occupations.map((row) => ({ name: row.sourceOccupation || 'Sem ofício', quotes: row._count._all }))
  });
}
