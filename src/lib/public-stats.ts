import { getPrisma, isDatabaseConfigured } from '@/lib/db';

export interface PublicStats {
  orcamentosToday: number;
  orcamentosWeek: number;
  orcamentosApprovedWeek: number;
  usersTotal: number;
  docsGeneratedApprox: number;
  updatedAt: string;
}

function publicBucket(value: number, minimum: number, step: number) {
  if (!Number.isFinite(value) || value < minimum) return 0;
  return Math.floor(value / step) * step;
}

/** Evita publicar contagens pequenas ou precisão que permita inferir atividade individual. */
export function sanitizePublicStats(stats: PublicStats): PublicStats {
  return {
    ...stats,
    orcamentosToday: publicBucket(stats.orcamentosToday, 10, 5),
    orcamentosWeek: publicBucket(stats.orcamentosWeek, 20, 10),
    orcamentosApprovedWeek: publicBucket(stats.orcamentosApprovedWeek, 10, 5),
    usersTotal: publicBucket(stats.usersTotal, 50, 50),
    docsGeneratedApprox: publicBucket(stats.docsGeneratedApprox, 100, 100)
  };
}

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysAgoUtc(days: number) {
  const d = startOfUtcDay();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export async function getPublicStats(): Promise<PublicStats> {
  const empty: PublicStats = {
    orcamentosToday: 0,
    orcamentosWeek: 0,
    orcamentosApprovedWeek: 0,
    usersTotal: 0,
    docsGeneratedApprox: 0,
    updatedAt: new Date().toISOString()
  };

  if (!isDatabaseConfigured()) return empty;

  try {
    const prisma = getPrisma();
    const today = startOfUtcDay();
    const week = daysAgoUtc(7);

    const [orcamentosToday, orcamentosWeek, orcamentosApprovedWeek, usersTotal, usageAgg] =
      await Promise.all([
        prisma.orcamento.count({ where: { createdAt: { gte: today } } }),
        prisma.orcamento.count({ where: { createdAt: { gte: week } } }),
        prisma.orcamento.count({
          where: { status: 'approved', updatedAt: { gte: week } }
        }),
        prisma.user.count(),
        prisma.toolUsage.aggregate({ _sum: { totalConsumed: true } })
      ]);

    return sanitizePublicStats({
      orcamentosToday,
      orcamentosWeek,
      orcamentosApprovedWeek,
      usersTotal,
      docsGeneratedApprox: usageAgg._sum.totalConsumed || 0,
      updatedAt: new Date().toISOString()
    });
  } catch {
    return empty;
  }
}
