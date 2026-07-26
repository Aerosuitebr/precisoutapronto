import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { guides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Guias práticos para MEI, freelancers e estudantes',
  description:
    'Conteúdo direto sobre recibos, contratos, currículos, rescisão, propostas, precificação e ferramentas digitais.',
  alternates: { canonical: '/guias' },
  openGraph: {
    title: 'Guias práticos | Resolva Jato',
    description: 'Respostas claras e ferramentas gratuitas para resolver tarefas do dia a dia.',
    url: '/guias',
    images: [{ url: '/guias/opengraph-image' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guias práticos | Resolva Jato',
    description: 'Respostas claras e ferramentas gratuitas para resolver tarefas do dia a dia.',
    images: ['/guias/opengraph-image']
  }
};

export default function GuidesPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
              <BookOpen className="h-4 w-4" /> Guias Resolva Jato
            </span>
            <h1 className="rj-display mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Respostas práticas para trabalhar com mais segurança
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Conteúdo objetivo, exemplos e ferramentas para transformar uma dúvida em uma tarefa concluída.
            </p>
          </div>
        </section>
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
