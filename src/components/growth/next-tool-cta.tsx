'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function NextToolCta({ from, to, href, title, description }: { from: string; to: string; href: string; title: string; description: string }) {
  return <Link href={href} onClick={() => trackEvent('next_tool_click', { from_tool: from, to_tool: to })} className="flex items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 transition hover:border-sky-400 hover:bg-sky-100"><span><strong className="block text-sm text-slate-950">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span></span><ArrowRight className="h-5 w-5 shrink-0 text-sky-700" /></Link>;
}
