import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { OrcamentosApp } from '@/components/orcamentos/orcamentos-app';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { PROFESSION_LANDINGS, findProfessionLanding } from '@/lib/orcamentos/profession-presets';
import { getViralBaseUrl } from '@/lib/viral-loop';

export function generateStaticParams() {
  return PROFESSION_LANDINGS.map((item) => ({ profissao: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ profissao: string }> }): Promise<Metadata> {
  const { profissao } = await params;
  const page = findProfessionLanding(profissao);
  if (!page) return {};
  const path = `/orcamento-para/${page.slug}`;
  return {
    title: { absolute: `${page.title} | Precisou, Tá Pronto` },
    description: page.description,
    alternates: { canonical: path },
    openGraph: { title: page.title, description: page.description, url: path, type: 'website' }
  };
}

export default async function ProfessionQuotePage({ params }: { params: Promise<{ profissao: string }> }) {
  const { profissao } = await params;
  const page = findProfessionLanding(profissao);
  if (!page) notFound();
  const path = `/orcamento-para/${page.slug}`;
  const site = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: page.title, description: page.description, url: `${site}${path}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Web' },
      { '@type': 'FAQPage', mainEntity: page.faqs.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main className="bg-slate-50">
          <section className="bg-[linear-gradient(145deg,#020617,#0f172a_50%,#064e3b)] text-white">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Modelo para {page.name}</p>
              <h1 className="rj-display mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{page.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{page.description}</p>
              <ul className="mt-6 grid max-w-3xl gap-2 text-sm sm:grid-cols-3">
                {page.checklist.map((item) => <li key={item} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-amber-300" />{item}</li>)}
              </ul>
              <a href="#montar" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">Usar este modelo grátis <ArrowRight className="h-4 w-4" /></a>
              <p className="mt-3 text-sm text-emerald-100">Sem cadastro para começar · aprovação pelo cliente · Pix no mesmo fluxo</p>
            </div>
          </section>
          <section id="montar" className="scroll-mt-20 border-b border-slate-200">
            <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
              <div className="mx-auto mb-5 max-w-6xl rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><strong>Modelo carregado:</strong> {page.promise} Revise itens, quantidades e valores antes de enviar.</div>
              <OrcamentosApp publicAccess preset={page.preset} />
            </div>
          </section>
          <section className="bg-white">
            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
              <h2 className="rj-display text-3xl font-extrabold text-slate-950">Dúvidas de {page.name.toLowerCase()}</h2>
              <dl className="mt-7 grid gap-4 sm:grid-cols-2">{page.faqs.map((item) => <div key={item.q} className="rounded-2xl border border-slate-200 p-5"><dt className="font-bold text-slate-900">{item.q}</dt><dd className="mt-2 text-sm leading-6 text-slate-600">{item.a}</dd></div>)}</dl>
              <p className="mt-8 text-sm text-slate-600">Precisa de outro formato? <Link href="/orcamento-com-pix" className="font-bold text-emerald-700 hover:underline">Abra o gerador geral de orçamento com Pix</Link>.</p>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
