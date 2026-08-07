'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function GuideViewTracker({ guideSlug, cluster }: { guideSlug: string; cluster: string }) {
  useEffect(() => {
    trackEvent('guide_view', { guide_slug: guideSlug, content_cluster: cluster });
  }, [cluster, guideSlug]);
  return null;
}
