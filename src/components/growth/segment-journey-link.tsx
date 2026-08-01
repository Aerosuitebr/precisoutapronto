'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackEvent } from '@/lib/analytics';

interface SegmentJourneyLinkProps extends ComponentProps<typeof Link> {
  segment: string;
  destination: 'tool' | 'intent' | 'library';
}

export function SegmentJourneyLink({
  segment,
  destination,
  onClick,
  ...props
}: SegmentJourneyLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent('segment_journey_clicked', { segment, destination });
        onClick?.(event);
      }}
    />
  );
}
