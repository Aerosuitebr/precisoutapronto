import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { TESTIMONIAL_CONSENT_VERSION } from './contracts';

export async function getApprovedStories(toolKeys: string[], limit?: number) {
  if (!isDatabaseConfigured()) return [];

  return getPrisma().testimonialSubmission.findMany({
    where: {
      status: 'approved',
      reviewedAt: { not: null },
      consentVersion: TESTIMONIAL_CONSENT_VERSION,
      toolKey: { in: toolKeys }
    },
    orderBy: { reviewedAt: 'desc' },
    take: limit,
    select: { id: true, publicName: true, profession: true, quote: true }
  }).catch(() => []);
}
