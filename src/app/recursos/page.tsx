import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { toolCategories, toolsCatalog } from '@/lib/tools-catalog';

export const metadata: Metadata = {
  title: 'Ferramentas online grátis para trabalho e estudos',
  description:
    'Explore ferramentas para contratos, recibos, currículos, propostas, Pix, cálculos e organização.',
  alternates: { canonical: '/recursos' },
  openGraph: {
    title: 'Ferramentas online grátis | Resolva Jato',
    description: 'Documentos, cálculos e recursos práticos organizados em um só lugar.',
    url: '/recursos',
    images: [{ url: '/recursos/opengraph-image' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferramentas online grátis | Resolva Jato',
    description: 'Documentos, cálculos e recursos práticos organizados em um só lugar.',
    images: ['/recursos/opengraph-image']
  }
};

const publicLandings: Record<string, string> = {
  contratos: '/gerador-de-contrato',
  recibos: '/gerador-de-recibo',
  curriculo: '/gerador-de-curriculo',
  propostas: '/gerador-de-proposta-comercial',
  orcamentos: '/orcamento-com-pix',
  juridicos: '/documentos-juridicos-online',
  contabeis: '/documentos-contabeis-online',
  rescisao: '/calculadora-de-rescisao',
  precificacao: '/calculadora-de-preco-freelancer',
  'mei-vs-clt': '/mei-ou-clt'
};

export default function RecursosPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Catálogo público</p>
            <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Encontre a ferramenta certa para resolver agora
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Conheça cada recurso sem cadastro. Para editar, salvar ou exportar, algumas ferramentas pedem uma conta gratuita.
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
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
                          <Link href={`/login?next=${encodeURIComponent(tool.href)}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                            <LockKeyhole className="h-4 w-4" /> Usar com conta grátis
                          </Link>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
