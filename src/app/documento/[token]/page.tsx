import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, Sparkles } from 'lucide-react';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
type Props = { params: Promise<{ token: string }> };
async function load(token: string) {
  if (!isDatabaseConfigured()) return null;
  return getPrisma().sharedDocument.findFirst({ where: { token, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: { toolDocument: true } });
}
export async function generateMetadata({ params }: Props): Promise<Metadata> { const item = await load((await params).token); return { title: item?.title || 'Documento compartilhado', robots: { index: false, follow: false } }; }
export default async function SharedDocumentPage({ params }: Props) {
  const item = await load((await params).token); if (!item) notFound();
  const data = item.toolDocument.data as Record<string, unknown>;
  return <><SiteHeader /><main className="min-h-[70vh] bg-slate-50 px-4 py-12 sm:px-6"><div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-emerald-600" /><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Documento compartilhado</p><h1 className="text-2xl font-extrabold text-slate-950">{item.title}</h1></div></div><div className="mt-8 rounded-2xl bg-slate-50 p-5"><p className="text-sm font-bold text-slate-900">Resumo público</p><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(data).filter(([, value]) => typeof value === 'string' || typeof value === 'number').slice(0, 10).map(([key, value]) => <div key={key}><dt className="text-xs font-semibold uppercase text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 break-words text-sm text-slate-800">{String(value)}</dd></div>)}</dl></div><div className="mt-8 rounded-2xl bg-emerald-950 p-6 text-white"><Sparkles className="h-5 w-5 text-amber-300" /><h2 className="mt-3 text-xl font-bold">Crie o seu no Resolva Jato</h2><p className="mt-2 text-sm text-emerald-100">Ferramentas gratuitas para documentos, cálculos e trabalho.</p><Link href="/recursos" className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950">Conhecer ferramentas</Link></div></div></main><SiteFooter /></>;
}
