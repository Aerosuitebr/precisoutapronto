import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import type { OrphanPublicLanding } from '@/lib/seo/orphan-tool-landings';
import { getViralBaseUrl } from '@/lib/viral-loop';

export function OrphanToolLandingPage({
  landing,
  children
}: {
  landing: OrphanPublicLanding;
  children: ReactNode;
}) {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: landing.toolName,
        url: `${base}${landing.path}`,
        applicationCategory: landing.applicationCategory,
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        description: landing.metaDescription,
        inLanguage: 'pt-BR',
        isPartOf: { '@type': 'WebSite', name: 'Precisou, Tá Pronto', url: base }
      },
      {
        '@type': 'HowTo',
        name: landing.howToTitle,
        step: landing.howToSteps.map((text, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text
        }))
      },
      {
        '@type': 'FAQPage',
        mainEntity: landing.faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base },
          { '@type': 'ListItem', position: 2, name: 'Ferramentas', item: `${base}/recursos` },
          {
            '@type': 'ListItem',
            position: 3,
            name: landing.toolName,
            item: `${base}${landing.path}`
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="bg-[image:var(--precisoutapronto-page-bg)]">
        <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-700">
              Início
            </Link>
            <span className="mx-1.5" aria-hidden>
              /
            </span>
            <Link href="/recursos" className="hover:text-slate-700">
              Ferramentas
            </Link>
            <span className="mx-1.5" aria-hidden>
              /
            </span>
            <span className="font-semibold text-slate-700">{landing.toolName}</span>
          </nav>

          <header className="mb-6 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
              Precisou, Tá Pronto · {landing.toolName}
            </p>
            <h1 className="precisoutapronto-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {landing.h1}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">{landing.subtitle}</p>
          </header>

          <div id="ferramenta" className="scroll-mt-20">
            {children}
          </div>

          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">{landing.howToTitle}</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
              {landing.howToSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h2 className="mt-8 text-xl font-bold text-slate-950">Perguntas frequentes</h2>
            <dl className="mt-4 space-y-4">
              {landing.faqs.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-slate-500">
              Também útil:{' '}
              {landing.related.map((item, index) => (
                <span key={item.href}>
                  {index > 0 ? ' · ' : null}
                  <Link href={item.href} className="font-semibold text-sky-700 hover:underline">
                    {item.label}
                  </Link>
                </span>
              ))}
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
