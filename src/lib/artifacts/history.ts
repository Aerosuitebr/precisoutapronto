import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';

export const CANONICAL_HISTORY_LIMITS = [10, 20, 50] as const;

export function canonicalHistoryLimit(value: string | null) {
  const requested = Number(value || 20);
  return CANONICAL_HISTORY_LIMITS.includes(requested as 10 | 20 | 50) ? requested : 20;
}

interface HistoryDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  find: (userId: string, limit: number) => Promise<Array<{
    id: string;
    artifactType: string;
    toolKey: string;
    publicId: string | null;
    visibility: string;
    title: string | null;
    summaryJson: unknown;
    status: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    task: { id: string; status: string; completedAt: Date | null };
  }>>;
}

const defaultDependencies: HistoryDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  find: (userId, limit) => getPrisma().artifact.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      artifactType: true,
      toolKey: true,
      publicId: true,
      visibility: true,
      title: true,
      summaryJson: true,
      status: true,
      version: true,
      createdAt: true,
      updatedAt: true,
      task: { select: { id: true, status: true, completedAt: true } }
    }
  })
};

export async function listCanonicalHistory(
  userId: string,
  limit: number,
  dependencies: HistoryDependencies = defaultDependencies
) {
  if (!userId || !dependencies.databaseConfigured()) return { enabled: false, items: [] };
  try {
    const decision = await dependencies.decide('smart_history_v1', userId);
    if (!decision.enabled) return { enabled: false, items: [] };
    const items = await dependencies.find(userId, limit);
    return { enabled: true, items };
  } catch (error) {
    console.error('[canonical-artifacts] history read failed', { error });
    return { enabled: false, items: [] };
  }
}
