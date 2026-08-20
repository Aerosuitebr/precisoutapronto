'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Heart, Share2, Sparkles, ThumbsUp } from 'lucide-react';
import { toolsCatalog } from '@/lib/tools-catalog';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const FEATURED_IDS = ['orcamentos', 'recibos', 'contratos', 'curriculo', 'pix', 'precificacao'];
const FAVORITES_KEY = 'ptp_home_favorite_tools';
const USEFUL_KEY = 'ptp_home_useful_tools';

function readIds(key: string) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function HomeToolGallery() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [useful, setUseful] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    setFavorites(readIds(FAVORITES_KEY));
    setUseful(readIds(USEFUL_KEY));
  }, []);

  const tools = useMemo(() => {
    const featured = FEATURED_IDS.map((id) => toolsCatalog.find((tool) => tool.id === id)).filter(Boolean);
    return showFavorites ? featured.filter((tool) => tool && favorites.includes(tool.id)) : featured;
  }, [favorites, showFavorites]);

  function toggleFavorite(id: string, name: string) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    trackEvent('home_tool_favorite', { tool_id: id, active: next.includes(id) });
    toast(next.includes(id) ? `${name} guardada nos favoritos.` : `${name} removida dos favoritos.`);
  }

  async function shareTool(name: string, href: string, id: string) {
    const url = new URL(href, window.location.origin).toString();
    const hasNativeShare = typeof navigator.share === 'function';
    try {
      if (hasNativeShare) await navigator.share({ title: name, text: `Encontrei esta ferramenta no Precisou? Tá Pronto!`, url });
      else await navigator.clipboard.writeText(url);
      trackEvent('home_tool_shared', { tool_id: id, method: hasNativeShare ? 'native' : 'copy' });
      if (!hasNativeShare) toast('Link da ferramenta copiado.');
    } catch {
      // Cancelar o compartilhamento nativo não é erro.
    }
  }

  function markUseful(id: string) {
    if (useful.includes(id)) return;
    const next = [...useful, id];
    setUseful(next);
    window.localStorage.setItem(USEFUL_KEY, JSON.stringify(next));
    trackEvent('home_tool_useful', { tool_id: id });
    toast('Obrigado pelo feedback!');
  }

  return (
    <section className="border-y border-[#0b5cff]/10 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]"><Sparkles className="h-4 w-4 text-[#83d600]" />Descubra e resolva</p>
            <h2 className="rj-display mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] text-[#031f4b] sm:text-5xl">Ferramentas que entregam um resultado, não mais uma tarefa.</h2>
          </div>
          <button type="button" onClick={() => setShowFavorites((value) => !value)} className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-extrabold transition', showFavorites ? 'border-[#83d600] bg-[#effbdc] text-[#315f00]' : 'border-[#0b5cff]/20 bg-white text-[#031f4b] hover:border-[#0b5cff]/50')}>
            <Heart className={cn('h-4 w-4', showFavorites && 'fill-current')} />
            {showFavorites ? 'Ver todas' : `Meus favoritos${favorites.length ? ` (${favorites.length})` : ''}`}
          </button>
        </div>

        {tools.length ? (
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => {
              if (!tool) return null;
              const Icon = tool.icon;
              const isFavorite = favorites.includes(tool.id);
              const isUseful = useful.includes(tool.id);
              return (
                <li key={tool.id} className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-[1.75rem] border border-[#0b5cff]/15 bg-[#f8faf7] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#0b5cff]/40 hover:bg-white hover:shadow-[0_24px_60px_-32px_rgba(3,31,75,0.45)]">
                  <span className={cn('absolute inset-x-0 top-0 h-1', index % 3 === 0 ? 'bg-[#83d600]' : 'bg-[#0b5cff]')} />
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#031f4b] text-white shadow-sm"><Icon className="h-6 w-6" /></span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => void shareTool(tool.name, tool.href, tool.id)} className="grid h-10 w-10 place-items-center rounded-full text-slate-400 transition hover:bg-[#eef5ff] hover:text-[#0b5cff]" aria-label={`Compartilhar ${tool.name}`}><Share2 className="h-4 w-4" /></button>
                      <button type="button" onClick={() => toggleFavorite(tool.id, tool.name)} className={cn('grid h-10 w-10 place-items-center rounded-full transition', isFavorite ? 'bg-[#effbdc] text-[#69ad00]' : 'text-slate-400 hover:bg-[#effbdc] hover:text-[#69ad00]')} aria-label={isFavorite ? `Remover ${tool.name} dos favoritos` : `Favoritar ${tool.name}`}><Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} /></button>
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-black text-[#031f4b]">{tool.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{tool.description}</p>
                  <div className="mt-6 flex items-center gap-2">
                    <Link href={tool.href} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b5cff] px-4 text-sm font-extrabold text-white transition hover:bg-[#0648c9]">{tool.actionLabel}<ArrowRight className="h-4 w-4" /></Link>
                    <button type="button" onClick={() => markUseful(tool.id)} className={cn('inline-flex h-11 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition', isUseful ? 'border-[#83d600] bg-[#effbdc] text-[#315f00]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#83d600] hover:text-[#315f00]')} aria-label={`${tool.name} foi útil`}>
                      {isUseful ? <Check className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                      Útil
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-[1.75rem] border border-dashed border-[#0b5cff]/25 bg-[#eef5ff] p-10 text-center"><Heart className="mx-auto h-7 w-7 text-[#0b5cff]" /><p className="mt-3 font-extrabold text-[#031f4b]">Você ainda não guardou nenhuma ferramenta.</p><button type="button" onClick={() => setShowFavorites(false)} className="mt-2 text-sm font-bold text-[#0b5cff]">Explorar ferramentas</button></div>
        )}
      </div>
    </section>
  );
}
