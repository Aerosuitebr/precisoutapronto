import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { parseShareLinkCreate } from './contracts';

export function hashShareToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

interface ShareLinkDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  findOwnedArtifact: (userId: string, artifactId: string) => Promise<{ id: string; toolKey: string } | null>;
  persist: (link: Prisma.ShareLinkUncheckedCreateInput) => Promise<void>;
  uuid: () => string;
  token: () => string;
  now: () => Date;
}

const defaultDependencies: ShareLinkDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  findOwnedArtifact: (userId, artifactId) => getPrisma().artifact.findFirst({
    where: { id: artifactId, userId }, select: { id: true, toolKey: true }
  }),
  persist: async (link) => { await getPrisma().shareLink.create({ data: link }); },
  uuid: randomUUID,
  token: () => randomBytes(32).toString('base64url'),
  now: () => new Date()
};

export async function createCanonicalShareLink(
  userId: string,
  artifactId: string,
  input: unknown,
  dependencies: ShareLinkDependencies = defaultDependencies
) {
  try {
    const parsed = parseShareLinkCreate(input);
    if (!parsed.ok || !userId || !artifactId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('share_attribution_v1', userId);
    if (!decision.enabled) return { enabled: false as const };
    const artifact = await dependencies.findOwnedArtifact(userId, artifactId);
    if (!artifact) return { enabled: true as const, notFound: true as const };
    const id = dependencies.uuid();
    const token = dependencies.token();
    if (token.length < 32 || token.length > 128) return null;
    const createdAt = dependencies.now();
    const expiresAt = parsed.data.expiresInDays
      ? new Date(createdAt.getTime() + parsed.data.expiresInDays * 86_400_000)
      : null;
    await dependencies.persist({
      id,
      artifactId: artifact.id,
      tokenHash: hashShareToken(token),
      channel: parsed.data.channel,
      createdByUserId: userId,
      campaign: parsed.data.campaign || null,
      expiresAt,
      revokedAt: null,
      createdAt
    });
    return {
      enabled: true as const, notFound: false as const,
      shareLinkId: id, token, toolKey: artifact.toolKey,
      expiresAt: expiresAt?.toISOString() || null
    };
  } catch (error) {
    console.error('[distribution] share link create failed', { artifactId, error });
    return null;
  }
}

interface RevokeDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  revokeOwned: (userId: string, shareLinkId: string, revokedAt: Date) => Promise<boolean>;
  now: () => Date;
}

const defaultRevokeDependencies: RevokeDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  revokeOwned: async (userId, shareLinkId, revokedAt) => {
    const result = await getPrisma().shareLink.updateMany({
      where: { id: shareLinkId, createdByUserId: userId, revokedAt: null },
      data: { revokedAt }
    });
    return result.count === 1;
  },
  now: () => new Date()
};

export async function revokeCanonicalShareLink(
  userId: string,
  shareLinkId: string,
  dependencies: RevokeDependencies = defaultRevokeDependencies
) {
  try {
    if (!userId || !shareLinkId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('share_attribution_v1', userId);
    if (!decision.enabled) return { enabled: false as const };
    const revokedAt = dependencies.now();
    const revoked = await dependencies.revokeOwned(userId, shareLinkId, revokedAt);
    return revoked
      ? { enabled: true as const, notFound: false as const, revokedAt: revokedAt.toISOString() }
      : { enabled: true as const, notFound: true as const };
  } catch (error) {
    console.error('[distribution] share link revoke failed', { shareLinkId, error });
    return null;
  }
}
