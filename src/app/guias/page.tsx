import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { guides } from '@/lib/guides';
import { StrategicSeoClusters } from '@/components/marketing/strategic-seo-clusters';

export const metadata: Metadata = {
  title: 'Guias práticos para MEI, freelancers e estudantes',
  description:
    'Conteúdo direto sobre recibos, contratos, currículos, rescisão, propostas, precificação e ferramentas digitais.',
  alternates: { canonical: '/guias' },
  openGraph: {
    title: 'Guias práticos | Precisou, Tá Pronto',
    description: 'Respostas claras e ferramentas gratuitas para resolver tarefas do dia a dia.',
    url: '/guias',
    images: [{ url: '/guias/opengraph-image' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guias práticos | Precisou, Tá Pronto',
    description: 'Respostas claras e ferramentas gratuitas para resolver tarefas do dia a dia.',
    images: ['/guias/opengraph-image']
  }
};

export default function GuidesPage() {
  const businessGuides = guides.filter((guide) => guide.category === 'Cobrança e vendas').slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
              <BookOpen className="h-4 w-4" /> Guias Precisou, Tá Pronto
            </span>
            <h1 className="precisoutapronto-display mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Orçamento, cobrança e Pix para quem presta serviços
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Guias diretos para enviar orçamento, receber aprovação, cobrar pelo WhatsApp e organizar o pagamento do seu serviço.
            </p>
          </div>
        </section>
        <section className="border-b border-slate-200 bg-emerald-50/60">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Comece pelo fluxo completo</p>
                <h2 className="precisoutapronto-display mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Do orçamento ao pagamento</h2>
              </div>
              <Link href="/orcamento-com-pix" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline">
                Criar orçamento com Pix <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {businessGuides.map((guide) => (
                <Link key={guide.slug} href={`/guias/${guide.slug}`} className="rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold leading-6 text-slate-800 transition hover:border-emerald-400 hover:text-emerald-800">
                  {guide.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
        <StrategicSeoClusters />
        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {guides.map((guide) => (
            <article key={guide.slug} className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{guide.category}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{guide.readTime}</span>
              </div>
              <h2 className="mt-4 text-xl font-bold leading-7 text-slate-950">{guide.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{guide.description}</p>
              <Link href={`/guias/${guide.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sky-700">
                Ler guia <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
