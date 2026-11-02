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
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const normalized = normalize(query);
  const suggestions = [
    { label: 'Recibo', href: '/gerador-de-recibo#ferramenta' },
    { label: 'Rescisão', href: '/calculadora-de-rescisao#ferramenta' },
    { label: 'Férias', href: '/calculadora-de-ferias#ferramenta' },
    { label: 'Orçamento de pintura', href: '/orcamento-para/pintor#montar' }
  ];
  const results = useMemo(() => {
    const tools = normalized ? rankTools(normalized) : toolsCatalog.filter((tool) => tool.status !== 'soon');
    return tools.slice(0, 5).map((tool) => ({ label: tool.name, href: destination(tool.id, tool.href) }));
  }, [normalized]);

  function go(href: string, label: string, source: 'submit' | 'suggestion') {
    trackEvent('home_search_selected', { result: label, destination: href, source });
    setOpen(false);
    router.push(href);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = results[active >= 0 ? active : 0];
    if (result) go(result.href, result.label, 'submit');
    else {
      trackEvent('home_search_no_results');
      router.push('/recursos');
    }
  }

  return (
    <div className="relative w-full max-w-3xl" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <form onSubmit={submit} role="search" aria-label="Buscar ferramenta">
        <label htmlFor="home-tool-search" className="sr-only">Qual ferramenta você procura?</label>
        <div className="flex rounded-2xl bg-white p-1.5 shadow-[0_18px_55px_-24px_rgba(3,31,75,0.32)] ring-1 ring-[#0b5cff]/25 focus-within:ring-2 focus-within:ring-[#0b5cff]">
          <Search className="ml-2 mt-3 h-5 w-5 shrink-0 text-slate-600 sm:ml-3" aria-hidden />
          <input
            id="home-tool-search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(-1); }}
            onFocus={() => setOpen(true)}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && Boolean(query.trim())}
            aria-controls="home-search-results"
            aria-activedescendant={open && active >= 0 ? `home-result-${active}` : undefined}
            onKeyDown={event => {
              if (event.key === "Escape") { setOpen(false); setActive(-1); }
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault(); setOpen(true);
                setActive(current => results.length ? (event.key === "ArrowDown" ? (current + 1) % results.length : (current <= 0 ? results.length - 1 : current - 1)) : -1);
              }
            }}
            placeholder="Ex.: calcular rescisão de diarista, emitir recibo, orçamento de pintura..."
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
      {open && query.trim() ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-2xl" id="home-search-results" role="listbox" aria-label="Ferramentas encontradas">
          {results.length ? results.map((item, index) => (
            <button key={item.href} type="button" id={`home-result-${index}`} role="option" aria-selected={active === index} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => go(item.href, item.label, 'suggestion')} className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-[#eef5ff] hover:text-[#0b5cff] ${active === index ? "bg-blue-50 text-blue-700" : ""}`}>
              {item.label}<ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )) : <p className="px-3 py-3 text-sm text-slate-600">Não encontrei uma correspondência direta. Ao buscar, você será levado ao catálogo completo.</p>}
        </div>
      ) : null}
    </div>
  );
}
