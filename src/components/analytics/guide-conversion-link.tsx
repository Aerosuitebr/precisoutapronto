'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { setContentAttribution, trackEvent } from '@/lib/analytics';

type Props = ComponentProps<typeof Link> & {
  guideSlug: string;
  cluster: string;
  placement: 'sidebar' | 'related' | 'index';
};

export function GuideConversionLink({ guideSlug, cluster, placement, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        setContentAttribution({ guideSource: guideSlug, contentCluster: cluster });
        trackEvent('guide_tool_click', {
          guide_slug: guideSlug,
          content_cluster: cluster,
          placement
        });
        onClick?.(event);
      }}
    />
  );
}
