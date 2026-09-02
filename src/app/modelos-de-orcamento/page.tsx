import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { PROFESSION_LANDINGS } from '@/lib/orcamentos/profession-presets';
import { StrategicSeoClusters } from '@/components/marketing/strategic-seo-clusters';

export const metadata: Metadata = {
  title: 'Modelos de Orçamento Grátis por Profissão e Serviço',
  description: 'Escolha um modelo de orçamento preenchido, ajuste itens e valores e envie pelo WhatsApp para o cliente aprovar e pagar por Pix.',
  alternates: { canonical: '/modelos-de-orcamento' }
};

export default function QuoteModelsPage() {
  return <>
    <TopEnvBanner />
    <div className="pt-8">
      <SiteHeader />
      <main>
        <section className="bg-slate-950 text-white"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Central de modelos</p>
          <h1 className="precisoutapronto-display mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Modelos de orçamento por profissão e serviço</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">Abra um modelo com itens próprios do serviço, veja um exemplo preenchido e gere o link para o cliente aprovar e pagar por Pix.</p>
          <ul className="mt-6 flex flex-wrap gap-4 text-sm text-slate-200"><li className="flex gap-2"><Check className="h-4 w-4 text-amber-300" />Sem cadastro para começar</li><li className="flex gap-2"><Check className="h-4 w-4 text-amber-300" />Aprovação pelo celular</li><li className="flex gap-2"><Check className="h-4 w-4 text-amber-300" />Recibo depois do pagamento</li></ul>
        </div></section>
        <section className="bg-slate-50"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="precisoutapronto-display text-3xl font-extrabold text-slate-950">Escolha o modelo mais próximo do seu trabalho</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">Cada página tem exemplo, escopo, perguntas e campos próprios. Use o modelo como ponto de partida e substitua preços e condições pela realidade do serviço.</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Modelos testados no gerador e atualizados em <time dateTime="2026-08-27">27 de agosto de 2026</time>. O cliente abre o link no navegador e não precisa instalar aplicativo.</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Veja também a nossa <Link href="/pesquisa/orcamentos-prestadores" className="font-bold text-emerald-700 hover:underline">análise aberta dos elementos recorrentes em um orçamento de serviço</Link>, com metodologia, contagens e critérios editoriais.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PROFESSION_LANDINGS.map((item) => <Link key={item.slug} href={`/orcamento-para/${item.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><p className="font-extrabold text-slate-950">{item.name}</p><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">Abrir modelo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div>
        </div></section>
        <StrategicSeoClusters current="/modelos-de-orcamento" />
      </main>
      <SiteFooter />
    </div>
  </>;
}
