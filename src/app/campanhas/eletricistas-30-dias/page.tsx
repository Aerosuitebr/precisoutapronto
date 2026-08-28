import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarDays, MessageCircle, Zap } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

export const metadata: Metadata = {
  title: 'Desafio do Orçamento Profissional para Eletricistas',
  description: '30 dias para eletricistas enviarem orçamentos profissionais, receberem aprovação no celular e cobrarem por Pix.',
  alternates: { canonical: '/campanhas/eletricistas-30-dias' }
};

const weeks = [
  { title: 'Semana 1 · parecer profissional', tasks: ['Montar o primeiro orçamento real', 'Publicar um antes e depois no Status', 'Pedir resposta pelo link, não por áudio'] },
  { title: 'Semana 2 · responder mais rápido', tasks: ['Salvar serviços recorrentes', 'Criar três orçamentos em menos de 5 minutos', 'Compartilhar a tela do total calculado'] },
  { title: 'Semana 3 · fechar e cobrar', tasks: ['Usar aprovação pelo celular', 'Oferecer Pix no orçamento aprovado', 'Gerar recibo profissional'] },
  { title: 'Semana 4 · indicação', tasks: ['Mostrar um caso real sem dados do cliente', 'Indicar a ferramenta a dois eletricistas', 'Comparar respostas e fechamentos do mês'] }
];

const campaignHref = '/orcamento-para/eletricista?utm_source=desafio_eletricista&utm_medium=campaign&utm_campaign=eletricistas_30_dias';

export default function ElectricianCampaignPage() {
  return <><SiteHeader /><main className="bg-slate-50 text-slate-950">
    <header className="border-b border-amber-300 bg-[radial-gradient(circle_at_top_right,#fbbf24_0,#064e3b_38%,#020617_78%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-300"><Zap className="h-4 w-4" /> Exclusivo para eletricistas</p>
        <h1 className="precisoutapronto-display mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">30 dias para parar de mandar preço solto no WhatsApp.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Transforme serviço, material e prazo em um orçamento que o cliente confere, aprova e paga pelo celular. Grátis para começar.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={campaignHref} className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-amber-400 px-6 font-black text-slate-950 hover:bg-amber-300">Criar meu primeiro orçamento <ArrowRight className="h-5 w-5" /></Link>
          <Link href="/parcerias/criadores?utm_source=desafio_eletricista&utm_medium=campaign&utm_campaign=eletricistas_30_dias" className="inline-flex min-h-14 items-center gap-2 rounded-2xl border border-white/30 px-6 font-bold hover:bg-white/10"><MessageCircle className="h-5 w-5" /> Sou criador de conteúdo</Link>
        </div>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-2 text-emerald-700"><CalendarDays className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-[0.16em]">Plano prático de 30 dias</p></div>
      <h2 className="precisoutapronto-display mt-3 text-3xl font-black">Um resultado útil por semana.</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2">{weeks.map((week) => <article key={week.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-black">{week.title}</h3><ul className="mt-4 space-y-3">{week.tasks.map(task => <li key={task} className="flex gap-2 text-sm leading-6 text-slate-600"><BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{task}</li>)}</ul></article>)}</div>
    </section>
    <section className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6"><p className="text-sm font-bold text-emerald-700">Sem cadastro no primeiro teste</p><h2 className="precisoutapronto-display mt-2 text-3xl font-black">O conteúdo é o seu trabalho aprovado.</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Baixe o card vertical automático, publique no Status ou Stories sem expor o cliente e leve quem assistir direto ao modelo para eletricistas.</p><Link href={campaignHref} className="mt-7 inline-flex items-center gap-2 font-black text-emerald-700">Começar agora <ArrowRight className="h-4 w-4" /></Link></div></section>
  </main><SiteFooter /></>;
}
