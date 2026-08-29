import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { CONTRACT_PROFESSION_CONTEXTS, findContractProfessionContext } from '@/lib/contratos/profession-contexts';
import { temporaryNoindexRobots } from '@/lib/seo/focus-cycle';

export function generateStaticParams() {
  return CONTRACT_PROFESSION_CONTEXTS.map((item) => ({ profissao: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ profissao: string }> }): Promise<Metadata> {
  const page = findContractProfessionContext((await params).profissao);
  if (!page) return {};
  const path = `/contrato/${page.slug}`;
  return { title: { absolute: `${page.title} | Precisou, Tá Pronto` }, description: page.description, alternates: { canonical: path }, robots: temporaryNoindexRobots(false), openGraph: { title: page.title, description: page.description, url: path } };
}

export default async function ContractProfessionPage({ params }: { params: Promise<{ profissao: string }> }) {
  const page = findContractProfessionContext((await params).profissao);
  if (!page) notFound();
  const editorHref = `/ferramentas/contratos?contexto=${page.slug}`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: page.faqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><SiteHeader /><main className="bg-slate-50"><section className="bg-[linear-gradient(145deg,#020617,#0f172a_50%,#312e81)] text-white"><div className="mx-auto max-w-5xl px-4 py-16 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Modelo contextualizado · {page.name}</p><h1 className="precisoutapronto-display mt-3 max-w-4xl text-4xl font-extrabold sm:text-5xl">{page.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{page.description}</p><Link href={editorHref} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950">Criar este contrato grátis <ArrowRight className="h-4 w-4" /></Link></div></section><section className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><h2 className="precisoutapronto-display text-3xl font-extrabold text-slate-950">O modelo já abre com uma base para revisar</h2><ul className="mt-6 grid gap-3 sm:grid-cols-3">{page.checklist.map((item) => <li key={item} className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul><div className="mt-12 grid gap-4 sm:grid-cols-2">{page.faqs.map((faq) => <article key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-950">{faq.q}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{faq.a}</p></article>)}</div><p className="mt-8 text-xs leading-5 text-slate-500">Modelo orientativo. Revise o documento conforme a negociação e procure orientação jurídica quando o risco ou a atividade exigir.</p></section></main><SiteFooter /></>;
}
