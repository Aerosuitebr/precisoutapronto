'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { rankTools, toolsCatalog } from '@/lib/tools-catalog';
import { publicLandingForToolId, toPublicToolHref } from '@/lib/seo/public-tool-landings';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function destination(toolId: string, href: string) {
  return publicLandingForToolId(toolId) || toPublicToolHref(href);
}

export function HomeQuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const normalized = normalize(query);
  const suggestions = useMemo(() => toolsCatalog
    .filter((tool) => tool.status !== 'soon')
    .slice(0, 4)
    .map((tool) => ({ label: tool.name, href: destination(tool.id, tool.href) })), []);
  const results = useMemo(() => {
    const tools = normalized ? rankTools(normalized) : toolsCatalog.filter((tool) => tool.status !== 'soon');
    return tools.slice(0, 5).map((tool) => ({ label: tool.name, href: destination(tool.id, tool.href) }));
  }, [normalized]);

  function go(href: string, label: string, source: 'submit' | 'suggestion') {
    trackEvent('home_search_selected', { query: normalized, result: label, destination: href, source });
    router.push(href);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (results[0]) go(results[0].href, results[0].label, 'submit');
    else {
      trackEvent('home_search_no_results', { query: normalized });
      router.push('/recursos');
    }
  }

  return (
    <div className="relative w-full max-w-3xl">
      <form onSubmit={submit} role="search" aria-label="Buscar ferramenta">
        <label htmlFor="home-tool-search" className="sr-only">Qual ferramenta você procura?</label>
        <div className="flex rounded-2xl bg-white p-1.5 shadow-[0_18px_55px_-24px_rgba(3,31,75,0.32)] ring-1 ring-[#0b5cff]/25 focus-within:ring-2 focus-within:ring-[#0b5cff]">
          <Search className="ml-2 mt-3 h-5 w-5 shrink-0 text-slate-600 sm:ml-3" aria-hidden />
          <input
            id="home-tool-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: calcular férias, criar recibo, corrigir redação..."
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base font-medium text-slate-950 outline-none placeholder:text-slate-600 sm:px-3"
          />
          <button type="submit" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-[#0b5cff] px-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0648c9] hover:shadow-md active:translate-y-0 sm:px-5" aria-label="Buscar">
            <span className="hidden sm:inline">Encontrar</span>
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="mr-1 font-semibold">Experimente:</span>
        {suggestions.map((item) => (
          <button key={item.href} type="button" onClick={() => go(item.href, item.label, 'suggestion')} className="min-h-11 rounded-full border border-[#0b5cff]/20 bg-white px-4 py-2 font-bold text-[#031f4b] transition hover:border-[#0b5cff]/50 hover:bg-[#eef5ff] hover:text-[#0b5cff] sm:min-h-0 sm:px-3 sm:py-1.5">
            {item.label}
          </button>
        ))}
      </div>
      {query ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-2xl" role="listbox" aria-label="Ferramentas encontradas">
          {results.length ? results.map((item) => (
            <button key={item.href} type="button" role="option" aria-selected="false" onClick={() => go(item.href, item.label, 'suggestion')} className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-[#eef5ff] hover:text-[#0b5cff]">
              {item.label}<ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )) : <p className="px-3 py-3 text-sm text-slate-600">Não encontrei uma correspondência direta. Ao buscar, você será levado ao catálogo completo.</p>}
        </div>
      ) : null}
    </div>
  );
}
