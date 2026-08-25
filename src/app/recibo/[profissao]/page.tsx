import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { RECEIPT_PROFESSION_CONTEXTS, findReceiptProfessionContext } from '@/lib/recibos/profession-contexts';
import { getViralBaseUrl } from '@/lib/viral-loop';

type Props = { params: Promise<{ profissao: string }> };

export function generateStaticParams() {
  return RECEIPT_PROFESSION_CONTEXTS.map(({ slug }) => ({ profissao: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findReceiptProfessionContext((await params).profissao);
  if (!page) return {};
  const path = `/recibo/${page.slug}`;
  return {
    title: { absolute: `${page.title} · Grátis | Precisou, Tá Pronto` },
    description: `${page.description} Grátis para começar e compatível com celular.`,
    alternates: { canonical: path },
    openGraph: { title: page.title, description: page.description, url: path, type: 'website', images: [{ url: '/gerador-de-recibo/opengraph-image' }] },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: ['/gerador-de-recibo/opengraph-image'] }
  };
}

export default async function ReceiptProfessionPage({ params }: Props) {
  const page = findReceiptProfessionContext((await params).profissao);
  if (!page) notFound();
  const path = `/recibo/${page.slug}`;
  const editorHref = `/ferramentas/recibos?modelo=${page.slug}`;
  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', name: page.title, description: page.description, url: `${base}${path}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Web' },
    { '@type': 'FAQPage', mainEntity: page.faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main className="bg-slate-50">
      <section className="bg-[linear-gradient(145deg,#020617,#0f172a_50%,#075985)] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Modelo pré-preenchido · {page.name}</p>
          <h1 className="precisoutapronto-display mt-3 max-w-4xl text-4xl font-extrabold sm:text-5xl">{page.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{page.description}</p>
          <Link href={editorHref} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">Criar recibo e baixar PDF <ArrowRight className="h-4 w-4" /></Link>
          <p className="mt-3 text-sm text-sky-100">100% grátis para começar · valor por extenso · assinatura · compatível com celular</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="precisoutapronto-display text-3xl font-extrabold text-slate-950">O modelo já abre com os campos essenciais</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">{page.checklist.map((item) => <li key={item} className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">{page.faqs.map(({ q, a }) => <article key={q} className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-950">{q}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{a}</p></article>)}</div>
        <p className="mt-8 text-sm text-slate-600">Quer começar sem um contexto específico? <Link href="/gerador-de-recibo" className="font-bold text-sky-700 hover:underline">Abra o gerador de recibo geral</Link>.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
