import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, ChevronRight, FileCheck2, MessageCircle, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const steps = [
  { number: '01', title: 'Monte', text: 'Transforme o pedido do WhatsApp em itens, valores, prazo e condições.', icon: FileCheck2 },
  { number: '02', title: 'Envie', text: 'Compartilhe um link profissional. Seu cliente abre direto no celular.', icon: MessageCircle },
  { number: '03', title: 'Feche', text: 'O cliente aprova, recebe o Pix e você acompanha tudo sem planilha.', icon: CheckCircle2 }
] as const;

export function LandingPage() {
  return <div className="bg-white text-[#101828]">
    <header className="sticky top-8 z-50 border-b border-blue-100 bg-white/95 shadow-[0_14px_38px_-28px_rgba(3,31,75,.55)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:h-28 lg:px-8">
        <Link href="/" className="min-w-0 flex-1" aria-label="Precisou, Tá Pronto — página inicial">
          <Logo variant="marketing" className="h-16 max-w-[210px] sm:h-20 sm:max-w-[270px] lg:h-24 lg:max-w-[330px]" />
        </Link>
        <div className="flex items-center gap-2"><Link href="/login" className="hidden px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 sm:block">Entrar</Link><Link href="/orcamento-com-pix#montar" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#155eef] px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#004eeb]">Criar orçamento <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#0b5cff] via-[#83d600] to-[#0b5cff]" aria-hidden />
    </header>

    <main>
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f8faff]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_30%,rgba(21,94,239,.13),transparent_30%),radial-gradient(circle_at_10%_85%,rgba(18,183,106,.10),transparent_24%)]" />
        <div className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(16,24,40,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(16,24,40,.045)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_95%)]" />
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#155eef] shadow-sm"><Sparkles className="h-4 w-4" /> Feito para quem vende pelo WhatsApp</p>
            <h1 className="precisoutapronto-display mt-7 max-w-3xl text-[clamp(3.4rem,7vw,6.8rem)] font-black leading-[.88] tracking-[-.07em]">Orçamento enviado.<br /><span className="text-[#155eef]">Serviço fechado.</span></h1>
            <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">Crie um orçamento profissional, mande o link no WhatsApp e deixe seu cliente aprovar e pagar pelo celular.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/orcamento-com-pix#montar" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#155eef] px-7 font-black text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-[#004eeb]">Criar orçamento grátis <ArrowRight className="h-5 w-5" /></Link><Link href="/orcamento-para/eletricista" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 font-black text-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-md">Ver exemplo pronto <ChevronRight className="h-5 w-5" /></Link></div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600">{['Sem cadastro para começar', 'Cliente não instala app', 'Pix opcional'].map(item => <li key={item} className="flex items-center gap-1.5"><Check className="h-4 w-4 stroke-[3] text-emerald-600" />{item}</li>)}</ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-200/70 to-emerald-100/60 blur-2xl" />
            <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_32px_80px_-24px_rgba(16,24,40,.28)] sm:p-5"><div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#155eef]">Orçamento digital</p><h2 className="mt-2 text-xl font-black">Elétrica Silva</h2><p className="mt-1 text-xs text-slate-500">ORC-2026-018</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase text-amber-700 ring-1 ring-amber-200">Aguardando</span></div>
              <div className="space-y-4 py-6 text-sm"><div className="flex justify-between gap-5"><span className="font-semibold text-slate-600">Instalação de tomadas</span><strong>R$ 350</strong></div><div className="flex justify-between gap-5"><span className="font-semibold text-slate-600">Material elétrico</span><strong>R$ 140</strong></div></div>
              <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-5"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p><p className="mt-1 text-4xl font-black tracking-[-.05em]">R$ 490</p></div><div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><QrCode className="h-5 w-5" /> Pix pronto</div></div>
              <div className="mt-6 grid grid-cols-2 gap-3"><span className="rounded-xl bg-emerald-600 px-3 py-3.5 text-center text-sm font-black text-white">Aprovar orçamento</span><span className="rounded-xl border border-slate-200 px-3 py-3.5 text-center text-sm font-black text-slate-700">Pedir ajuste</span></div>
            </div></div>
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-xl sm:-left-8"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span><div><p className="text-xs font-black">Cliente aprovou</p><p className="text-[11px] text-slate-500">Resposta recebida pelo WhatsApp</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 py-8"><div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8"><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Para quem presta serviço</p><ul className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm font-black text-slate-700">{['Eletricistas', 'Pintores', 'Instaladores', 'Freelancers', 'Manutenção'].map(item => <li key={item}>{item}</li>)}</ul></div></section>

      <section className="py-20 sm:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-[#155eef]">Um fluxo. Sem enrolação.</p><h2 className="precisoutapronto-display mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Da conversa ao pagamento.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Pare de procurar mensagem, somar valor na calculadora e mandar o Pix separado.</p></div><ol className="mt-12 grid gap-5 lg:grid-cols-3">{steps.map(step => <li key={step.number} className="group rounded-[1.75rem] border border-slate-200 bg-[#f8faff] p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#155eef] text-white"><step.icon className="h-6 w-6" /></span><span className="text-4xl font-black text-slate-200">{step.number}</span></div><h3 className="mt-8 text-2xl font-black">{step.title}</h3><p className="mt-3 text-base leading-7 text-slate-600">{step.text}</p></li>)}</ol></div></section>

      <section className="bg-[#101828] py-20 text-white sm:py-24"><div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-8"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-300">Profissional por fora. Simples por dentro.</p><h2 className="precisoutapronto-display mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Seu cliente decide mais rápido.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Tudo para conferir, aprovar e pagar em uma única página feita para o celular.</p></div><ul className="grid gap-3">{['Itens e valores sem mensagem perdida', 'Aprovação ou ajuste em um toque', 'QR Code e Pix depois do aceite', 'Registro claro do combinado'].map(item => <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-400 text-[#101828]"><Check className="h-4 w-4 stroke-[3]" /></span>{item}</li>)}</ul></div></section>

      <section className="relative overflow-hidden bg-[#f8faff] py-20 sm:py-28"><div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200/50 blur-3xl" /><div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#155eef] shadow-lg"><ShieldCheck className="h-7 w-7" /></span><h2 className="precisoutapronto-display mt-6 text-4xl font-black tracking-[-.055em] sm:text-6xl">Seu próximo orçamento pode sair agora.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Comece sem cadastro. Monte, revise e envie quando estiver pronto.</p><Link href="/orcamento-com-pix#montar" className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#155eef] px-8 font-black text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-[#004eeb]">Criar meu orçamento grátis <ArrowRight className="h-5 w-5" /></Link><p className="mt-4 text-xs font-bold text-slate-500">Sem cartão · sem instalação · primeiro envio sem cadastro</p></div></section>
    </main>
  </div>;
}
