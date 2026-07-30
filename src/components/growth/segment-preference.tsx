'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Settings2 } from 'lucide-react';
import { growthSegments } from '@/lib/growth/segments';
import { trackEvent } from '@/lib/analytics';

const STORAGE_KEY = 'rj-growth-segment';

export function SegmentPreference() {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const localSegment = localStorage.getItem(STORAGE_KEY) || '';
    setSelected(localSegment);

    const controller = new AbortController();
    void fetch('/api/profile', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ profile?: { segment?: string | null } | null }>;
      })
      .then((data) => {
        const profileSegment = data?.profile?.segment || '';
        if (!profileSegment || !growthSegments.some((segment) => segment.slug === profileSegment)) return;
        setSelected(profileSegment);
        localStorage.setItem(STORAGE_KEY, profileSegment);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  function choose(slug: string) {
    setSelected(slug);
    localStorage.setItem(STORAGE_KEY, slug);
    trackEvent('growth_segment_selected', { segment: slug });
    void fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segment: slug })
    }).catch(() => undefined);
  }

  const active = growthSegments.find((segment) => segment.slug === selected);

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <Settings2 className="h-4 w-4" /> Sua área, suas prioridades
            </p>
            <h2 className="rj-display mt-3 text-3xl font-extrabold text-slate-950">
              {active ? `Atalhos para ${active.name}` : 'O que você precisa resolver?'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Escolha seu perfil para personalizar esta página. Você pode mudar quando quiser.
            </p>
          </div>
          {active ? <Link href={`/para/${active.slug}`} className="text-sm font-bold text-emerald-700">Ver central completa →</Link> : null}
        </div>
        <div className="mt-7 flex gap-3 overflow-x-auto pb-2">
          {growthSegments.map((segment) => (
            <button
              key={segment.slug}
              type="button"
              onClick={() => choose(segment.slug)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selected === segment.slug ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
              }`}
            >
              {selected === segment.slug ? <Check className="h-4 w-4" /> : <segment.icon className="h-4 w-4" />}
              {segment.name}
            </button>
          ))}
        </div>
        {active ? (
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {active.tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
                <p className="font-bold text-slate-950">{tool.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
