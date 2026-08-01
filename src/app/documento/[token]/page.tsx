import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { isSharedDocumentAvailable } from '@/lib/shared-documents';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SharedDocumentCta } from '@/components/growth/shared-document-cta';
type Props = { params: Promise<{ token: string }> };
async function load(token: string) {
  if (!isDatabaseConfigured()) return null;
  const item = await getPrisma().sharedDocument.findUnique({
    where: { token },
    include: { toolDocument: true }
  });
  return item && isSharedDocumentAvailable(item) ? item : null;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> { const item = await load((await params).token); return { title: item?.title || 'Documento compartilhado', robots: { index: false, follow: false } }; }
export default async function SharedDocumentPage({ params }: Props) {
  const item = await load((await params).token); if (!item) notFound();
  const viewedAt = new Date();
  await getPrisma().sharedDocument.updateMany({
    where: {
      id: item.id,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: viewedAt } }]
    },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: viewedAt
    }
  });
  const data = item.toolDocument.data as Record<string, unknown>;
  return <><SiteHeader /><main className="min-h-[70vh] bg-slate-50 px-4 py-12 sm:px-6"><div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-emerald-600" /><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Documento compartilhado</p><h1 className="text-2xl font-extrabold text-slate-950">{item.title}</h1></div></div><div className="mt-8 rounded-2xl bg-slate-50 p-5"><p className="text-sm font-bold text-slate-900">Resumo público</p><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(data).filter(([, value]) => typeof value === 'string' || typeof value === 'number').slice(0, 10).map(([key, value]) => <div key={key}><dt className="text-xs font-semibold uppercase text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 break-words text-sm text-slate-800">{String(value)}</dd></div>)}</dl></div><SharedDocumentCta toolId={item.toolDocument.toolId} /></div></main><SiteFooter /></>;
}
