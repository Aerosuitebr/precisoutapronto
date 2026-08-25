import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import type { PdfTaskLanding } from '@/lib/seo/pdf-task-landings';
import { getViralBaseUrl } from '@/lib/viral-loop';

export function PdfTaskLandingPage({ landing, children }: { landing: PdfTaskLanding; children: ReactNode }) {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const toolsPath = landing.locale === 'pt-BR' ? '/recursos' : `/${landing.locale}/tools`;
  const labels = landing.locale === 'en'
    ? { home: 'Home', tools: 'Tools', how: 'How it works', faq: 'Frequently asked questions' }
    : landing.locale === 'es'
      ? { home: 'Inicio', tools: 'Herramientas', how: 'Cómo funciona', faq: 'Preguntas frecuentes' }
      : { home: 'Início', tools: 'Ferramentas', how: 'Como funciona', faq: 'Perguntas frequentes' };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: landing.h1, url: `${base}${landing.path}`, description: landing.description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: landing.locale === 'pt-BR' ? 'BRL' : 'USD' }, inLanguage: landing.locale },
      { '@type': 'HowTo', name: landing.h1, step: landing.steps.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, text })) },
      { '@type': 'FAQPage', mainEntity: landing.faqs.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }
    ]
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main className="bg-[image:var(--precisoutapronto-page-bg)]">
      <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500">
          <Link href={landing.locale === 'pt-BR' ? '/' : `/${landing.locale}`}>{labels.home}</Link><span className="mx-1.5">/</span>
          <Link href={toolsPath}>{labels.tools}</Link><span className="mx-1.5">/</span><span>{landing.h1}</span>
        </nav>
        <header className="mb-6 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{landing.eyebrow || 'Precisou, Tá Pronto · PDF'}</p>
          <h1 className="precisoutapronto-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{landing.h1}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">{landing.subtitle}</p>
        </header>
        <div id="tool" className="scroll-mt-20">{children}</div>
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-950">{labels.how}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">{landing.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <h2 className="mt-8 text-xl font-bold text-slate-950">{labels.faq}</h2>
          <dl className="mt-4 space-y-4">{landing.faqs.map((item) => <div key={item.q}><dt className="font-semibold text-slate-900">{item.q}</dt><dd className="mt-1 text-sm leading-6 text-slate-600">{item.a}</dd></div>)}</dl>
          {landing.locale === 'pt-BR' ? (
            <p className="mt-8 rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700">
              Precisa fazer outra tarefa com o arquivo? Veja a{' '}
              <Link href="/pdf" className="font-bold text-sky-700 hover:underline">
                central de ferramentas para PDF
              </Link>{' '}
              para juntar, dividir, comprimir e editar documentos.
            </p>
          ) : null}
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
