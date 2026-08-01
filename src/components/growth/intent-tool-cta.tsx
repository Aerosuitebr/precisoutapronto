'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface IntentToolCtaProps {
  href: string;
  label: string;
  intentSlug: string;
}

export function IntentToolCta({ href, label, intentSlug }: IntentToolCtaProps) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent('intent_tool_cta_clicked', {
        intent_slug: intentSlug,
        tool_path: href.split('?')[0]
      })}
      className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
