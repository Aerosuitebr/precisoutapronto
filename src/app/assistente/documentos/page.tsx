import type { Metadata } from 'next';
import Link from 'next/link';
import { DocumentAssistant } from '@/components/assistant/document-assistant';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getViralBaseUrl } from '@/lib/viral-loop';

const path = '/assistente/documentos';
const title = 'Assistente de documentos com IA';
const description =
  'Explique seu caso, responda perguntas guiadas e prepare contratos, currículos, recibos e propostas antes de abrir o editor.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    title: `${title} | Precisou, Tá Pronto`,
    description,
    type: 'website',
    url: path
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | Precisou, Tá Pronto`,
    description
  }
};

type Props = { searchParams: Promise<{ tipo?: string }> };

export default async function AssistantPage({ searchParams }: Props) {
  const type = (await searchParams).tipo;
  const initialType = type === 'curriculo' || type === 'recibo' || type === 'proposta' ? type : 'contrato';
  const siteUrl = getViralBaseUrl().replace(/\/$/, '');
  const pageUrl = `${siteUrl}${path}`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: pageUrl,
      inLanguage: 'pt-BR',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Precisou, Tá Pronto',
        url: siteUrl
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Assistente de documentos Precisou, Tá Pronto',
      description,
      url: pageUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Assistente de documentos', item: pageUrl }
      ]
    }
  ];

  return (
    <>
      <SiteHeader />
      <main className="min-h-[75vh] bg-[linear-gradient(145deg,#f8fafc,#ecfdf5)] px-4 py-12 sm:px-6">
        {structuredData.map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
        <div className="mx-auto mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Documento guiado</p>
          <h1 className="precisoutapronto-display mt-3 text-4xl font-extrabold text-slate-950">Conte seu caso. O assistente organiza o caminho.</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">O fluxo adiciona perguntas, sugestões e alertas antes dos geradores existentes.</p>
        </div>
        <DocumentAssistant initialType={initialType} />
        <nav aria-label="Conteúdos relacionados" className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 text-sm font-semibold">
          <Link href="/biblioteca" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
            Explorar a biblioteca
          </Link>
          <Link href="/gerador-de-contrato" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
            Gerador de contrato
          </Link>
          <Link href="/gerador-de-curriculo" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800">
            Gerador de currículo
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
