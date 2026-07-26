import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight, Clock } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { getGuide, guides } from '@/lib/guides';
import { getViralBaseUrl } from '@/lib/viral-loop';

type Props = { params: Promise<{ slug: string }> };
const PUBLISHED_AT = '2026-07-26';

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guias/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      url: `/guias/${guide.slug}`,
      images: [{ url: `/guias/${guide.slug}/opengraph-image` }]
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      images: [`/guias/${guide.slug}/opengraph-image`]
    }
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        inLanguage: 'pt-BR',
        datePublished: PUBLISHED_AT,
        dateModified: PUBLISHED_AT,
        mainEntityOfPage: `${base}/guias/${guide.slug}`,
        author: { '@type': 'Organization', name: 'Resolva Jato', url: base },
        publisher: {
          '@type': 'Organization',
          name: 'Resolva Jato',
          url: base,
          logo: { '@type': 'ImageObject', url: `${base}/icon-512.png` }
        }
      },
      {
        '@type': 'HowTo',
        name: guide.title,
        description: guide.description,
        inLanguage: 'pt-BR',
        totalTime: `PT${Number.parseInt(guide.readTime, 10) || 6}M`,
        step: guide.sections.map((section, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: section.title,
          text: [section.paragraphs.join(' '), ...(section.bullets ?? [])].filter(Boolean).join(' ')
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base },
          { '@type': 'ListItem', position: 2, name: 'Guias', item: `${base}/guias` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: `${base}/guias/${guide.slug}` }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer }
        }))
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="bg-white">
        <article>
          <header className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                <Link href="/">Início</Link><ChevronRight className="h-3 w-3" />
                <Link href="/guias">Guias</Link><ChevronRight className="h-3 w-3" />
                <span aria-current="page">{guide.category}</span>
              </nav>
              <div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-sky-700">
                {guide.category}<span className="h-1 w-1 rounded-full bg-slate-300" /><Clock className="h-3.5 w-3.5" />{guide.readTime}
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Publicado e revisado pela equipe Resolva Jato em 26 de julho de 2026.
              </p>
              <h1 className="rj-display mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">{guide.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{guide.description}</p>
              <div className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Resposta direta</p>
                <p className="mt-2 text-base font-medium leading-7 text-slate-800">{guide.answer}</p>
              </div>
            </div>
          </header>
          <div className="mx-auto grid max-w-4xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_15rem]">
            <div className="space-y-12">
              {guide.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="rj-display text-2xl font-bold text-slate-950">{section.title}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-base leading-8 text-slate-700">{paragraph}</p>)}
                  {section.bullets ? <ul className="mt-5 space-y-2">{section.bullets.map((item) => <li key={item} className="flex gap-3 text-sm text-slate-700"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{item}</li>)}</ul> : null}
                </section>
              ))}
              <section>
                <h2 className="rj-display text-2xl font-bold text-slate-950">Perguntas frequentes</h2>
                <div className="mt-5 divide-y divide-slate-200 rounded-3xl border border-slate-200">
                  {guide.faq.map((item) => <div key={item.question} className="p-5"><h3 className="font-bold text-slate-900">{item.question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p></div>)}
                </div>
              </section>
            </div>
            <aside>
              <div className="sticky top-6 rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">Coloque em prática</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">Use a ferramenta relacionada para começar com uma estrutura organizada.</p>
                <Link href={guide.toolHref} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">
                  {guide.toolLabel}<ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
