import { ArrowRight, Check, FileText } from 'lucide-react';
import Link from 'next/link';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';

export function HomeIntentHero() {
  return <section aria-labelledby="home-title" className="border-b border-slate-200 bg-[radial-gradient(ellipse_at_top_right,_#dbeafe,_#f8faff_60%)]">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-8">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-blue-700">Para quem presta serviço e atende pelo WhatsApp</p>
        <h1 id="home-title" className="precisoutapronto-display mt-5 text-[clamp(2.6rem,5vw,5rem)] font-black leading-[1.05] tracking-[-.05em]">Seu orçamento profissional,<br /><span className="text-[#155eef]">aprovado pelo WhatsApp.</span></h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Monte os itens, envie ao cliente e organize entrada, saldo e recibo em um só fluxo.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <LandingConversionLink href="/orcamento-com-pix#montar" landingPath="/" placement="hero_primary" className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#155eef] px-5 py-3 text-center font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-800 sm:w-auto">Criar orçamento grátis<ArrowRight className="h-5 w-5 shrink-0" aria-hidden /></LandingConversionLink>
          <LandingConversionLink href="/demonstracao-orcamento" landingPath="/" placement="hero_secondary" className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-blue-200 bg-white px-5 py-3 text-center font-bold text-blue-800 hover:bg-blue-50 sm:w-auto">Ver como o cliente recebe</LandingConversionLink>
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-600">Sem cadastro para começar · Pix opcional · PDF grátis com a marca da plataforma</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Conta grátis para histórico. <Link href="/planos" className="font-semibold text-blue-800 underline underline-offset-4">Conheça o gratuito e o Premium</Link>.</p>
      </div>
      <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-25px_rgba(16,24,40,.25)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Prévia ilustrativa · dados fictícios</p>
        <FileText className="mt-6 h-9 w-9 text-blue-600" aria-hidden />
        <h2 className="mt-4 text-2xl font-black text-slate-950">O combinado fica claro.</h2>
        <p className="mt-2 text-sm text-slate-500">Elétrica Silva · ORC-018</p>
        <dl className="my-7 space-y-4">{[['Instalação de tomadas', 'R$ 350'], ['Material elétrico', 'R$ 140'], ['Total do serviço', 'R$ 490']].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 text-sm"><dt className="text-slate-600">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl>
        <ol className="space-y-3 border-t border-slate-200 pt-5">{['Cliente confere e aprova pelo link', 'Você registra a entrada de R$ 150', 'Recibo explica os R$ 340 de saldo'].map(text => <li key={text} className="flex items-start gap-2 text-sm leading-6 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />{text}</li>)}</ol>
        <p className="mt-5 text-xs leading-6 text-slate-500">Exemplo de uso. Confira o recebimento no banco antes de emitir o recibo; não fazemos conciliação bancária automática.</p>
      </div>
    </div>
  </section>;
}
