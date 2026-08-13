'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackEvent } from '@/lib/analytics';

type Props = ComponentProps<typeof Link> & {
  landingPath: string;
  placement: 'hero_primary' | 'hero_secondary' | 'footer_primary';
};

export function LandingConversionLink({ landingPath, placement, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent('landing_cta_click', {
          landing_path: landingPath,
          destination_path: typeof props.href === 'string' ? props.href : '',
          placement
        });
        onClick?.(event);
      }}
    />
  );
}
