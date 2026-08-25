'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Search, X } from 'lucide-react';
import { growthSegments } from '@/lib/growth/segments';
import { filterLibraryIntents, normalizeLibrarySegment, type LibraryIntentItem } from '@/lib/growth/library';
import { trackEvent } from '@/lib/analytics';

export function IntentLibraryBrowser({ items }: { items: LibraryIntentItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('');
  const filtered = useMemo(
    () => filterLibraryIntents(items, query, segment),
    [items, query, segment]
  );

  useEffect(() => {
    const fromUrl = normalizeLibrarySegment(new URLSearchParams(window.location.search).get('segment'));
    if (fromUrl) {
      setSegment(fromUrl);
      localStorage.setItem('precisoutapronto-growth-segment', fromUrl);
      trackEvent('library_opened_segmented', { segment: fromUrl, source: 'url' });
      return;
    }
    const fromPreference = normalizeLibrarySegment(localStorage.getItem('precisoutapronto-growth-segment'));
    if (fromPreference) {
      setSegment(fromPreference);
      trackEvent('library_opened_segmented', { segment: fromPreference, source: 'preference' });
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const timeout = window.setTimeout(() => {
      trackEvent('library_search_used', {
        query_length: trimmed.length,
        result_count: filtered.length,
        segment: segment || 'all'
      });
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [filtered.length, query, segment]);

  function selectSegment(slug: string) {
    const normalized = normalizeLibrarySegment(slug);
    setSegment(normalized);
    if (normalized) localStorage.setItem('precisoutapronto-growth-segment', normalized);
    else localStorage.removeItem('precisoutapronto-growth-segment');
    const params = new URLSearchParams(window.location.search);
    if (normalized) params.set('segment', normalized);
    else params.delete('segment');
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    trackEvent('library_segment_filtered', { segment: normalized || 'all' });
  }

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <span className="sr-only">Buscar na biblioteca</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busque por contrato, recibo, currículo…"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por perfil">
          <button type="button" onClick={() => selectSegment('')} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${segment === '' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Todos</button>
          {growthSegments.map((item) => (
            <button key={item.slug} type="button" onClick={() => selectSegment(item.slug)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${segment === item.slug ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-600" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}
      </p>
      {filtered.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <Link key={item.slug} href={`/modelos/${item.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
              <h3 className="font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Ver resposta <ChevronRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-bold text-slate-900">Nenhum conteúdo encontrado</p>
          <p className="mt-2 text-sm text-slate-600">Tente outro termo ou visualize todos os segmentos.</p>
          <button type="button" onClick={() => { setQuery(''); selectSegment(''); }} className="mt-4 text-sm font-bold text-emerald-700">Limpar filtros</button>
        </div>
      )}
    </div>
  );
}
