import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { PUBLIC_TOOL_LANDINGS } from '@/lib/seo/public-tool-landings';
import { toolCategories, toolsCatalog } from '@/lib/tools-catalog';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { MiraFeaturedCta } from '@/components/marketing/mira-featured-cta';
import { StrategicHubs } from '@/components/marketing/strategic-hubs';

export const metadata: Metadata = {
  title: 'Ferramentas online grátis para trabalho e estudos',
  description:
    'Explore ferramentas para contratos, recibos, currículos, propostas, Pix, cálculos e organização.',
  alternates: { canonical: '/recursos' },
  openGraph: {
    title: 'Ferramentas online grátis | Precisou, Tá Pronto',
    description: 'Documentos, cálculos e recursos práticos organizados em um só lugar.',
    url: '/recursos',
    images: [{ url: '/recursos/opengraph-image' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferramentas online grátis | Precisou, Tá Pronto',
    description: 'Documentos, cálculos e recursos práticos organizados em um só lugar.',
    images: ['/recursos/opengraph-image']
  }
};

const publicLandings = PUBLIC_TOOL_LANDINGS;

export default function RecursosPage() {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const availableTools = toolsCatalog.filter((tool) => tool.status !== 'soon');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Ferramentas online grátis',
        description: metadata.description,
        url: `${base}/recursos`,
        inLanguage: 'pt-BR',
        isPartOf: { '@type': 'WebSite', name: 'Precisou, Tá Pronto', url: base }
      },
      {
        '@type': 'ItemList',
        name: 'Catálogo de ferramentas do Precisou, Tá Pronto',
        numberOfItems: availableTools.length,
        itemListElement: availableTools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.name,
          url: `${base}${publicLandings[tool.id] || tool.href}`
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base },
          { '@type': 'ListItem', position: 2, name: 'Ferramentas', item: `${base}/recursos` }
        ]
      }
    ]
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Catálogo público</p>
            <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Encontre a ferramenta certa para resolver agora
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Conheça cada recurso sem cadastro. Use as ferramentas livremente; a conta só aparece depois de duas gerações.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-slate-700">
              <span className="rounded-full bg-sky-50 px-4 py-2">{availableTools.length} ferramentas disponíveis</span>
              <span className="rounded-full bg-emerald-50 px-4 py-2">{toolCategories.length} categorias práticas</span>
              <span className="rounded-full bg-amber-50 px-4 py-2">Uso direto no navegador</span>
            </div>
          </div>
        </header>
        <StrategicHubs compact />
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
          <MiraFeaturedCta compact />

          {toolCategories.map((category) => {
            const items = toolsCatalog.filter((tool) => tool.categoryId === category.id && tool.status !== 'soon');
            return (
              <section key={category.id} aria-labelledby={`category-${category.id}`}>
                <div className="flex items-center gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${category.iconClass}`}>
                    <category.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 id={`category-${category.id}`} className="text-xl font-bold text-slate-950">{category.shortLabel}</h2>
                    <p className="text-sm text-slate-500">{category.description}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((tool) => {
                    const publicHref = publicLandings[tool.id];
                    return (
                      <article key={tool.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <tool.icon className="h-6 w-6 text-sky-700" aria-hidden />
                        <h3 className="mt-4 text-lg font-bold text-slate-950">{tool.name}</h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{tool.description}</p>
                        {publicHref ? (
                          <Link href={publicHref} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700">
                            Conhecer e experimentar <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <Link href={tool.href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700">
                            Usar grátis <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <section aria-labelledby="calculadoras-clt" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 id="calculadoras-clt" className="text-xl font-bold text-slate-950">
              Calculadoras CLT
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Estimativas educativas de férias, 13º e rescisão, sem cadastro nas páginas públicas.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/calculadora-de-rescisao" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-slate-50">
                Rescisão CLT com FGTS
              </Link>
              <Link href="/calculadora-de-ferias" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-slate-50">
                Férias CLT
              </Link>
              <Link href="/calculadora-de-decimo-terceiro" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-slate-50">
                13º salário
              </Link>
              <Link href="/mei-ou-clt" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-slate-50">
                Comparar MEI ou CLT
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
