import type { Metadata } from 'next';
import Link from 'next/link';
import { RedacaoEnemApp } from '@/components/redacao-enem/redacao-enem-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { getViralBaseUrl } from '@/lib/viral-loop';

const PATH = '/corretor-de-redacao-enem';
const SITE_URL = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Corretor de Redação ENEM Grátis por Competência',
  description:
    'Cole sua redação e receba estimativa de nota por competência (C1 a C5), pontos fortes e alertas. Duas análises livres sem cadastro.',
  keywords: [
    'corretor de redação enem',
    'corrigir redação enem grátis',
    'nota redação enem',
    'competências enem redação',
    'análise de redação online'
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Corretor de redação ENEM grátis | Resolva Jato',
    description: 'Estimativa de nota por competência, com pontos fortes e alertas de revisão.',
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: `${PATH}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corretor de redação ENEM grátis | Resolva Jato',
    description: 'Estimativa de nota por competência, com pontos fortes e alertas de revisão.',
    images: [`${PATH}/opengraph-image`]
  }
};

const faqs = [
  {
    q: 'O corretor de redação ENEM é gratuito?',
    a: 'Sim. Você pode analisar duas redações sem cadastro. Depois, a conta grátis libera continuidade e histórico.'
  },
  {
    q: 'A nota substitui a correção oficial?',
    a: 'Não. É uma estimativa automática para treino. Use como guia de revisão, não como resultado definitivo do ENEM.'
  },
  {
    q: 'O que o corretor avalia?',
    a: 'Estrutura, tese, argumentação, coesão e proposta de intervenção, alinhadas às competências C1 a C5.'
  }
];

export default function CorretorDeRedacaoEnemPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Corretor de redação ENEM',
        url: `${SITE_URL}${PATH}`,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        description: metadata.description,
        inLanguage: 'pt-BR',
        isPartOf: { '@type': 'WebSite', name: 'Resolva Jato', url: SITE_URL }
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Ferramentas', item: `${SITE_URL}/recursos` },
          { '@type': 'ListItem', position: 3, name: 'Corretor de redação ENEM', item: `${SITE_URL}${PATH}` }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="bg-[image:var(--rj-page-bg)]">
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
            <span className="font-semibold text-slate-700">Corretor de redação ENEM</span>
          </nav>
          <RedacaoEnemApp />
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Como usar o corretor de redação ENEM</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>Cole o tema (opcional) e o texto completo da redação.</li>
              <li>Clique em analisar para ver a estimativa por competência.</li>
              <li>Revise pontos fortes e alertas antes de reescrever trechos fracos.</li>
              <li>Treine com novos temas; a conta grátis guarda o histórico depois das duas análises livres.</li>
            </ol>
            <h2 className="mt-8 text-xl font-bold text-slate-950">Perguntas frequentes</h2>
            <dl className="mt-4 space-y-4">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-slate-500">
              Também útil:{' '}
              <Link href="/redacao-enem" className="font-semibold text-sky-700 hover:underline">
                central de redação ENEM
              </Link>
              {' · '}
              <Link href="/gerador-de-curriculo" className="font-semibold text-sky-700 hover:underline">
                gerador de currículo
              </Link>
              {' · '}
              <Link href="/para/estudantes" className="font-semibold text-sky-700 hover:underline">
                ferramentas para estudantes
              </Link>
              {' · '}
              <Link href="/recursos" className="font-semibold text-sky-700 hover:underline">
                catálogo completo
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
