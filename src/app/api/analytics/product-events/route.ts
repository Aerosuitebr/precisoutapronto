import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { productEventRetentionCutoff, productEventRetentionDays } from '@/lib/events/retention';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  }
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!isInternalDashboardEmail(session.email)) {
    return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });
  }

  const requestedDays = Number(new URL(request.url).searchParams.get('days') || 7);
  const days = [1, 7, 30].includes(requestedDays) ? requestedDays : 7;
  const since = new Date(Date.now() - days * 86_400_000);
  const retentionDays = productEventRetentionDays();
  const retentionCutoff = productEventRetentionCutoff();
  const prisma = getPrisma();
  const where = { occurredAt: { gte: since } };

  const [total, recentHour, byEvent, byTool, flag, retentionEligible] = await Promise.all([
    prisma.productEvent.count({ where }),
    prisma.productEvent.count({ where: { occurredAt: { gte: new Date(Date.now() - 3_600_000) } } }),
    prisma.productEvent.groupBy({
      by: ['eventName'],
      where,
      _count: { _all: true },
      orderBy: { _count: { eventName: 'desc' } }
    }),
    prisma.productEvent.groupBy({
      by: ['toolKey'],
      where,
      _count: { _all: true },
      orderBy: { _count: { toolKey: 'desc' } }
    }),
    prisma.featureFlag.findUnique({
      where: { key: 'event_platform_v1' },
      select: { enabled: true, rolloutPercent: true, updatedAt: true }
    }),
    prisma.productEvent.count({ where: { receivedAt: { lt: retentionCutoff } } })
  ]);

  return NextResponse.json({
    window: { days, since: since.toISOString() },
    totals: { events: total, lastHour: recentHour },
    byEvent: byEvent.map((row) => ({ eventName: row.eventName, count: row._count._all })),
    byTool: byTool.map((row) => ({ toolKey: row.toolKey || 'unknown', count: row._count._all })),
    flag: flag
      ? {
          enabled: flag.enabled,
          rolloutPercent: flag.rolloutPercent,
          updatedAt: flag.updatedAt.toISOString()
        }
      : null,
    retention: {
      days: retentionDays,
      cutoff: retentionCutoff.toISOString(),
      eligibleForFutureCleanup: retentionEligible,
      enforcement: 'disabled'
    },
    privacy: 'Aggregates only; event properties and subject identifiers are not returned.'
  });
}
