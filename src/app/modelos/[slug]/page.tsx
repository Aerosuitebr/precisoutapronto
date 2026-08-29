import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { IntentToolCta } from '@/components/growth/intent-tool-cta';
import { getIntentPage, getRelatedIntentPages, intentPages } from '@/lib/growth/intents';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { temporaryNoindexRobots } from '@/lib/seo/focus-cycle';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return intentPages.map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getIntentPage((await params).slug);
  if (!page) return {};
  const description =
    page.description.length >= 70
      ? page.description
      : `${page.description} Veja orientações práticas, perguntas frequentes e a ferramenta indicada.`;
  const url = `/modelos/${page.slug}`;
  return {
    title: page.title,
    description,
    alternates: { canonical: url },
    robots: temporaryNoindexRobots(false),
    openGraph: {
      title: page.title,
      description,
      type: 'article',
      url,
      images: [{ url: '/opengraph-image' }]
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description,
      images: ['/opengraph-image']
    }
  };
}
export default async function IntentPageRoute({ params }: Props) {
  const page = getIntentPage((await params).slug);
  if (!page) notFound();
  const base = getViralBaseUrl();
  const related = getRelatedIntentPages(page);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        description: page.description,
        url: `${base}/modelos/${page.slug}`,
        inLanguage: 'pt-BR',
        dateModified: '2026-08-01',
        isPartOf: { '@type': 'WebSite', name: 'Precisou, Tá Pronto', url: base }
      },
      {
        '@type': 'HowTo',
        name: page.title,
        description: page.description,
        inLanguage: 'pt-BR',
        step: page.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: `Passo ${index + 1}`,
          text: step
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: 'Biblioteca', item: `${base}/biblioteca` },
          { '@type': 'ListItem', position: 3, name: page.title, item: `${base}/modelos/${page.slug}` }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
      }
    ]
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main>
      <section className="bg-slate-950 text-white"><div className="mx-auto max-w-4xl px-4 py-16 sm:px-6"><nav aria-label="Navegação estrutural" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-300"><Link href="/">Início</Link><ChevronRight className="h-3.5 w-3.5" /><Link href="/biblioteca">Biblioteca</Link><ChevronRight className="h-3.5 w-3.5" /><span aria-current="page" className="truncate text-white">{page.title}</span></nav><p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Modelo + explicação + ferramenta</p><h1 className="precisoutapronto-display mt-4 text-4xl font-extrabold sm:text-5xl">{page.title}</h1><p className="mt-5 text-lg leading-8 text-slate-200">{page.description}</p><IntentToolCta href={page.toolHref} label={page.toolLabel} intentSlug={page.slug} /></div></section>
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-950">Resposta direta</h2><p className="mt-4 text-lg leading-8 text-slate-700">{page.answer}</p>
        <h2 className="mt-12 text-2xl font-extrabold text-slate-950">Como resolver</h2><ol className="mt-6 space-y-4">{page.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /><span><strong>{index + 1}.</strong> {step}</span></li>)}</ol>
        <h2 className="mt-12 text-2xl font-extrabold text-slate-950">Perguntas frequentes</h2><dl className="mt-6 space-y-4">{page.faqs.map((faq) => <div key={faq.question} className="rounded-2xl border border-slate-200 p-5"><dt className="font-bold text-slate-950">{faq.question}</dt><dd className="mt-2 leading-7 text-slate-600">{faq.answer}</dd></div>)}</dl>
        {related.length ? <section className="mt-14 border-t border-slate-200 pt-10"><h2 className="text-2xl font-extrabold text-slate-950">Conteúdos relacionados</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{related.map((item) => <Link key={item.slug} href={`/modelos/${item.slug}`} className="rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/40"><h3 className="font-bold leading-6 text-slate-950">{item.title}</h3><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Ver conteúdo <ChevronRight className="h-4 w-4" /></span></Link>)}</div></section> : null}
      </article>
    </main>
    <SiteFooter />
  </>;
}
