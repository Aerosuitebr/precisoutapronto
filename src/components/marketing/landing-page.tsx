import { HomeIntentHero } from '@/components/marketing/home-intent-hero';
import Link from 'next/link';
import { ApprovedServiceStories } from '@/components/marketing/approved-service-stories';
import { ArrowRight, Check, CheckCircle2, FileCheck2, MessageCircle, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { UsefulToolsStrip } from '@/components/marketing/useful-tools-strip';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';
import { ServiceDifferences } from '@/components/marketing/service-differences';

const commercialTools = [
  { href: '/orcamento-com-pix#montar', title: 'Enviar orçamento', description: 'Combine itens, valores e prazo. Envie um link para seu cliente aprovar pelo WhatsApp.', action: 'Montar meu orçamento' },
  { href: '/recibos/recibo-pagamento-pix', title: 'Emitir recibo de Pix', description: 'Já recebeu? Veja como registrar o serviço e a parcela paga em um recibo em PDF.', action: 'Ver modelo e gerar recibo' },
  { href: '/gerador-de-proposta-comercial#ferramenta', title: 'Montar proposta comercial', description: 'Apresente serviços, preços e condições em um PDF com a identidade do seu negócio.', action: 'Montar proposta grátis' }
] as const;

const professionLinks = [
  { href: '/orcamento-para/eletricista#montar', label: 'Eletricistas' },
  { href: '/orcamento-para/pintor#montar', label: 'Pintores' },
  { href: '/orcamento-para/marceneiro#montar', label: 'Marceneiro' },
  { href: '/orcamento-para/gesseiro#montar', label: 'Gesseiro' },
  { href: '/orcamento-para/instalacao-de-piso#montar', label: 'Instalação de piso' }
] as const;

const steps = [
  { number: '01', title: 'Monte', text: 'Transforme o pedido do WhatsApp em itens, valores, prazo e condições.', icon: FileCheck2 },
  { number: '02', title: 'Envie', text: 'Compartilhe um link profissional. Seu cliente abre direto no celular.', icon: MessageCircle },
  { number: '03', title: 'Feche', text: 'O cliente aprova, recebe o Pix e você acompanha tudo sem planilha.', icon: CheckCircle2 }
] as const;

export function LandingPage() {
  return <div className="bg-white text-[#101828]">
    <header className="sticky top-8 z-50 border-b border-blue-100 bg-white/95 shadow-[0_14px_38px_-28px_rgba(3,31,75,.55)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:h-28 lg:px-8">
        <Link href="/" className="min-w-0 flex-1" aria-label="Precisou, Tá Pronto, página inicial">
          <Logo variant="marketing" className="h-16 max-w-[210px] sm:h-20 sm:max-w-[270px] lg:h-24 lg:max-w-[330px]" />
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex"><a href="#ferramentas" className="hover:text-blue-700">Ferramentas</a><a href="#como-funciona" className="hover:text-blue-700">Como funciona</a><a href="#para-profissionais" className="hover:text-blue-700">Para profissionais</a></nav>
        <div className="flex items-center gap-2"><Link href="/login" className="hidden px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 sm:block">Entrar</Link><Link href="/orcamento-com-pix#montar" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#155eef] px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#004eeb]">Criar orçamento <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
      <nav aria-label="Navegação rápida no celular" className="flex justify-center gap-5 border-t border-slate-100 px-3 py-2 text-xs font-bold text-slate-600 lg:hidden"><a href="#ferramentas" className="py-2">Ferramentas</a><a href="#como-funciona" className="py-2">Como funciona</a><a href="#para-profissionais" className="py-2">Para profissionais</a></nav>
      <div className="h-1 bg-gradient-to-r from-[#0b5cff] via-[#83d600] to-[#0b5cff]" aria-hidden />
    </header>

    <main>
      <HomeIntentHero />
      <div id="ferramentas" className="scroll-mt-44"><UsefulToolsStrip homeDiscovery title="Resolva tudo o que o seu serviço precisa em segundos" /></div>

      <section id="como-funciona" className="scroll-mt-44 py-20 sm:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-[#155eef]">Um fluxo. Sem enrolação.</p><h2 className="precisoutapronto-display mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Da conversa ao pagamento.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Pare de procurar mensagem, somar valor na calculadora e mandar o Pix separado.</p></div><ol className="mt-12 grid gap-5 lg:grid-cols-3">{steps.map(step => <li key={step.number} className="group rounded-[1.75rem] border border-slate-200 bg-[#f8faff] p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#155eef] text-white"><step.icon className="h-6 w-6" /></span><span className="text-4xl font-black text-slate-500">{step.number}</span></div><h3 className="mt-8 text-2xl font-black">{step.title}</h3><p className="mt-3 text-base leading-7 text-slate-600">{step.text}</p></li>)}</ol></div></section>

      <section id="para-profissionais" aria-labelledby="documentos-servico-title" className="scroll-mt-44 border-y border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="documentos-servico-title" className="precisoutapronto-display text-3xl font-black tracking-[-.04em] sm:text-4xl">O documento certo para cada etapa do serviço</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">Prepare a proposta, combine o orçamento e registre o pagamento. Escolha o que você precisa agora.</p>
          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
            {commercialTools.map(tool => <li key={tool.href}>
              <LandingConversionLink href={tool.href} landingPath="/" placement="inline_primary" className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg">
                <h3 className="text-xl font-black">{tool.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{tool.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#155eef]">{tool.action}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></span>
              </LandingConversionLink>
            </li>)}
          </ul>
          <h3 className="mt-10 text-lg font-bold">Orçamento para a sua profissão</h3>
          <ul className="mt-4 flex flex-wrap gap-3">
            {professionLinks.map(item => <li key={item.href}><LandingConversionLink href={item.href} landingPath="/" placement="inline_primary" className="inline-flex min-h-11 items-center rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-[#155eef] hover:bg-blue-50">Ver modelos prontos para {item.label}</LandingConversionLink></li>)}
          </ul>
          <Link href="/modelos-de-orcamento" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#155eef]">Ver todos os modelos de orçamento <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>

      <ServiceDifferences landingPath="/" />
      <ApprovedServiceStories />

      <section className="bg-[#101828] py-20 text-white sm:py-24"><div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-8"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-300">Profissional por fora. Simples por dentro.</p><h2 className="precisoutapronto-display mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Seu cliente decide mais rápido.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Tudo para conferir, aprovar e pagar em uma única página feita para o celular.</p></div><ul className="grid gap-3">{['Itens e valores sem mensagem perdida', 'Aprovação ou ajuste em um toque', 'QR Code e Pix depois do aceite', 'Registro claro do combinado'].map(item => <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-400 text-[#101828]"><Check className="h-4 w-4 stroke-[3]" /></span>{item}</li>)}</ul></div></section>

      <section className="relative overflow-hidden bg-[#f8faff] py-20 sm:py-28"><div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200/50 blur-3xl" /><div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#155eef] shadow-lg"><ShieldCheck className="h-7 w-7" /></span><h2 className="precisoutapronto-display mt-6 text-4xl font-black tracking-[-.055em] sm:text-6xl">Seu próximo orçamento pode sair agora.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Comece sem cadastro. Monte, revise e envie quando estiver pronto.</p><Link href="/orcamento-com-pix#montar" className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#155eef] px-8 font-black text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-[#004eeb]">Criar meu orçamento grátis <ArrowRight className="h-5 w-5" /></Link><p className="mt-4 text-xs font-bold text-slate-500">Sem cartão · sem instalação · primeiro envio sem cadastro</p></div></section>
    </main>
  </div>;
}
