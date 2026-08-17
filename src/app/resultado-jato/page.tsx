import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { PublicResultActions } from '@/components/growth/public-result-actions';

type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined, fallback: string, limit = 100) {
  return (Array.isArray(value) ? value[0] : value || fallback).slice(0, limit);
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const search = await searchParams;
  const title = one(search.titulo, 'Resultado Jato compartilhado');
  const label = one(search.rotulo, 'Resultado');
  const value = one(search.valor, 'Confira o resultado');
  const imageParams = new URLSearchParams({ titulo: title, rotulo: label, valor: value });
  const description = `${label}: ${value}. Veja o resumo e crie o seu gratuitamente no Resolva Jato.`;
  return {
    title: { absolute: `${title} | Resolva Jato` },
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, type: 'website', images: [{ url: `/api/og/resultado?${imageParams.toString()}`, width: 1200, height: 630, alt: `${title}: ${value}` }] },
    twitter: { card: 'summary_large_image', title, description, images: [`/api/og/resultado?${imageParams.toString()}`] }
  };
}

export default async function PublicResultPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  const title = one(search.titulo, 'Resultado compartilhado');
  const label = one(search.rotulo, 'Resultado');
  const value = one(search.valor, '—');
  const rawTool = one(search.ferramenta, '/', 240);
  const toolPath = rawTool.startsWith('/') && !rawTool.startsWith('//') ? rawTool : '/';
  const campaign = one(search.utm_campaign, 'resultado_jato', 100);
  let lines: Array<{ label: string; value: string }> = [];
  try {
    const parsed = JSON.parse(one(search.linhas, '[]', 1800)) as Array<{ label?: unknown; value?: unknown }>;
    if (Array.isArray(parsed)) lines = parsed.slice(0, 5).map((line) => ({ label: String(line.label || '').slice(0, 60), value: String(line.value || '').slice(0, 60) }));
  } catch {}

  return <><SiteHeader /><main className="min-h-[70vh] bg-[linear-gradient(160deg,#020617,#082f49_55%,#0c4a6e)] px-4 py-14 text-white"><div className="mx-auto max-w-2xl"><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-sky-300"><Sparkles className="h-4 w-4" />Resultado Jato</div><section className="mt-5 rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur sm:p-8"><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{title}</h1>{lines.length ? <dl className="mt-7 divide-y divide-white/10 rounded-2xl bg-slate-950/35 px-5">{lines.map((line, index) => <div key={`${line.label}-${index}`} className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-slate-300">{line.label}</dt><dd className="text-right font-bold">{line.value}</dd></div>)}</dl> : null}<div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-5"><span className="text-sm font-semibold text-slate-300">{label}</span><strong className="rj-display text-2xl text-emerald-300">{value}</strong></div><p className="mt-6 text-center text-xs text-slate-300">Resultado compartilhado por alguém usando o Resolva Jato.</p></section><PublicResultActions title={title} value={value} toolPath={toolPath} campaign={campaign} /></div></main><SiteFooter /></>;
}
