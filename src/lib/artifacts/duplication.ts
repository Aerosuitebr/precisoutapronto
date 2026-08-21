import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';

const PORTABLE_KEYS = new Set([
  'currency', 'locale', 'layout', 'theme', 'document_type', 'template_key',
  'tax_rate', 'discount_rate', 'validity_days', 'item_count'
]);

export function portableArtifactPayload(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (!PORTABLE_KEYS.has(key)) continue;
    if (item === null || ['number', 'boolean'].includes(typeof item)) output[key] = item as number | boolean | null;
    if (typeof item === 'string' && item.length <= 80) output[key] = item;
  }
  return output;
}

interface DuplicateDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  findOwned: (userId: string, artifactId: string) => Promise<{
    id: string; artifactType: string; toolKey: string; title: string | null;
    payloadJson: unknown; summaryJson: unknown;
  } | null>;
  persist: (input: {
    task: Prisma.TaskUncheckedCreateInput;
    artifact: Prisma.ArtifactUncheckedCreateInput;
  }) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: DuplicateDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  findOwned: (userId, artifactId) => getPrisma().artifact.findFirst({
    where: { id: artifactId, userId },
    select: { id: true, artifactType: true, toolKey: true, title: true, payloadJson: true, summaryJson: true }
  }),
  persist: ({ task, artifact }) => getPrisma().$transaction(async (tx) => {
    await tx.task.create({ data: task });
    await tx.artifact.create({ data: artifact });
  }),
  uuid: randomUUID,
  now: () => new Date()
};

export async function duplicateOwnedArtifact(
  userId: string,
  sourceArtifactId: string,
  dependencies: DuplicateDependencies = defaultDependencies
) {
  try {
    if (!userId || !sourceArtifactId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('duplicate_v1', userId);
    if (!decision.enabled) return { enabled: false as const };
    const source = await dependencies.findOwned(userId, sourceArtifactId);
    if (!source) return { enabled: true as const, notFound: true as const };
    const taskId = dependencies.uuid();
    const artifactId = dependencies.uuid();
    const now = dependencies.now();
    await dependencies.persist({
      task: {
        id: taskId,
        userId,
        toolKey: source.toolKey,
        status: 'started',
        startedAt: now,
        sourceChannel: 'duplicate',
        contextSnapshot: {},
        experimentSnapshot: {}
      },
      artifact: {
        id: artifactId,
        taskId,
        userId,
        artifactType: source.artifactType,
        toolKey: source.toolKey,
        visibility: 'private',
        title: source.title ? `Cópia de ${source.title}`.slice(0, 240) : null,
        payloadJson: portableArtifactPayload(source.payloadJson) as Prisma.InputJsonValue,
        summaryJson: portableArtifactPayload(source.summaryJson) as Prisma.InputJsonValue,
        status: 'draft',
        version: 1,
        duplicatedFromId: source.id,
        createdAt: now,
        updatedAt: now
      }
    });
    return { enabled: true as const, notFound: false as const, taskId, artifactId, toolKey: source.toolKey };
  } catch (error) {
    console.error('[canonical-artifacts] duplication failed', { sourceArtifactId, error });
    return null;
  }
}
