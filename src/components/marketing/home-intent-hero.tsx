import { ArrowRight, Calculator, Check, FilePenLine, FileText, GraduationCap, QrCode, Receipt } from 'lucide-react';
import Link from 'next/link';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';
import { HomeQuickSearch } from '@/components/marketing/home-quick-search';
import { publicToolEntry } from '@/lib/seo/public-tool-entry';

const shortcuts = [
  { id: 'curriculo', label: 'Criar currículo', icon: GraduationCap, tone: 'bg-indigo-50 text-indigo-700' },
  { id: 'recibos', label: 'Gerar recibo', icon: Receipt, tone: 'bg-emerald-50 text-emerald-700' },
  { id: 'editor-pdf', label: 'Editar PDF', icon: FilePenLine, tone: 'bg-rose-50 text-rose-700' },
  { id: 'pix', label: 'Cobrar com Pix', icon: QrCode, tone: 'bg-teal-50 text-teal-700' },
  { id: 'rescisao', label: 'Calcular rescisão', icon: Calculator, tone: 'bg-amber-50 text-amber-800' },
  { id: 'orcamentos', label: 'Criar orçamento', icon: FileText, tone: 'bg-blue-50 text-blue-700' }
] as const;

export function HomeIntentHero() {
  return (
    <section id="ferramentas" aria-labelledby="home-title" className="scroll-mt-40 border-b border-blue-100 bg-[radial-gradient(ellipse_at_top_right,_#dbeafe,_#f8faff_70%)]">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-16">
        <h1 id="home-title" className="precisoutapronto-display max-w-3xl text-[clamp(2.1rem,6vw,4.5rem)] font-black leading-[1.05] tracking-[-.05em] text-[#031f4b]">O que você precisa resolver hoje?</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-lg">Crie documentos, edite PDFs, faça cálculos e organize cobranças. Tudo online.</p>
        <div className="mt-5"><HomeQuickSearch compact /></div>
        <ul aria-label="Atalhos para ferramentas" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {shortcuts.map(({ id, label, icon: Icon, tone }) => (
            <li key={id}>
              <LandingConversionLink href={publicToolEntry(id)!} landingPath="/" placement="hero_primary" className="flex h-full min-h-12 items-center gap-2 rounded-xl border border-blue-100 bg-white p-2 text-sm font-bold leading-tight text-slate-900 shadow-sm hover:border-blue-400 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 sm:gap-3 sm:p-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" aria-hidden /></span>
                {label}
              </LandingConversionLink>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4">
          <p className="text-xs leading-5 text-slate-600">Comece grátis · Funciona no celular · Sem instalar aplicativo</p>
          <Link href="/recursos" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-blue-800 hover:underline">Ver todas as ferramentas <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}

export function HomeQuoteSection() {
  return <section aria-labelledby="home-quote-title" className="border-b border-slate-200 bg-slate-50">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-8">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-blue-700">Para quem presta serviço e atende pelo WhatsApp</p>
        <h2 id="home-quote-title" className="precisoutapronto-display mt-5 text-[clamp(2.25rem,4vw,4rem)] font-black leading-[1.05] tracking-[-.05em]">Seu orçamento profissional, <span className="text-[#155eef]">aprovado pelo WhatsApp.</span></h2>
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
        <h3 className="mt-4 text-2xl font-black text-slate-950">O combinado fica claro.</h3>
        <p className="mt-2 text-sm text-slate-500">Elétrica Silva · ORC-018</p>
        <dl className="my-7 space-y-4">{[['Instalação de tomadas', 'R$ 350'], ['Material elétrico', 'R$ 140'], ['Total do serviço', 'R$ 490']].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 text-sm"><dt className="text-slate-600">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl>
        <ol className="space-y-3 border-t border-slate-200 pt-5">{['Cliente confere e aprova pelo link', 'Você registra a entrada de R$ 150', 'Recibo explica os R$ 340 de saldo'].map(text => <li key={text} className="flex items-start gap-2 text-sm leading-6 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />{text}</li>)}</ol>
        <p className="mt-5 text-xs leading-6 text-slate-500">Exemplo de uso. Confira o recebimento no banco antes de emitir o recibo; não fazemos conciliação bancária automática.</p>
      </div>
    </div>
  </section>;
}
