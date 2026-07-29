import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getIntentPage, intentPages } from '@/lib/growth/intents';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return intentPages.map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getIntentPage((await params).slug);
  return page ? { title: page.title, description: page.description, alternates: { canonical: `/modelos/${page.slug}` } } : {};
}
export default async function IntentPageRoute({ params }: Props) {
  const page = getIntentPage((await params).slug);
  if (!page) notFound();
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: page.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main>
      <section className="bg-slate-950 text-white"><div className="mx-auto max-w-4xl px-4 py-16 sm:px-6"><p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Modelo + explicação + ferramenta</p><h1 className="rj-display mt-4 text-4xl font-extrabold sm:text-5xl">{page.title}</h1><p className="mt-5 text-lg leading-8 text-slate-200">{page.description}</p><Link href={page.toolHref} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950">{page.toolLabel}<ArrowRight className="h-4 w-4" /></Link></div></section>
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-950">Resposta direta</h2><p className="mt-4 text-lg leading-8 text-slate-700">{page.answer}</p>
        <h2 className="mt-12 text-2xl font-extrabold text-slate-950">Como resolver</h2><ol className="mt-6 space-y-4">{page.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /><span><strong>{index + 1}.</strong> {step}</span></li>)}</ol>
        <h2 className="mt-12 text-2xl font-extrabold text-slate-950">Perguntas frequentes</h2><dl className="mt-6 space-y-4">{page.faqs.map((faq) => <div key={faq.question} className="rounded-2xl border border-slate-200 p-5"><dt className="font-bold text-slate-950">{faq.question}</dt><dd className="mt-2 leading-7 text-slate-600">{faq.answer}</dd></div>)}</dl>
      </article>
    </main>
    <SiteFooter />
  </>;
}
