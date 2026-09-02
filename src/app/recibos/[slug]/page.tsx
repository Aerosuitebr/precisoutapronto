import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { getReceiptClusterPage, receiptClusterPages } from '@/lib/seo/receipt-cluster';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { BRAND_AUTHOR_PATH } from '@/lib/brand';
import { LiveStatsBar } from '@/components/marketing/live-stats-bar';
import { isSeoFocusPath, temporaryNoindexRobots } from '@/lib/seo/focus-cycle';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return receiptClusterPages.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getReceiptClusterPage((await params).slug);
  if (!page) return {};
  const url = `/recibos/${page.slug}`;
  return { title: { absolute: `${page.title} | Precisou, Tá Pronto` }, description: page.description, alternates: { canonical: url }, robots: temporaryNoindexRobots(isSeoFocusPath(url)), openGraph: { title: page.title, description: page.description, url, type: 'article', images: [{ url: '/gerador-de-recibo/opengraph-image' }] }, twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: ['/gerador-de-recibo/opengraph-image'] } };
}

export default async function ReceiptClusterRoute({ params }: Props) {
  const page = getReceiptClusterPage((await params).slug);
  if (!page) notFound();
  const base = getViralBaseUrl().replace(/\/$/, '');
  const related = page.related.map(getReceiptClusterPage).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: page.title, description: page.description, inLanguage: 'pt-BR', datePublished: '2026-08-10', dateModified: '2026-08-31', mainEntityOfPage: `${base}/recibos/${page.slug}`, author: { '@type': 'Organization', name: 'Equipe editorial Precisou, Tá Pronto', url: `${base}${BRAND_AUTHOR_PATH}` }, publisher: { '@type': 'Organization', name: 'Precisou, Tá Pronto', url: base } },
    { '@type': 'HowTo', name: page.title, step: page.steps.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, name: `Passo ${index + 1}`, text })) },
    { '@type': 'FAQPage', mainEntity: page.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: base },
      { '@type': 'ListItem', position: 2, name: 'Recibos', item: `${base}/recibos` },
      { '@type': 'ListItem', position: 3, name: page.title, item: `${base}/recibos/${page.slug}` }
    ] }
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main>
      <article>
        <header className="border-b border-slate-200 bg-slate-50"><div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-slate-500"><Link href="/">Início</Link><ChevronRight className="h-3 w-3" /><Link href="/recibos">Recibos</Link><ChevronRight className="h-3 w-3" /><span aria-current="page">{page.eyebrow}</span></nav>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">{page.eyebrow}</p><h1 className="precisoutapronto-display mt-3 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">{page.title}</h1><p className="mt-5 text-lg leading-8 text-slate-600">{page.description}</p>
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Resposta direta</p><p className="mt-2 leading-7 text-slate-800">{page.answer}</p></div>
          <LandingConversionLink href="/gerador-de-recibo#ferramenta" landingPath={`/recibos/${page.slug}`} placement="hero_primary" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">{page.slug === 'recibo-pagamento-pix' ? 'Gerar recibo de Pix grátis' : 'Gerar este recibo grátis'} <ArrowRight className="h-4 w-4" /></LandingConversionLink>
        </div></header>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <section><h2 className="precisoutapronto-display text-2xl font-bold text-slate-950">O que não pode faltar</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{page.fields.map((field) => <li key={field} className="flex gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />{field}</li>)}</ul></section>
          <section className="mt-12"><h2 className="precisoutapronto-display text-2xl font-bold text-slate-950">Como fazer</h2><ol className="mt-5 space-y-3">{page.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-xl border border-slate-200 p-4"><strong className="text-emerald-700">{index + 1}.</strong><span>{step}</span></li>)}</ol></section>
          {page.sections.map((section) => <section key={section.title} className="mt-12"><h2 className="precisoutapronto-display text-2xl font-bold text-slate-950">{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-slate-700">{paragraph}</p>)}</section>)}
          <section className="mt-12 overflow-hidden rounded-3xl border border-amber-200 bg-amber-50"><div className="border-b border-amber-200 px-6 py-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Modelo final preenchido</p><p className="mt-1 text-xs text-amber-900/70">Exemplo fictício para demonstrar os campos; revise o alcance da quitação antes de usar.</p></div><div className="bg-white p-6 sm:p-8"><p className="text-center text-xl font-black uppercase tracking-[0.18em] text-slate-950">Recibo</p>{page.example.map((line) => <p key={line} className="mt-3 border-b border-dashed border-slate-200 pb-3 text-sm leading-6 text-slate-700">{line}</p>)}<div className="mt-8 border-t border-slate-400 pt-2 text-center text-xs text-slate-500">Assinatura de quem recebeu</div></div></section>
          <section className="mt-12"><h2 className="precisoutapronto-display text-2xl font-bold text-slate-950">Perguntas frequentes</h2><div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200">{page.faqs.map((faq) => <div key={faq.question} className="p-5"><h3 className="font-bold text-slate-950">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p></div>)}</div></section>
          {page.slug === 'recibo-pagamento-pix' ? (
            <section className="mt-12 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <h2 className="precisoutapronto-display text-2xl font-bold text-slate-950">Gere o recibo do Pix agora</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">O comprovante da transferência não explica o que foi quitado. Preencha o gerador e baixe o PDF grátis, sem cadastro.</p>
              <LandingConversionLink href="/gerador-de-recibo#ferramenta" landingPath={`/recibos/${page.slug}`} placement="inline_primary" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Gerar recibo de Pix grátis <ArrowRight className="h-4 w-4" /></LandingConversionLink>
            </section>
          ) : null}
          <section className="mt-12 border-t border-slate-200 pt-10"><h2 className="precisoutapronto-display text-2xl font-bold text-slate-950">Outros recibos e orientações</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{related.map((item) => <Link key={item.slug} href={`/recibos/${item.slug}`} className="rounded-2xl border border-slate-200 p-4 text-sm font-bold leading-6 text-slate-800 hover:border-emerald-300">{item.title}</Link>)}</div><p className="mt-6 text-sm text-slate-600">Veja também <Link href="/recibo-de-pagamento" className="font-bold text-sky-700">recibo de pagamento</Link>, <Link href="/recibo-de-aluguel" className="font-bold text-sky-700">recibo de aluguel online para imprimir</Link>, <Link href="/contrato-de-aluguel" className="font-bold text-sky-700">contrato de aluguel</Link> e <Link href="/guias/modelo-de-recibo-mei" className="font-bold text-sky-700">recibo para MEI</Link>.</p></section>
          <aside className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600"><strong className="text-slate-900">Proveniência e metodologia.</strong> Este exemplo foi preenchido e conferido no gerador de recibos. Os indicadores abaixo são calculados a partir de registros agregados do produto e arredondados em blocos; métricas abaixo do mínimo de privacidade não são publicadas.<LiveStatsBar className="mt-5" /><p className="mt-5">Atualizado em <time dateTime="2026-08-31">31 de agosto de 2026</time> · Responsável: <Link href={BRAND_AUTHOR_PATH} className="font-bold text-emerald-700 hover:underline">Equipe editorial Precisou, Tá Pronto</Link> · <Link href="/criterios-editoriais" className="font-bold text-emerald-700 hover:underline">critérios de pesquisa e revisão</Link>. Revisão editorial interna não equivale a parecer jurídico, fiscal ou contábil.</p></aside>
        </div>
      </article>
    </main>
    <SiteFooter />
  </>;
}
