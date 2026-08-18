import type { Metadata } from 'next';
import { ArrowRight, Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getGrowthSegment, growthSegments } from '@/lib/growth/segments';
import { intentPages } from '@/lib/growth/intents';
import { SegmentJourneyLink } from '@/components/growth/segment-journey-link';
import { getViralBaseUrl } from '@/lib/viral-loop';

type Props = { params: Promise<{ segmento: string }> };

export function generateStaticParams() {
  return growthSegments.map((segment) => ({ segmento: segment.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segment = getGrowthSegment((await params).segmento);
  if (!segment) return {};
  const description =
    segment.description.length >= 70
      ? segment.description
      : `${segment.description} Encontre recursos gratuitos para concluir cada tarefa com mais agilidade.`;
  return {
    title: `${segment.name}: ferramentas e documentos gratuitos`,
    description,
    alternates: { canonical: `/para/${segment.slug}` },
    openGraph: {
      title: `${segment.name}: ferramentas e documentos gratuitos`,
      description,
      url: `/para/${segment.slug}`,
      type: 'website',
      locale: 'pt_BR',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${segment.name}: ferramentas e documentos gratuitos`,
      description,
      images: ['/opengraph-image']
    }
  };
}

export default async function SegmentPage({ params }: Props) {
  const segment = getGrowthSegment((await params).segmento);
  if (!segment) notFound();
  const relatedIntents = intentPages.filter((item) => item.segmentSlugs.includes(segment.slug));
  const base = getViralBaseUrl().replace(/\/$/, '');
  const pageUrl = `${base}/para/${segment.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `Precisou, Tá Pronto para ${segment.name}`,
        headline: segment.headline,
        description: segment.description,
        url: pageUrl,
        inLanguage: 'pt-BR',
        isPartOf: { '@type': 'WebSite', name: 'Precisou, Tá Pronto', url: base }
      },
      {
        '@type': 'ItemList',
        name: `Ferramentas para ${segment.name}`,
        itemListElement: segment.tools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.label,
          url: `${base}${tool.href}`
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base },
          { '@type': 'ListItem', position: 2, name: `Para ${segment.name}`, item: pageUrl }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Quais ferramentas o Precisou, Tá Pronto oferece para ${segment.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `A seleção para ${segment.name} reúne ${segment.tools.map((tool) => tool.label).join(', ')} e conteúdos relacionados a tarefas frequentes.`
            }
          },
          {
            '@type': 'Question',
            name: 'As ferramentas são gratuitas?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'O catálogo e as páginas educativas são públicos. Algumas funções de edição, histórico ou exportação podem solicitar uma conta gratuita.'
            }
          }
        ]
      }
    ]
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(145deg,#020617,#0f172a_50%,#064e3b)] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Precisou, Tá Pronto para {segment.name}</p>
            <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{segment.headline}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{segment.description}</p>
            <SegmentJourneyLink segment={segment.slug} destination="tool" href={segment.tools[0].href} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">
              Começar agora <ArrowRight className="h-4 w-4" />
            </SegmentJourneyLink>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="rj-display text-3xl font-extrabold text-slate-950">Ferramentas recomendadas</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {segment.tools.map((tool) => (
              <SegmentJourneyLink key={tool.href} segment={segment.slug} destination="tool" href={tool.href} className="group rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                <Check className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-4 text-xl font-bold text-slate-950">{tool.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
              </SegmentJourneyLink>
            ))}
          </div>
        </section>
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="rj-display text-3xl font-extrabold text-slate-950">Respostas para tarefas frequentes</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {relatedIntents.map((intent) => (
                <SegmentJourneyLink key={intent.slug} segment={segment.slug} destination="intent" href={`/modelos/${intent.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-300">
                  <h3 className="font-bold text-slate-950">{intent.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{intent.description}</p>
                </SegmentJourneyLink>
              ))}
            </div>
            <SegmentJourneyLink segment={segment.slug} destination="library" href={`/biblioteca?segment=${segment.slug}`} className="mt-8 inline-flex items-center gap-2 font-bold text-emerald-700">
              Ver toda a biblioteca para {segment.name} <ArrowRight className="h-4 w-4" />
            </SegmentJourneyLink>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="rj-display text-3xl font-extrabold text-slate-950">Uma jornada organizada para {segment.name}</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              ['1. Entenda', 'Consulte uma resposta objetiva, exemplos e limites antes de começar.'],
              ['2. Resolva', 'Abra a ferramenta adequada e preencha somente as informações necessárias.'],
              ['3. Reutilize', 'Salve seu contexto e descubra recursos relacionados ao seu perfil.']
            ].map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-7 text-slate-600">
            Esta curadoria é atualizada conforme novas ferramentas e dúvidas recorrentes são incorporadas ao catálogo.
            Materiais de natureza jurídica, contábil ou trabalhista têm finalidade educativa e devem ser validados por
            profissional habilitado quando a decisão envolver riscos ou particularidades do caso.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
