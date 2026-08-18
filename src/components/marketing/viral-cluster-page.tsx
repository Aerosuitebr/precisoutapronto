import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Laptop, ShieldCheck, Zap } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import type { ViralCluster } from '@/lib/seo/viral-clusters';
import { getViralBaseUrl } from '@/lib/viral-loop';

export function viralClusterMetadata(cluster: ViralCluster): Metadata {
  return { title: { absolute: `${cluster.title} | Precisou, Tá Pronto` }, description: cluster.description, alternates: { canonical: cluster.path }, openGraph: { title: cluster.title, description: cluster.description, url: cluster.path, type: 'website', images: [{ url: '/opengraph-image' }] } };
}

export function ViralClusterPage({ cluster }: { cluster: ViralCluster }) {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', name: cluster.title, description: cluster.description, url: `${base}${cluster.path}`, inLanguage: 'pt-BR' },
    { '@type': 'FAQPage', mainEntity: cluster.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: base }, { '@type': 'ListItem', position: 2, name: cluster.eyebrow, item: `${base}${cluster.path}` }] }
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><SiteHeader /><main>
    <section className="bg-slate-950 text-white"><div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20"><nav className="flex items-center gap-1 text-xs text-slate-400"><Link href="/">Início</Link><ChevronRight className="h-3 w-3" />{cluster.eyebrow}</nav><p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">{cluster.eyebrow}</p><h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">{cluster.h1}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{cluster.answer}</p><Link href={cluster.primary.href} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-950">{cluster.primary.label}<ArrowRight className="h-4 w-4" /></Link></div></section>
    {cluster.path === '/pdf' ? <section className="border-b border-sky-100 bg-sky-50"><div className="mx-auto grid max-w-5xl gap-3 px-4 py-6 sm:grid-cols-3 sm:px-6">{[
      [ShieldCheck, 'Sem upload', 'Seus arquivos não são enviados ao Precisou, Tá Pronto.'],
      [Laptop, 'Processamento local', 'A tarefa roda no navegador do seu dispositivo.'],
      [Zap, 'Sem espera de servidor', 'Comece a editar assim que o arquivo abrir.']
    ].map(([Icon, title, text]) => { const TrustIcon = Icon as typeof ShieldCheck; return <div key={String(title)} className="flex gap-3 rounded-2xl border border-sky-100 bg-white p-4"><TrustIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden /><div><p className="font-bold text-slate-950">{String(title)}</p><p className="mt-1 text-xs leading-5 text-slate-600">{String(text)}</p></div></div>; })}</div></section> : null}
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><h2 className="rj-display text-3xl font-extrabold text-slate-950">Escolha pela sua intenção</h2><div className="mt-7 grid gap-4 sm:grid-cols-2">{cluster.resources.map((resource) => <Link key={resource.href} href={resource.href} className="group rounded-2xl border border-slate-200 p-5 hover:border-emerald-300"><p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">{resource.intent}</p><h3 className="mt-2 text-lg font-bold text-slate-950 group-hover:text-emerald-800">{resource.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{resource.description}</p></Link>)}</div>
    {cluster.sections.map((section) => <section key={section.title} className="mt-12"><h2 className="rj-display text-2xl font-bold text-slate-950">{section.title}</h2><p className="mt-4 max-w-3xl leading-8 text-slate-700">{section.body}</p></section>)}
    <section className="mt-12"><h2 className="rj-display text-2xl font-bold text-slate-950">Perguntas frequentes</h2><div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200">{cluster.faqs.map((faq) => <div key={faq.question} className="p-5"><h3 className="font-bold text-slate-950">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p></div>)}</div></section></section>
  </main><SiteFooter /></>;
}
