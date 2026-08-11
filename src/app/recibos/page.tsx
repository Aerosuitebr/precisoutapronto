import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ReceiptText } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { receiptClusterPages } from '@/lib/seo/receipt-cluster';
import { getViralBaseUrl } from '@/lib/viral-loop';

export const metadata: Metadata = {
  title: { absolute: 'Modelos de Recibo Online Grátis em PDF | Resolva Jato' },
  description: 'Escolha o recibo certo para pagamento, serviço, autônomo, MEI, aluguel ou Pix. Preencha online e gere um PDF profissional.',
  alternates: { canonical: '/recibos' },
  openGraph: { title: 'Modelos de recibo online grátis', description: 'Guias, exemplos e gerador de recibo em PDF.', url: '/recibos', type: 'website' }
};

const established = [
  { href: '/gerador-de-recibo', title: 'Gerador de recibo online', text: 'Preencha, assine e baixe o PDF.' },
  { href: '/recibo-de-pagamento', title: 'Recibo de pagamento', text: 'Registre a quitação de um valor.' },
  { href: '/recibo-de-aluguel', title: 'Recibo de aluguel', text: 'Identifique imóvel, competência e locação.' },
  { href: '/guias/modelo-de-recibo-mei', title: 'Recibo para MEI', text: 'Dados, limites e diferença para nota fiscal.' }
];

export default function ReceiptHubPage() {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: 'Modelos e tipos de recibo', description: metadata.description, url: `${base}/recibos`, inLanguage: 'pt-BR' },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: base },
        { '@type': 'ListItem', position: 2, name: 'Recibos', item: `${base}/recibos` }
      ] }
    ]
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main>
      <section className="bg-slate-950 text-white"><div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Central de recibos</p>
        <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">O recibo certo para cada pagamento.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Modelos, respostas e exemplos para serviço, autônomo, MEI, aluguel, Pix e assinatura. Todos conectados ao mesmo gerador gratuito.</p>
        <Link href="/gerador-de-recibo#ferramenta" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-950">Criar recibo grátis <ArrowRight className="h-4 w-4" /></Link>
      </div></section>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="rj-display text-3xl font-extrabold text-slate-950">Comece pelas páginas principais</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">{established.map((item) => <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 p-5 hover:border-emerald-300"><ReceiptText className="h-5 w-5 text-emerald-700" /><h3 className="mt-3 font-bold text-slate-950">{item.title}</h3><p className="mt-2 text-sm text-slate-600">{item.text}</p></Link>)}</div>
        <h2 className="rj-display mt-14 text-3xl font-extrabold text-slate-950">Tipos, formatos e dúvidas sobre recibo</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">{receiptClusterPages.map((page) => <Link key={page.slug} href={`/recibos/${page.slug}`} className="group rounded-2xl border border-slate-200 p-5 transition hover:border-sky-300 hover:bg-sky-50/40"><h3 className="font-bold leading-6 text-slate-950 group-hover:text-sky-800">{page.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{page.description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-sky-700">Ver orientação <ArrowRight className="h-4 w-4" /></span></Link>)}</div>
      </section>
      <section className="border-y border-slate-200 bg-emerald-50"><div className="mx-auto max-w-5xl px-4 py-12 sm:px-6"><h2 className="rj-display text-3xl font-extrabold text-slate-950">Um único motor, vários casos reais</h2><ul className="mt-6 grid gap-3 sm:grid-cols-3">{['Valor por extenso automático','Modelos profissionais em PDF','Assinatura e histórico'].map((item) => <li key={item} className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm font-semibold text-slate-800"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{item}</li>)}</ul></div></section>
    </main>
    <SiteFooter />
  </>;
}
