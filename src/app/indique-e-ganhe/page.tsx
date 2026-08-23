import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Gift, Link2, ShieldCheck, Users } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { BRAND_NAME } from '@/lib/brand';
import { REFERRAL_BATCH_SIZE } from '@/lib/referral-shared';
import { getViralBaseUrl } from '@/lib/viral-loop';

const PATH = '/indique-e-ganhe';
const SITE = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Indique e ganhe 30 dias Premium',
  description: `Indique o Precisou, Tá Pronto. A cada ${REFERRAL_BATCH_SIZE} amigos ativos, ganhe 30 dias Premium. Veja como funciona e gere seu link pessoal.`,
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Indique e ganhe | Precisou, Tá Pronto',
    description: `${REFERRAL_BATCH_SIZE} amigos ativos valem 30 dias Premium.`,
    url: `${SITE}${PATH}`,
    type: 'website'
  }
};

const steps = [
  { icon: Link2, title: 'Pegue seu link', text: 'Entre na sua conta e copie o convite pessoal na área de indicações.' },
  { icon: Users, title: 'Convide quem vai usar', text: 'Seu amigo começa gratuitamente pelo orçamento com Pix, sem precisar se cadastrar antes de testar.' },
  { icon: CheckCircle2, title: 'O amigo fica ativo', text: 'A indicação conta quando ele cria a conta, confirma o e-mail e usa uma ferramenta pela primeira vez.' },
  { icon: Gift, title: 'Receba automaticamente', text: `Ao completar ${REFERRAL_BATCH_SIZE} amigos ativos, 30 dias Premium são adicionados à sua conta.` }
];

const faqs = [
  { q: 'O que significa amigo ativo?', a: 'É uma pessoa indicada que confirmou o e-mail e realizou o primeiro uso válido de uma ferramenta, como salvar ou baixar um resultado.' },
  { q: 'Quando recebo a recompensa?', a: `A recompensa é liberada automaticamente quando ${REFERRAL_BATCH_SIZE} indicações se tornam ativas.` },
  { q: 'Os meses acumulam?', a: 'Sim. Novas recompensas são acrescentadas ao período Premium que você já possui.' },
  { q: 'Posso indicar alguém da mesma casa?', a: 'Indicações legítimas são aceitas, mas contas vinculadas ao mesmo dispositivo podem ser bloqueadas pela proteção antifraude.' },
  { q: 'Meu amigo precisa pagar?', a: 'Não. Ele pode começar gratuitamente e a ativação depende do primeiro uso válido, não de uma compra.' }
];

export default function ReferralLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: 'Indique e ganhe', url: `${SITE}${PATH}`, description: metadata.description, isPartOf: { '@type': 'WebSite', name: BRAND_NAME, url: SITE } },
      { '@type': 'FAQPage', mainEntity: faqs.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Indique e ganhe', item: `${SITE}${PATH}` }] }
    ]
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <SiteHeader />
    <main className="bg-slate-50">
      <header className="overflow-hidden border-b border-amber-200 bg-[linear-gradient(145deg,#020617,#064e3b_58%,#14532d)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300"><Gift className="h-4 w-4" /> Programa de indicação</p>
          <h1 className="rj-display mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">Indique para quem precisa resolver. Ganhe quando a pessoa realmente usar.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">A cada <strong>{REFERRAL_BATCH_SIZE} amigos ativos</strong>, você recebe <strong>30 dias Premium</strong>. Seu amigo pode experimentar o orçamento com Pix gratuitamente antes de criar a conta.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/conta#indicacoes" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">Pegar meu link de indicação <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/cadastro?utm_source=referral_landing&utm_medium=cta&utm_campaign=indique_e_ganhe" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 font-bold text-white hover:bg-white/15">Criar conta grátis</Link>
          </div>
          <p className="mt-4 text-xs text-emerald-100">Já tem conta? O primeiro botão abre diretamente seu painel de convites.</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Como funciona</p>
        <h2 className="rj-display mt-2 text-3xl font-extrabold text-slate-950">Um ciclo simples e verificável</h2>
        <ol className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{steps.map((step, index) => <li key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 font-black text-emerald-800">{index + 1}</span><step.icon className="mt-5 h-5 w-5 text-amber-600" /><h3 className="mt-3 font-extrabold text-slate-950">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></li>)}</ol>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Regras claras</p><h2 className="rj-display mt-2 text-3xl font-extrabold text-slate-950">A recompensa vem do uso real, não do clique.</h2><ul className="mt-6 space-y-3 text-sm leading-6 text-slate-700"><li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />O indicado não precisa pagar para se tornar ativo.</li><li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />Cada pessoa ativa conta uma única vez.</li><li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />Recompensas acumulam com seu Premium atual.</li><li className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />Autoconvites e vínculos pelo mesmo dispositivo podem ser bloqueados.</li></ul></div>
          <div className="rounded-3xl bg-slate-950 p-7 text-white"><p className="text-sm font-bold text-amber-300">Resumo da recompensa</p><p className="mt-4 text-5xl font-black">{REFERRAL_BATCH_SIZE} → 30</p><p className="mt-2 text-sm leading-6 text-slate-300">{REFERRAL_BATCH_SIZE} amigos ativos geram 30 dias Premium. Ao completar outro grupo, você ganha novamente.</p><Link href="/conta#indicacoes" className="mt-6 inline-flex items-center gap-2 font-bold text-emerald-300 hover:text-emerald-200">Abrir meu painel <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6"><h2 className="rj-display text-3xl font-extrabold text-slate-950">Perguntas frequentes</h2><div className="mt-6 space-y-3">{faqs.map((item) => <details key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold text-slate-950">{item.q}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p></details>)}</div><div className="mt-8 rounded-3xl bg-emerald-700 p-7 text-center text-white"><h2 className="text-2xl font-extrabold">Pronto para indicar?</h2><p className="mt-2 text-sm text-emerald-50">Seu link pessoal e o progresso ficam salvos na sua conta.</p><Link href="/conta#indicacoes" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950">Pegar meu link <ArrowRight className="h-4 w-4" /></Link></div></section>
    </main>
    <SiteFooter />
  </>;
}
