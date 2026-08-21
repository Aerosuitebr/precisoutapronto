import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  recommendationMetrics,
  recommendationObservabilityDays,
  recommendationRolloutReadiness
} from '@/lib/recommendation/observability';

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

  const days = recommendationObservabilityDays(new URL(request.url).searchParams.get('days'));
  const since = new Date(Date.now() - days * 86_400_000);
  const prisma = getPrisma();
  const [events, flags, activeEdges] = await Promise.all([
    prisma.productEvent.groupBy({
      by: ['eventName'],
      where: {
        occurredAt: { gte: since },
        eventName: { in: ['recommendation.shown', 'recommendation.clicked', 'recommendation.completed'] }
      },
      _count: { _all: true }
    }),
    prisma.featureFlag.findMany({
      where: { key: { in: ['nba_v1', 'event_platform_v1'] } },
      select: { key: true, enabled: true, rolloutPercent: true, updatedAt: true }
    }),
    prisma.intentEdge.count({ where: { active: true, relationType: 'next_action' } })
  ]);
  const flag = flags.find((item) => item.key === 'nba_v1') || null;
  const eventFlag = flags.find((item) => item.key === 'event_platform_v1') || null;
  const killed = new Set((process.env.FEATURE_KILL_SWITCHES || '').split(',').map((item) => item.trim()).filter(Boolean));
  const rolloutSignals = {
    trackingSecretConfigured: (process.env.NBA_TRACKING_SECRET || '').length >= 32,
    nbaFlagEnabled: Boolean(flag?.enabled),
    eventPlatformEnabled: Boolean(eventFlag?.enabled),
    killSwitchActive: killed.has('*') || killed.has('nba_v1') || killed.has('event_platform_v1'),
    activeEdges
  };

  return NextResponse.json({
    window: { days, since: since.toISOString() },
    metrics: recommendationMetrics(events),
    graph: { activeNextActionEdges: activeEdges },
    flag: flag ? {
      enabled: flag.enabled,
      rolloutPercent: flag.rolloutPercent,
      updatedAt: flag.updatedAt.toISOString()
    } : null,
    rollout: {
      ...rolloutSignals,
      ...recommendationRolloutReadiness(rolloutSignals)
    },
    privacy: 'Aggregates only; tracking tokens, event properties and subject identifiers are not returned.'
  });
}
