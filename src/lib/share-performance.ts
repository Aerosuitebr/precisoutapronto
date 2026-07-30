export interface SharePerformanceLink {
  title: string;
  viewCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
}

export type SharedLinkStatus = 'active' | 'expired' | 'revoked';

export function getSharedLinkStatus(link: SharePerformanceLink, now = Date.now()): SharedLinkStatus {
  if (link.revokedAt) return 'revoked';
  if (!link.expiresAt) return 'active';
  const expiresAt = Date.parse(link.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > now ? 'active' : 'expired';
}

export function isActiveSharedLink(link: SharePerformanceLink, now = Date.now()) {
  return getSharedLinkStatus(link, now) === 'active';
}

export function getSharedLinkExpiry(link: Pick<SharePerformanceLink, 'expiresAt'>, now = Date.now()) {
  if (!link.expiresAt) {
    return { daysRemaining: null, label: 'Sem expiração', expiringSoon: false };
  }
  const expiresAt = Date.parse(link.expiresAt);
  if (!Number.isFinite(expiresAt)) {
    return { daysRemaining: 0, label: 'Validade indisponível', expiringSoon: true };
  }
  const daysRemaining = Math.max(0, Math.ceil((expiresAt - now) / 86_400_000));
  return {
    daysRemaining,
    label: daysRemaining === 1 ? 'Expira em 1 dia' : `Expira em ${daysRemaining} dias`,
    expiringSoon: daysRemaining <= 7
  };
}

export function summarizeSharePerformance(
  links: SharePerformanceLink[],
  now = Date.now()
) {
  const normalized = links.map((link) => ({
    ...link,
    viewCount: Math.max(0, Math.trunc(Number.isFinite(link.viewCount) ? link.viewCount : 0))
  }));
  const topLink = normalized.reduce<(typeof normalized)[number] | null>(
    (current, link) => !current || link.viewCount > current.viewCount ? link : current,
    null
  );
  return {
    activeLinks: normalized.filter((link) => isActiveSharedLink(link, now)).length,
    totalLinks: normalized.length,
    totalViews: normalized.reduce((sum, link) => sum + link.viewCount, 0),
    viewedLinks: normalized.filter((link) => link.viewCount > 0).length,
    topLink: topLink && topLink.viewCount > 0
      ? { title: topLink.title, viewCount: topLink.viewCount }
      : null
  };
}
