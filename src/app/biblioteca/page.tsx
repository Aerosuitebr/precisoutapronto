import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { guides } from '@/lib/guides';
import { intentPages } from '@/lib/growth/intents';
import { IntentLibraryBrowser } from '@/components/growth/intent-library-browser';

export const metadata: Metadata = {
  title: 'Biblioteca de documentos, trabalho e negócios',
  description: 'Respostas práticas, modelos, perguntas frequentes e ferramentas para concluir tarefas.',
  alternates: { canonical: '/biblioteca' }
};

export default function LibraryPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-sky-700"><BookOpen className="h-4 w-4" /> Central do Conhecimento</p>
            <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold text-slate-950 sm:text-5xl">Da dúvida à tarefa concluída</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Conteúdo estruturado por intenção, com respostas diretas, FAQs e a ferramenta certa para agir.</p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-950">Modelos e respostas rápidas</h2>
          <IntentLibraryBrowser items={intentPages.map(({ slug, title, description, segmentSlugs }) => ({ slug, title, description, segmentSlugs }))} />
          <h2 className="mt-14 text-2xl font-extrabold text-slate-950">Guias aprofundados</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {guides.map((guide) => <Link key={guide.slug} href={`/guias/${guide.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-300"><p className="text-xs font-bold uppercase text-sky-700">{guide.category}</p><h3 className="mt-2 font-bold text-slate-950">{guide.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p></Link>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
