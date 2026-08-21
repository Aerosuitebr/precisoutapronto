import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  artifactObservabilityDays,
  artifactRolloutReadiness,
  artifactShadowMetrics
} from '@/lib/artifacts/observability';

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

  const days = artifactObservabilityDays(new URL(request.url).searchParams.get('days'));
  const since = new Date(Date.now() - days * 86_400_000);
  const prisma = getPrisma();
  const [legacyCreated, tasksCreated, artifactsCreated, tasksWithoutArtifact, flag] = await Promise.all([
    prisma.orcamento.count({ where: { createdAt: { gte: since } } }),
    prisma.task.count({ where: { startedAt: { gte: since }, toolKey: 'orcamentos' } }),
    prisma.artifact.count({ where: { createdAt: { gte: since }, toolKey: 'orcamentos', artifactType: 'quote' } }),
    prisma.task.count({
      where: { startedAt: { gte: since }, toolKey: 'orcamentos', artifacts: { none: {} } }
    }),
    prisma.featureFlag.findMany({
      where: { key: { in: ['artifact_shadow_write_v1', 'smart_history_v1'] } },
      select: { key: true, enabled: true, rolloutPercent: true, updatedAt: true }
    })
  ]);
  const metrics = artifactShadowMetrics({
    legacyCreated,
    tasksCreated,
    artifactsCreated,
    tasksWithoutArtifact
  });
  const killed = new Set((process.env.FEATURE_KILL_SWITCHES || '').split(',').map((item) => item.trim()).filter(Boolean));
  const writeFlag = flag.find((item) => item.key === 'artifact_shadow_write_v1') || null;
  const readFlag = flag.find((item) => item.key === 'smart_history_v1') || null;
  const rolloutSignals = {
    writeFlagEnabled: Boolean(writeFlag?.enabled),
    killSwitchActive: killed.has('*') || killed.has('artifact_shadow_write_v1'),
    tasksWithoutArtifact: metrics.tasksWithoutArtifact,
    taskArtifactDelta: metrics.taskArtifactDelta
  };

  return NextResponse.json({
    window: { days, since: since.toISOString() },
    pilot: { toolKey: 'orcamentos', artifactType: 'quote' },
    metrics,
    flags: {
      shadowWrite: writeFlag ? {
        enabled: writeFlag.enabled,
        rolloutPercent: writeFlag.rolloutPercent,
        updatedAt: writeFlag.updatedAt.toISOString()
      } : null,
      smartHistoryRead: readFlag ? {
        enabled: readFlag.enabled,
        rolloutPercent: readFlag.rolloutPercent,
        updatedAt: readFlag.updatedAt.toISOString()
      } : null
    },
    rollout: { ...rolloutSignals, ...artifactRolloutReadiness(rolloutSignals) },
    privacy: 'Aggregates only; payloads, summaries and subject identifiers are not returned.'
  });
}
