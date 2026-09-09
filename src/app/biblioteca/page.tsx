import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { guides } from '@/lib/guides';
import { intentPages } from '@/lib/growth/intents';
import { IntentLibraryBrowser } from '@/components/growth/intent-library-browser';
import { isSeoFocusPath } from '@/lib/seo/focus-cycle';
import { StrategicSeoClusters } from '@/components/marketing/strategic-seo-clusters';
import { getViralBaseUrl } from '@/lib/viral-loop';

export const metadata: Metadata = {
  title: 'Biblioteca de orçamento, cobrança e recibos',
  description: 'Modelos e guias para prestadores: prepare orçamentos, combine o pagamento, cobre pelo WhatsApp e emita recibos.',
  alternates: { canonical: '/biblioteca' },
  openGraph: {
    title: 'Biblioteca de orçamento, cobrança e recibos | Precisou, Tá Pronto',
    description: 'Modelos e guias para prestadores: prepare orçamentos, combine o pagamento, cobre pelo WhatsApp e emita recibos.',
    url: '/biblioteca',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biblioteca | Precisou, Tá Pronto',
    description: 'Respostas práticas, modelos e ferramentas para concluir tarefas.'
  }
};

export default function LibraryPage() {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Biblioteca Precisou, Tá Pronto',
        headline: 'Orçamento, cobrança e recibos para quem presta serviços',
        description: metadata.description,
        url: `${base}/biblioteca`,
        inLanguage: 'pt-BR',
        dateModified: '2026-09-09',
        publisher: { '@type': 'Organization', name: 'Precisou, Tá Pronto', url: base }
      },
      {
        '@type': 'ItemList',
        name: 'Guias e modelos da biblioteca',
        numberOfItems: guides.length + intentPages.length,
        itemListElement: [
          ...intentPages.map((item) => ({ name: item.title, url: `${base}/modelos/${item.slug}` })),
          ...guides.map((guide) => ({ name: guide.title, url: `${base}/guias/${guide.slug}` }))
        ].map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base },
          { '@type': 'ListItem', position: 2, name: 'Biblioteca', item: `${base}/biblioteca` }
        ]
      }
    ]
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-sky-700"><BookOpen className="h-4 w-4" /> Central do Conhecimento</p>
            <h1 className="precisoutapronto-display mt-4 max-w-3xl text-4xl font-extrabold text-slate-950 sm:text-5xl">Do orçamento ao recibo</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Prepare seu orçamento, combine prazos, cobre pelo WhatsApp e registre o pagamento. Comece pelos guias para MEI, autônomos e prestadores de serviço.</p>
            <p className="mt-4 text-sm font-semibold text-slate-500">
              {intentPages.length} respostas por intenção e {guides.length} guias aprofundados, revisados para conectar explicação e ação.
            </p>
          </div>
        </section>
        <StrategicSeoClusters />
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                href: '/orcamento-com-pix',
                label: 'Orçamento pelo WhatsApp',
                text: 'Monte os itens, envie o link e receba a aprovação do cliente.'
              },
              {
                href: '/gerador-de-qr-code-pix',
                label: 'Cobrança com Pix',
                text: 'Prepare o QR Code e o Pix Copia e Cola para compartilhar com o cliente.'
              },
              {
                href: '/gerador-de-recibo',
                label: 'Gerador de recibo',
                text: 'Valor por extenso, assinatura e PDF para enviar agora.'
              }
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-sky-300"
              >
                <p className="font-bold text-slate-950">{tool.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.text}</p>
              </Link>
            ))}
          </div>
          <div className="mb-12 flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">Precisa de ajuda para começar?</p>
              <h2 className="mt-2 text-2xl font-extrabold">Conte seu caso ao Assistente de documentos</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Responda perguntas guiadas e chegue ao gerador certo com as informações organizadas.</p>
            </div>
            <Link href="/assistente/documentos" className="shrink-0 rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-emerald-300">
              Abrir Assistente
            </Link>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950">Guias para o próximo serviço</h2>
          <div className="my-6 grid gap-4 md:grid-cols-3">
            {guides.filter((guide) => isSeoFocusPath(`/guias/${guide.slug}`)).map((guide) => (
              <Link key={guide.slug} href={`/guias/${guide.slug}`} className="rounded-2xl border border-emerald-200 bg-white p-5 hover:border-emerald-400">
                <h3 className="font-bold text-slate-950">{guide.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p>
              </Link>
            ))}
          </div>
          <h2 className="mt-12 text-2xl font-extrabold text-slate-950">Todos os modelos e respostas rápidas</h2>
          <IntentLibraryBrowser items={intentPages.map(({ slug, title, description, segmentSlugs }) => ({ slug, title, description, segmentSlugs }))} />
          <h2 className="mt-14 text-2xl font-extrabold text-slate-950">Guias aprofundados</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {guides.map((guide) => <Link key={guide.slug} href={`/guias/${guide.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-300"><p className="text-xs font-bold uppercase text-sky-700">{guide.category}</p><h3 className="mt-2 font-bold text-slate-950">{guide.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p></Link>)}
          </div>
          <aside className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600">
            <h2 className="text-xl font-extrabold text-slate-950">Como produzimos este conteúdo</h2>
            <p className="mt-3">
              Cada material responde a uma tarefa específica, apresenta limites e conduz a uma ferramenta relacionada.
              Conteúdos jurídicos, trabalhistas e contábeis são educativos, recebem revisão editorial e não substituem
              a avaliação de um profissional habilitado para o caso concreto.
            </p>
            <Link href="/sobre" className="mt-4 inline-flex font-bold text-sky-700">Conheça o Precisou, Tá Pronto e nossos critérios editoriais</Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
