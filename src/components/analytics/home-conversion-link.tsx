'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

type Props = ComponentProps<typeof Link> & {
  placement: string;
};

export function HomeConversionLink({ placement, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent('home_cta_clicked', {
          placement,
          destination: typeof props.href === 'string' ? props.href : 'internal'
        });
        onClick?.(event);
      }}
    />
  );
}
