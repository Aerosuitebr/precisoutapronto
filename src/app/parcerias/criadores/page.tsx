import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, BriefcaseBusiness, MessageCircle, ShieldCheck } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { BRAND_EMAIL, BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Parcerias para criadores de conteúdo MEI',
  description: `Parcerias do ${BRAND_NAME} para microcriadores que ajudam MEIs, autônomos e profissionais de serviços.`,
  alternates: { canonical: '/parcerias/criadores' }
};

const subject = encodeURIComponent('Parceria creator — Precisou, Tá Pronto');
const body = encodeURIComponent(`Olá, equipe!\n\nNome / canal:\nPerfil público:\nProfissão ou tema:\nTamanho aproximado da audiência:\nFormato que quero testar:\n\nConfirmo que não comprarei avaliações nem farei promessas enganosas.`);

const campaigns = [
  { title: 'Orçamento + Pix', audience: 'MEIs e prestadores', href: '/orcamento-com-pix?utm_source=creator_slug&utm_medium=creator&utm_campaign=orcamento_pix_creator' },
  { title: 'Preço freelancer', audience: 'Designers, social media e freelancers', href: '/calculadora-de-preco-freelancer?utm_source=creator_slug&utm_medium=creator&utm_campaign=preco_creator' },
  { title: 'MEI ou CLT', audience: 'Carreira, contabilidade e renda', href: '/mei-ou-clt?utm_source=creator_slug&utm_medium=creator&utm_campaign=mei_clt_creator' }
];

export default function CreatorPartnershipPage() {
  return <><SiteHeader /><main className="bg-slate-50"><header className="border-b border-emerald-900 bg-[linear-gradient(145deg,#020617,#064e3b)] text-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Programa para microcriadores</p><h1 className="precisoutapronto-display mt-4 max-w-4xl text-4xl font-extrabold sm:text-6xl">Conteúdo útil para quem vive de serviço.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">Se sua audiência tem MEIs, autônomos ou profissionais liberais, teste uma ferramenta em situação real e compartilhe o resultado com transparência.</p><a href={`mailto:${BRAND_EMAIL}?subject=${subject}&body=${body}`} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">Propor parceria <ArrowRight className="h-4 w-4" /></a></div></header>
  <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Campanhas iniciais</p><h2 className="precisoutapronto-display mt-2 text-3xl font-extrabold text-slate-950">Escolha uma dor que sua audiência já tem.</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{campaigns.map(item => <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><BriefcaseBusiness className="h-5 w-5 text-emerald-700" /><h3 className="mt-4 text-lg font-extrabold text-slate-950">{item.title}</h3><p className="mt-2 text-sm text-slate-600">{item.audience}</p><code className="mt-4 block break-all rounded-xl bg-slate-100 p-3 text-xs text-slate-700">{item.href}</code></article>)}</div></section>
  <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-3"><div><MessageCircle className="h-5 w-5 text-sky-700" /><h2 className="mt-3 font-extrabold">Formato livre</h2><p className="mt-2 text-sm leading-6 text-slate-600">Reel, tutorial, live ou post: mostre o uso real, inclusive limitações.</p></div><div><BarChart3 className="h-5 w-5 text-emerald-700" /><h2 className="mt-3 font-extrabold">Link individual</h2><p className="mt-2 text-sm leading-6 text-slate-600">Substituímos <code>creator_slug</code> por um identificador do canal e medimos visitas, criação e compartilhamento.</p></div><div><ShieldCheck className="h-5 w-5 text-amber-700" /><h2 className="mt-3 font-extrabold">Transparência</h2><p className="mt-2 text-sm leading-6 text-slate-600">Parceria identificada, sem compra de avaliações e sem promessa de resultado garantido.</p></div></div></section>
  <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6"><h2 className="precisoutapronto-display text-3xl font-extrabold">Quer testar antes de conversar?</h2><p className="mt-3 text-slate-600">Gere um orçamento completo e avalie se a ferramenta serve para sua comunidade.</p><Link href="/orcamento-com-pix?utm_source=creator_program&utm_medium=internal&utm_campaign=creator_trial" className="mt-6 inline-flex items-center gap-2 font-bold text-emerald-700">Testar orçamento + Pix <ArrowRight className="h-4 w-4" /></Link></section></main><SiteFooter /></>;
}
