import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { hashShareToken } from './share-links';

const TOKEN = /^[A-Za-z0-9_-]{32,128}$/;

interface ResolverDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  find: (tokenHash: string) => Promise<{
    id: string; channel: string; campaign: string | null; expiresAt: Date | null;
    revokedAt: Date | null; artifact: { id: string; artifactType: string; toolKey: string; status: string };
  } | null>;
  now: () => Date;
}

const defaultDependencies: ResolverDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  find: (tokenHash) => getPrisma().shareLink.findUnique({
    where: { tokenHash },
    select: {
      id: true, channel: true, campaign: true, expiresAt: true, revokedAt: true,
      artifact: { select: { id: true, artifactType: true, toolKey: true, status: true } }
    }
  }),
  now: () => new Date()
};

export async function resolveCanonicalShareLink(
  token: string,
  dependencies: ResolverDependencies = defaultDependencies
) {
  try {
    if (!TOKEN.test(token) || !dependencies.databaseConfigured()) return null;
    const tokenHash = hashShareToken(token);
    const decision = await dependencies.decide('share_attribution_v1', tokenHash);
    if (!decision.enabled) return { enabled: false as const };
    const link = await dependencies.find(tokenHash);
    if (!link) return { enabled: true as const, unavailable: true as const };
    const now = dependencies.now();
    if (link.revokedAt || (link.expiresAt && link.expiresAt.getTime() <= now.getTime())) {
      return { enabled: true as const, unavailable: true as const };
    }
    return {
      enabled: true as const,
      unavailable: false as const,
      shareLink: {
        id: link.id,
        channel: link.channel,
        campaign: link.campaign,
        artifact: link.artifact
      }
    };
  } catch (error) {
    console.error('[distribution] share resolve failed', { error });
    return null;
  }
}
