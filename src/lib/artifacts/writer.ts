import { createHash, randomUUID } from 'node:crypto';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { parseCanonicalArtifactWrite, type CanonicalArtifactWriteInput } from './contracts';

interface CanonicalRecords {
  task: {
    id: string;
    userId?: string;
    anonymousSessionId?: string;
    toolKey: string;
    intentKey?: string;
    status: 'completed';
    completedAt: Date;
  };
  artifact: {
    id: string;
    taskId: string;
    userId?: string;
    artifactType: string;
    toolKey: string;
    payloadJson: Record<string, never>;
    summaryJson: Record<string, string | number | boolean | null>;
    status: 'active';
  };
}

interface CanonicalWriterDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  persist: (records: CanonicalRecords) => Promise<void>;
  uuid: () => string;
  ids?: (toolKey: string, legacyArtifactId: string) => { taskId: string; artifactId: string };
  now: () => Date;
}

function deterministicUuid(scope: string) {
  // Namespace técnico persistente: não é publicado nem usado como domínio.
  const bytes = createHash('sha256').update(`precisoutapronto:canonical:v1:${scope}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function canonicalShadowIds(toolKey: string, legacyArtifactId: string) {
  const source = `${toolKey}:${legacyArtifactId}`;
  return {
    taskId: deterministicUuid(`task:${source}`),
    artifactId: deterministicUuid(`artifact:${source}`)
  };
}

const defaultDependencies: CanonicalWriterDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  persist: async ({ task, artifact }) => {
    await getPrisma().$transaction([
      getPrisma().task.upsert({ where: { id: task.id }, create: task, update: {} }),
      getPrisma().artifact.upsert({ where: { id: artifact.id }, create: artifact, update: {} })
    ]);
  },
  uuid: randomUUID,
  ids: canonicalShadowIds,
  now: () => new Date()
};

/**
 * Shadow writer V1. Nunca altera o outcome principal e nunca copia o payload legado.
 */
export async function writeCanonicalArtifactShadow(
  input: CanonicalArtifactWriteInput,
  dependencies: CanonicalWriterDependencies = defaultDependencies
) {
  try {
    const parsed = parseCanonicalArtifactWrite(input);
    if (!parsed.ok || !dependencies.databaseConfigured()) return null;
    const subject = parsed.data.userId || parsed.data.anonymousSessionId;
    if (!subject) return null;
    const decision = await dependencies.decide('artifact_shadow_write_v1', subject);
    if (!decision.enabled) return null;

    const stableIds = parsed.data.legacyArtifactId
      ? dependencies.ids?.(parsed.data.toolKey, parsed.data.legacyArtifactId)
      : undefined;
    const taskId = stableIds?.taskId || dependencies.uuid();
    const artifactId = stableIds?.artifactId || dependencies.uuid();
    const completedAt = dependencies.now();
    await dependencies.persist({
      task: {
        id: taskId,
        ...(parsed.data.userId ? { userId: parsed.data.userId } : {}),
        ...(parsed.data.anonymousSessionId ? { anonymousSessionId: parsed.data.anonymousSessionId } : {}),
        toolKey: parsed.data.toolKey,
        ...(parsed.data.intentKey ? { intentKey: parsed.data.intentKey } : {}),
        status: 'completed',
        completedAt
      },
      artifact: {
        id: artifactId,
        taskId,
        ...(parsed.data.userId ? { userId: parsed.data.userId } : {}),
        artifactType: parsed.data.artifactType,
        toolKey: parsed.data.toolKey,
        payloadJson: {},
        summaryJson: {
          ...(parsed.data.summary || {}),
          ...(parsed.data.legacyArtifactId ? { legacy_artifact_id: parsed.data.legacyArtifactId } : {})
        },
        status: 'active'
      }
    });
    return { taskId, artifactId };
  } catch (error) {
    console.error('[canonical-artifacts] non-blocking shadow write failed', {
      toolKey: input.toolKey,
      error
    });
    return null;
  }
}
