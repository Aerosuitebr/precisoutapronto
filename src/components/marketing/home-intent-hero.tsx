import { Calculator, Check, FilePenLine, FileText, GraduationCap, MessageCircle, QrCode, Receipt } from 'lucide-react';
import Link from 'next/link';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';
import { QuotePreview } from '@/components/orcamentos/quote-preview';
import { QUOTE_DEMO_EXAMPLE } from '@/lib/orcamentos/quote-demo-example';
import { publicToolEntry } from '@/lib/seo/public-tool-entry';
import type { PublicStats } from '@/lib/public-stats';

const shortcuts = [
  { href: publicToolEntry('curriculo')!, label: 'Criar currículo', icon: GraduationCap },
  { href: publicToolEntry('recibos')!, label: 'Gerar recibo', icon: Receipt },
  { href: publicToolEntry('editor-pdf')!, label: 'Editar PDF', icon: FilePenLine },
  { href: publicToolEntry('pix')!, label: 'Cobrar com Pix', icon: QrCode },
  { href: publicToolEntry('rescisao')!, label: 'Calcular rescisão', icon: Calculator },
  { href: '/gerador-de-proposta-comercial#ferramenta', label: 'Montar proposta comercial', icon: FileText }
];

export function HomeIntentHero({ hasStories, stats }: { hasStories: boolean; stats: PublicStats }) {
  return (
    <section aria-labelledby="home-title" className="border-b border-blue-100 bg-[radial-gradient(ellipse_at_top_right,_#123773,_#071a37_75%)] text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-12 lg:px-8 lg:py-12">
        <div>
          <h1 id="home-title" className="precisoutapronto-display text-[clamp(1.9rem,5vw,4.1rem)] font-black leading-[1.05] tracking-[-.045em]">
            Crie orçamentos profissionais e <span className="text-blue-300">envie pelo WhatsApp.</span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Seu cliente aprova e paga por Pix pelo link. Você pode emitir o recibo após receber.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6">
            <LandingConversionLink href="/orcamento-com-pix#montar" landingPath="/" placement="hero_primary" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#155eef] px-4 py-3 font-black text-white shadow-lg shadow-blue-950/50 hover:bg-blue-700">
              Criar orçamento grátis
            </LandingConversionLink>
            <LandingConversionLink href="#exemplos" landingPath="/" placement="hero_secondary" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-300/60 px-3 py-3 font-bold text-white hover:bg-blue-900 sm:px-5">
              Ver exemplos
            </LandingConversionLink>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-100">
            {['Sem cadastro', 'Primeiro envio grátis'].map(text => (
              <li key={text} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-300" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
          {stats.orcamentosWeek > 0 && (
            <p className="mt-3 text-sm text-blue-100">
              <strong className="text-white">{stats.orcamentosWeek.toLocaleString('pt-BR')}+</strong> orçamentos criados na última semana
            </p>
          )}
          {hasStories && <a href="#depoimentos" className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-blue-100 hover:underline">Leia depoimentos de prestadores</a>}
        </div>

        <figure className="min-w-0 rounded-2xl border border-blue-300/30 bg-white/10 p-2.5 shadow-xl shadow-blue-950/20 sm:p-4">
          <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 pb-2 text-sm font-semibold text-blue-100 sm:pb-3">
            <MessageCircle className="h-4 w-4 text-emerald-300" aria-hidden />
            Orçamento de exemplo · dados fictícios
          </figcaption>
          <div className="rounded-2xl bg-white text-slate-950">
            <QuotePreview {...QUOTE_DEMO_EXAMPLE} compact />
            <div className="px-4 pb-3">
              <a href="#exemplos" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-50 px-3 text-sm font-bold text-emerald-900 hover:bg-emerald-100">Testar aprovação</a>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

export function HomeOtherTools() {
  return (
    <section id="ferramentas" aria-labelledby="other-tools-title" className="scroll-mt-32 border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="other-tools-title" className="precisoutapronto-display text-3xl font-black tracking-tight">Outras ferramentas</h2>
        <ul aria-label="Atalhos para ferramentas" className="mt-5 grid gap-3 min-[360px]:grid-cols-2 md:grid-cols-3">
          {shortcuts.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <LandingConversionLink href={href} landingPath="/" placement="inline_primary" className="flex h-full min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold hover:border-blue-400 hover:text-blue-800">
                <Icon className="h-5 w-5 shrink-0 text-blue-700" aria-hidden />
                {label}
              </LandingConversionLink>
            </li>
          ))}
        </ul>
        <Link href="/recursos" className="mt-3 inline-flex min-h-11 items-center font-semibold text-blue-800 hover:underline">
          Ver todas as ferramentas
        </Link>
      </div>
    </section>
  );
}
