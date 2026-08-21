import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { portableArtifactPayload } from '@/lib/artifacts/duplication';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { parsePersonalTemplateCreate } from './contracts';

interface TemplateDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  findOwned: (userId: string, artifactId: string) => Promise<{
    id: string; toolKey: string; payloadJson: unknown;
  } | null>;
  persist: (template: Prisma.PersonalTemplateUncheckedCreateInput) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: TemplateDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  findOwned: (userId, artifactId) => getPrisma().artifact.findFirst({
    where: { id: artifactId, userId },
    select: { id: true, toolKey: true, payloadJson: true }
  }),
  persist: async (template) => { await getPrisma().personalTemplate.create({ data: template }); },
  uuid: randomUUID,
  now: () => new Date()
};

export async function createPersonalTemplate(
  ownerUserId: string,
  input: unknown,
  dependencies: TemplateDependencies = defaultDependencies
) {
  try {
    const parsed = parsePersonalTemplateCreate(input);
    if (!parsed.ok || !ownerUserId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('personal_templates_v1', ownerUserId);
    if (!decision.enabled) return { enabled: false as const };
    const source = await dependencies.findOwned(ownerUserId, parsed.data.sourceArtifactId);
    if (!source) return { enabled: true as const, notFound: true as const };
    const id = dependencies.uuid();
    const now = dependencies.now();
    await dependencies.persist({
      id,
      ownerUserId,
      sourceArtifactId: source.id,
      toolKey: source.toolKey,
      name: parsed.data.name,
      templatePayload: portableArtifactPayload(source.payloadJson) as Prisma.InputJsonValue,
      visibility: 'private',
      status: 'active',
      createdAt: now,
      updatedAt: now
    });
    return { enabled: true as const, notFound: false as const, template: { id, name: parsed.data.name, toolKey: source.toolKey } };
  } catch (error) {
    console.error('[personal-templates] create failed', { error });
    return null;
  }
}

interface InstantiateDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  findOwned: (ownerUserId: string, templateId: string) => Promise<{
    id: string; toolKey: string; name: string; templatePayload: unknown;
    sourceArtifact: { artifactType: string };
  } | null>;
  persist: (input: {
    task: Prisma.TaskUncheckedCreateInput;
    artifact: Prisma.ArtifactUncheckedCreateInput;
  }) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultInstantiateDependencies: InstantiateDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  findOwned: (ownerUserId, templateId) => getPrisma().personalTemplate.findFirst({
    where: { id: templateId, ownerUserId, status: 'active', visibility: 'private' },
    select: {
      id: true, toolKey: true, name: true, templatePayload: true,
      sourceArtifact: { select: { artifactType: true } }
    }
  }),
  persist: ({ task, artifact }) => getPrisma().$transaction(async (tx) => {
    await tx.task.create({ data: task });
    await tx.artifact.create({ data: artifact });
  }),
  uuid: randomUUID,
  now: () => new Date()
};

export async function instantiatePersonalTemplate(
  ownerUserId: string,
  templateId: string,
  dependencies: InstantiateDependencies = defaultInstantiateDependencies
) {
  try {
    if (!ownerUserId || !templateId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('personal_templates_v1', ownerUserId);
    if (!decision.enabled) return { enabled: false as const };
    const template = await dependencies.findOwned(ownerUserId, templateId);
    if (!template) return { enabled: true as const, notFound: true as const };
    const taskId = dependencies.uuid();
    const artifactId = dependencies.uuid();
    const now = dependencies.now();
    await dependencies.persist({
      task: {
        id: taskId, userId: ownerUserId, toolKey: template.toolKey,
        status: 'started', startedAt: now, sourceChannel: 'personal_template',
        contextSnapshot: {}, experimentSnapshot: {}
      },
      artifact: {
        id: artifactId, taskId, userId: ownerUserId,
        artifactType: template.sourceArtifact.artifactType,
        toolKey: template.toolKey, visibility: 'private', title: template.name,
        payloadJson: portableArtifactPayload(template.templatePayload) as Prisma.InputJsonValue,
        summaryJson: {}, status: 'draft', version: 1, templateId: template.id,
        createdAt: now, updatedAt: now
      }
    });
    return {
      enabled: true as const, notFound: false as const,
      taskId, artifactId, toolKey: template.toolKey, templateId: template.id
    };
  } catch (error) {
    console.error('[personal-templates] instantiate failed', { templateId, error });
    return null;
  }
}

interface ArchiveTemplateDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  archiveOwned: (ownerUserId: string, templateId: string, updatedAt: Date) => Promise<boolean>;
  now: () => Date;
}

const defaultArchiveDependencies: ArchiveTemplateDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  archiveOwned: async (ownerUserId, templateId, updatedAt) => {
    const result = await getPrisma().personalTemplate.updateMany({
      where: { id: templateId, ownerUserId, visibility: 'private', status: 'active' },
      data: { status: 'archived', updatedAt }
    });
    return result.count === 1;
  },
  now: () => new Date()
};

export async function archivePersonalTemplate(
  ownerUserId: string,
  templateId: string,
  dependencies: ArchiveTemplateDependencies = defaultArchiveDependencies
) {
  try {
    if (!ownerUserId || !templateId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('personal_templates_v1', ownerUserId);
    if (!decision.enabled) return { enabled: false as const };
    const archivedAt = dependencies.now();
    const archived = await dependencies.archiveOwned(ownerUserId, templateId, archivedAt);
    return archived
      ? { enabled: true as const, notFound: false as const, archivedAt: archivedAt.toISOString() }
      : { enabled: true as const, notFound: true as const };
  } catch (error) {
    console.error('[personal-templates] archive failed', { templateId, error });
    return null;
  }
}

interface RestoreTemplateDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  restoreOwned: (ownerUserId: string, templateId: string, updatedAt: Date) => Promise<boolean>;
  now: () => Date;
}

const defaultRestoreDependencies: RestoreTemplateDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  restoreOwned: async (ownerUserId, templateId, updatedAt) => {
    const result = await getPrisma().personalTemplate.updateMany({
      where: { id: templateId, ownerUserId, visibility: 'private', status: 'archived' },
      data: { status: 'active', updatedAt }
    });
    return result.count === 1;
  },
  now: () => new Date()
};

export async function restorePersonalTemplate(
  ownerUserId: string,
  templateId: string,
  dependencies: RestoreTemplateDependencies = defaultRestoreDependencies
) {
  try {
    if (!ownerUserId || !templateId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('personal_templates_v1', ownerUserId);
    if (!decision.enabled) return { enabled: false as const };
    const restoredAt = dependencies.now();
    const restored = await dependencies.restoreOwned(ownerUserId, templateId, restoredAt);
    return restored
      ? { enabled: true as const, notFound: false as const, restoredAt: restoredAt.toISOString() }
      : { enabled: true as const, notFound: true as const };
  } catch (error) {
    console.error('[personal-templates] restore failed', { templateId, error });
    return null;
  }
}
