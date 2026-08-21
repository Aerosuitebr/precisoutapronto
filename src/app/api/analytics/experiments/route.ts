import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  experimentAssignmentAggregates,
  experimentObservabilityDays
} from '@/lib/experimentation/observability';

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

  const days = experimentObservabilityDays(new URL(request.url).searchParams.get('days'));
  const since = new Date(Date.now() - days * 86_400_000);
  const prisma = getPrisma();
  const [assignmentTotal, assignmentRows, exposures, flags] = await Promise.all([
    prisma.experimentAssignment.count({ where: { assignedAt: { gte: since } } }),
    prisma.experimentAssignment.groupBy({
      by: ['experimentKey', 'variant'],
      where: { assignedAt: { gte: since } },
      _count: { _all: true },
      orderBy: [{ experimentKey: 'asc' }, { variant: 'asc' }]
    }),
    prisma.productEvent.count({
      where: { eventName: 'experiment.exposed', occurredAt: { gte: since } }
    }),
    prisma.featureFlag.findMany({
      select: { key: true, enabled: true, rolloutPercent: true, updatedAt: true },
      orderBy: { key: 'asc' }
    })
  ]);

  return NextResponse.json({
    window: { days, since: since.toISOString() },
    totals: { assignments: assignmentTotal, exposures },
    assignments: experimentAssignmentAggregates(assignmentRows),
    flags: flags.map((flag) => ({
      key: flag.key,
      enabled: flag.enabled,
      rolloutPercent: flag.rolloutPercent,
      updatedAt: flag.updatedAt.toISOString()
    })),
    privacy: 'Aggregates only; subject, user, device and session identifiers are not returned.'
  });
}
