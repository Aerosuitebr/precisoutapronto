import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Search, SlidersHorizontal, Sparkles, WandSparkles } from 'lucide-react';
import { HomeQuickSearch } from '@/components/marketing/home-quick-search';
import { CategoryExplorer } from '@/components/marketing/category-explorer';
import { HomeToolGallery } from '@/components/marketing/home-tool-gallery';
import { LiveStatsBar } from '@/components/marketing/live-stats-bar';
import type { PublicStats } from '@/lib/public-stats';

const steps = [
  { icon: Search, number: '01', title: 'Encontre', text: 'Descreva o que precisa resolver ou navegue por uma categoria.' },
  { icon: SlidersHorizontal, number: '02', title: 'Personalize', text: 'Informe somente os dados necessários, com orientação em cada etapa.' },
  { icon: CheckCircle2, number: '03', title: 'Saia com tudo pronto', text: 'Baixe, compartilhe ou continue o fluxo sem retrabalho.' }
] as const;

const guides = [
  { href: '/guias/como-cobrar-cliente-pelo-whatsapp', eyebrow: 'Cobrança', title: 'Como cobrar um cliente pelo WhatsApp sem desgastar a relação', time: '6 min' },
  { href: '/guias/recibo-simples-tem-validade', eyebrow: 'Documentos', title: 'Recibo simples tem validade? O que não pode faltar', time: '6 min' },
  { href: '/guias/como-fazer-orcamento-com-pix', eyebrow: 'Orçamento', title: 'Como fazer um orçamento com Pix e enviar pelo WhatsApp', time: '6 min' }
] as const;

export function LandingPage({ initialStats }: { initialStats?: PublicStats | null }) {
  return (
    <div className="bg-[#f8faf7] text-[#031f4b]">
      <section className="relative isolate overflow-hidden bg-[#031f4b] text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_10%,rgba(131,214,0,0.22),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(11,92,255,0.55),transparent_36%),linear-gradient(135deg,#031f4b_0%,#063b82_58%,#0b5cff_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 2xl:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#83d600]/40 bg-[#83d600]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#c8ff73]"><Sparkles className="h-4 w-4" />Sua necessidade. Nossa solução.</p>
            <h1 className="precisoutapronto-display mt-7 text-[clamp(3rem,7vw,6.6rem)] font-black leading-[0.9] tracking-[-0.055em]">
              <span className="block">Orçamento no WhatsApp.</span>
              <span className="mt-1 block text-[#a9ed42]">Aprovado. Pix recebido.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">Monte em poucos passos, envie o link e deixe o cliente aprovar no celular. Sem instalar aplicativo e sem cadastro para começar.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/orcamento-com-pix#montar" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#83d600] px-7 font-black text-[#031f4b] shadow-xl shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-[#a9ed42]">
                Criar meu orçamento grátis <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/orcamento-para/eletricista" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-7 font-black text-white transition hover:bg-white/15">
                Ver um modelo pronto
              </Link>
            </div>
            <p className="mt-3 text-xs font-bold text-blue-100">Sem cadastro para enviar o primeiro orçamento · cliente não cria conta · Pix opcional</p>
            <div className="mx-auto mt-6 max-w-2xl">
              <LiveStatsBar
                initial={initialStats}
                className="[&_li]:border-white/15 [&_li]:bg-white/10 [&_p:first-child]:text-white [&_p:last-child]:text-blue-100"
              />
            </div>
            <div className="mx-auto mt-9 max-w-2xl rounded-[1.4rem] bg-white/10 p-2 shadow-2xl shadow-blue-950/30 ring-1 ring-white/20 backdrop-blur"><HomeQuickSearch /></div>
            <Link href="/recursos" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white px-5 py-3 text-sm font-black text-[#031f4b] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#c8ff73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff73] focus-visible:ring-offset-2 focus-visible:ring-offset-[#031f4b]">
              Ver todas as ferramentas <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold">
              {['#Orçamento', '#Pix', '#Recibo', '#Ofícios', '#MEI'].map((tag) => <a key={tag} href="#categorias" className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-blue-50 transition hover:border-[#83d600]/60 hover:text-[#c8ff73]">{tag}</a>)}
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#0b5cff] via-[#83d600] to-[#0b5cff]" />
      </section>

      <section className="border-b border-[#0b5cff]/10 bg-white py-12 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]">Veja o que o cliente recebe</p>
            <h2 className="precisoutapronto-display mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-[#031f4b] sm:text-5xl">
              Um link claro para decidir sem trocar dez mensagens.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              O cliente confere itens e valor, aprova ou pede um ajuste e avisa você pelo próprio WhatsApp. Sem baixar aplicativo.
            </p>
            <Link href="/orcamento-para/eletricista" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#0b5cff]/20 bg-[#eef5ff] px-5 font-black text-[#0b5cff] transition hover:border-[#0b5cff]/40 hover:bg-white">
              Abrir uma demonstração completa <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="rounded-[2rem] bg-[#031f4b] p-3 shadow-2xl shadow-blue-950/20 sm:p-5" aria-label="Exemplo do orçamento recebido pelo cliente">
            <div className="rounded-[1.45rem] bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Orçamento digital</p><p className="mt-2 text-xl font-black text-[#031f4b]">Elétrica Silva</p><p className="mt-1 text-xs text-slate-500">Preparado para seu cliente</p></div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-900">Aguardando</span>
              </div>
              <div className="space-y-3 py-5 text-sm"><div className="flex justify-between gap-4"><span className="font-semibold text-slate-700">Instalação de tomadas</span><strong>R$ 350</strong></div><div className="flex justify-between gap-4"><span className="font-semibold text-slate-700">Material elétrico</span><strong>R$ 140</strong></div></div>
              <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4"><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total</p><p className="text-3xl font-black text-emerald-700">R$ 490</p></div><p className="text-right text-xs font-semibold text-slate-500">Confere no celular<br />e responde no link</p></div>
              <div className="mt-5 grid grid-cols-2 gap-2"><span className="rounded-xl bg-emerald-600 px-3 py-3 text-center text-sm font-black text-white">Aprovar</span><span className="rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-black text-slate-700">Pedir ajuste</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="scroll-mt-24 bg-[#f8faf7] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="min-w-0">
            <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]">Escolha por objetivo</p><h2 className="precisoutapronto-display mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-[#031f4b] sm:text-5xl">Encontre a ferramenta certa para o que você precisa.</h2><p className="mt-4 text-base leading-7 text-slate-600">Selecione uma área e veja soluções prontas para criar documentos, fazer cálculos e organizar sua rotina.</p></div>
            <div className="mt-8 min-w-0"><CategoryExplorer /></div>
          </div>
        </div>
      </section>

      <HomeToolGallery />

      <section className="relative overflow-hidden bg-[#eef5ff] py-16 sm:py-24">
        <div className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#83d600]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]">Como funciona</p><h2 className="precisoutapronto-display mt-3 text-4xl font-black tracking-[-0.04em] text-[#031f4b] sm:text-5xl">Do problema ao resultado em três movimentos.</h2></div>
          <ol className="relative mt-12 grid gap-5 lg:grid-cols-3">
            <span className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 bg-gradient-to-r from-[#0b5cff] via-[#83d600] to-[#0b5cff] lg:block" aria-hidden />
            {steps.map((step) => <li key={step.number} className="relative rounded-[1.75rem] border border-[#0b5cff]/15 bg-white p-7 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#031f4b] text-white"><step.icon className="h-7 w-7" /></span><span className="text-4xl font-black text-[#0b5cff]/15">{step.number}</span></div><h3 className="mt-7 text-2xl font-black text-[#031f4b]">{step.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{step.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]"><BookOpen className="h-4 w-4" />Aprenda enquanto resolve</p><h2 className="precisoutapronto-display mt-3 text-4xl font-black tracking-[-0.04em] text-[#031f4b] sm:text-5xl">Guias curtos. Aplicação imediata.</h2></div><Link href="/guias" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0b5cff]">Ver todos os guias <ArrowRight className="h-4 w-4" /></Link></div>
          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {guides.map((guide, index) => <li key={guide.href}><Link href={guide.href} className="group flex h-full min-h-[235px] flex-col rounded-[1.75rem] border border-[#0b5cff]/15 bg-[#f8faf7] p-6 transition hover:-translate-y-1 hover:border-[#0b5cff]/40 hover:bg-white hover:shadow-lg"><div className="flex items-center justify-between"><span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0b5cff]">{guide.eyebrow}</span><span className="text-xs font-bold text-slate-400">{guide.time}</span></div><h3 className="mt-7 flex-1 text-2xl font-black leading-tight text-[#031f4b]">{guide.title}</h3><span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#0b5cff]">Ler e aplicar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span><span className={`mt-5 h-1 rounded-full ${index === 1 ? 'bg-[#83d600]' : 'bg-[#0b5cff]'}`} /></Link></li>)}
          </ul>
        </div>
      </section>

      <section className="bg-[#031f4b] py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#a9ed42]"><WandSparkles className="h-4 w-4" />Uma coleção que cresce com você</p><h2 className="precisoutapronto-display mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">Explore, favorite e compartilhe o que resolveu seu problema.</h2></div><Link href="/recursos" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#83d600] px-7 font-black text-[#031f4b] transition hover:bg-[#a9ed42]">Explorar todas as ferramentas <ArrowRight className="h-5 w-5" /></Link></div>
      </section>
    </div>
  );
}
