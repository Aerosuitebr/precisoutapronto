import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { viralFunnelMetrics } from '@/lib/growth/viral-funnel';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!isInternalDashboardEmail(session.email)) return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });

  const requested = Number(new URL(request.url).searchParams.get('days') || 30);
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const since = new Date(Date.now() - days * 86_400_000);
  const prisma = getPrisma();
  const [quotes, viewed, pendingUnviewed, pendingViewed, recruitClicked, creators, occupations, statuses, activeCreatorRows, recruitedQuotes] = await Promise.all([
    prisma.orcamento.count({ where: { createdAt: { gte: since } } }),
    prisma.orcamento.count({ where: { createdAt: { gte: since }, firstViewedAt: { not: null } } }),
    prisma.orcamento.count({ where: { createdAt: { gte: since }, status: 'pending', firstViewedAt: null } }),
    prisma.orcamento.count({ where: { createdAt: { gte: since }, status: 'pending', firstViewedAt: { not: null } } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "orcamentos"
      WHERE "createdAt" >= ${since} AND "firstRecruitClickedAt" IS NOT NULL
    `.then((rows) => Number(rows[0]?.count || 0)),
    prisma.orcamento.groupBy({
      by: ['ownerEmail'],
      where: { ownerEmail: { not: null }, recruitedFromDocument: { not: null } },
      _min: { createdAt: true }
    }),
    prisma.orcamento.groupBy({
      by: ['sourceOccupation'],
      where: { createdAt: { gte: since }, sourceOccupation: { not: null }, recruitedFromDocument: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { sourceOccupation: 'desc' } },
      take: 8
    }),
    prisma.orcamento.groupBy({
      by: ['status'],
      where: { createdAt: { gte: since } },
      _count: { _all: true }
    }),
    prisma.orcamento.groupBy({
      by: ['ownerEmail'],
      where: { createdAt: { gte: since }, ownerEmail: { not: null } },
      _count: { _all: true }
    }),
    prisma.orcamento.count({ where: { createdAt: { gte: since }, recruitedFromDocument: { not: null } } })
  ]);
  const newCreators = creators.filter((row) => row._min.createdAt && row._min.createdAt >= since).length;
  const statusCount = (status: string) => statuses.find((row) => row.status === status)?._count._all || 0;
  const funnel = viralFunnelMetrics({
    quotes,
    viewed,
    recruitClicked,
    approved: statusCount('approved'),
    adjustments: statusCount('declined'),
    recruitedQuotes,
    newCreators,
    activeCreators: activeCreatorRows.length,
    repeatCreators: activeCreatorRows.filter((row) => row._count._all >= 2).length
  });

  return NextResponse.json({
    days,
    since: since.toISOString(),
    quotes,
    viewed,
    pendingUnviewed,
    pendingViewed,
    recruitClicked,
    newCreators,
    recruitedQuotes,
    ...funnel,
    approved: statusCount('approved'),
    adjustments: statusCount('declined'),
    activeCreators: activeCreatorRows.length,
    repeatCreators: activeCreatorRows.filter((row) => row._count._all >= 2).length,
    definition: 'Criadores identificados cuja primeira criação veio de um orçamento público, por 100 orçamentos no período.',
    occupations: occupations.map((row) => ({ name: row.sourceOccupation || 'Sem ofício', quotes: row._count._all }))
  });
}
