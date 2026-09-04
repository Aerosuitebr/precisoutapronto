'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { emitClientProductEvent } from '@/lib/events/client-emitter';
import { BRAND_DISPLAY_NAME } from '@/lib/brand';
import type { SharedResultLine } from '@/lib/shared-results';

export function SharedResultView({
  token,
  tool,
  title,
  subtitle,
  lines,
  ctaLabel,
  ctaPath
}: {
  token: string;
  tool: string;
  title: string;
  subtitle: string | null;
  lines: SharedResultLine[];
  ctaLabel: string;
  ctaPath: string;
}) {
  useEffect(() => {
    trackEvent('shared_result_open', { tool_name: tool, result_id: token });
    emitClientProductEvent({ eventName: 'growth.share_opened', toolKey: tool, properties: { surface: 'shared_result' } });
  }, [token, tool]);

  const target = `${ctaPath}${ctaPath.includes('?') ? '&' : '?'}utm_source=shared_result&utm_medium=viral_loop&utm_campaign=create_my_own&rid=${token}`;
  return (
    <div className="mx-auto max-w-xl rounded-[30px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
      <div className="flex items-center gap-3 text-emerald-700">
        <CheckCircle2 className="h-7 w-7" />
        <p className="text-xs font-black uppercase tracking-[0.18em]">Tá pronto!</p>
      </div>
      <h1 className="precisoutapronto-display mt-4 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      <dl className="mt-6 space-y-2">
        {lines.map((line, index) => (
          <div key={`${line.label}-${index}`} className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3 ${line.emphasis ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <dt className="text-sm font-semibold">{line.label}</dt>
            <dd className="text-right text-lg font-black">{line.value}</dd>
          </div>
        ))}
      </dl>
      <Button asChild size="lg" className="mt-7 h-13 w-full bg-emerald-600 text-base hover:bg-emerald-500">
        <Link href={target} onClick={() => {
          trackEvent('shared_result_cta', { tool_name: tool, result_id: token, action: 'create_my_own' });
          emitClientProductEvent({ eventName: 'growth.recipient_action', toolKey: tool, properties: { action: 'create_my_own', surface: 'shared_result' } });
        }}>
          {ctaLabel}<ArrowRight className="h-5 w-5" />
        </Link>
      </Button>
      <p className="mt-5 text-center text-xs font-semibold text-slate-500">Criado grátis com <span className="font-black text-slate-800">{BRAND_DISPLAY_NAME}.</span></p>
    </div>
  );
}
