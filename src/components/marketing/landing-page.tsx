import Link from 'next/link';
import { ArrowRight, BadgeCheck, Calculator, Check, FileCheck2, FileText, GraduationCap, ImageIcon, Receipt, Search, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { HomeConversionLink } from '@/components/analytics/home-conversion-link';
import { HomeQuickSearch } from '@/components/marketing/home-quick-search';
import { Button } from '@/components/ui/button';

const paths = [
  { href: '/recibo-de-aluguel', label: 'Recibo de aluguel', note: 'Preencha, baixe e imprima', icon: Receipt, tone: 'bg-emerald-50 text-emerald-800' },
  { href: '/calculadora-de-rescisao', label: 'Calcular rescisão', note: 'Veja uma estimativa detalhada', icon: Calculator, tone: 'bg-amber-50 text-amber-800' },
  { href: '/gerador-de-qr-code-pix', label: 'Gerar QR Code Pix', note: 'QR e Copia e Cola na hora', icon: Wallet, tone: 'bg-sky-50 text-sky-800' },
  { href: '/gerador-de-referencias-abnt', label: 'Referência ABNT', note: 'Organize a fonte corretamente', icon: GraduationCap, tone: 'bg-violet-50 text-violet-800' },
  { href: '/comprimir-redimensionar-imagem', label: 'Comprimir imagem', note: 'Reduza sem enviar o arquivo', icon: ImageIcon, tone: 'bg-rose-50 text-rose-800' },
  { href: '/gerador-de-contrato', label: 'Criar contrato', note: 'Partes, cláusulas e PDF', icon: FileText, tone: 'bg-slate-100 text-slate-800' }
] as const;

const journeys = [
  { eyebrow: 'Recebeu um pagamento', title: 'Registre sem improvisar no WhatsApp.', text: 'Escolha o tipo de recibo, confira um exemplo preenchido e gere o PDF com os dados certos.', href: '/recibos', action: 'Encontrar meu recibo', icon: Receipt },
  { eyebrow: 'Vai prestar um serviço', title: 'Do preço combinado ao pagamento.', text: 'Monte o orçamento, envie para aprovação, cobre por Pix e emita o recibo no mesmo fluxo.', href: '/orcamento-com-pix', action: 'Montar um orçamento', icon: FileCheck2 },
  { eyebrow: 'Precisa calcular', title: 'Entenda o resultado, não só o número.', text: 'Use calculadoras com memória de cálculo, contexto e próximos passos para conferir o cenário.', href: '/calculadora-de-rescisao', action: 'Ver calculadoras', icon: Calculator }
] as const;

export function LandingPage() {
  return (
    <div className="bg-[#f7f8f5] text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm"><Sparkles className="h-3.5 w-3.5" /> Ferramentas úteis, sem enrolação</div>
            <h1 className="rj-display mt-6 max-w-3xl text-[clamp(2.7rem,6vw,5.2rem)] font-black leading-[0.94] tracking-[-0.05em]">Resolva agora. <span className="text-emerald-700">Saia com algo pronto.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">Recibos, cálculos, documentos e ferramentas para tarefas que não deveriam tomar a sua tarde inteira.</p>
            <div className="mt-7 max-w-xl"><HomeQuickSearch /></div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-[52px] rounded-full bg-slate-950 px-7 font-bold text-white hover:bg-emerald-800"><HomeConversionLink href="/recursos" placement="hero_primary">Encontrar uma solução <ArrowRight className="h-4 w-4" /></HomeConversionLink></Button>
              <Link href="#tarefas" className="inline-flex h-[52px] items-center justify-center rounded-full px-6 text-sm font-bold text-slate-700 transition hover:bg-white">Ver tarefas populares</Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">{['Sem instalar nada', 'Comece grátis', 'Funciona no celular'].map((item) => <li key={item} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-700" />{item}</li>)}</ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-emerald-200/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /></div><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Resolva Jato</span></div>
              <div className="p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Escolha pelo que precisa fazer</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{paths.slice(0, 4).map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><span className={`grid h-9 w-9 place-items-center rounded-xl ${item.tone}`}><item.icon className="h-4 w-4" /></span><p className="mt-4 font-extrabold">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p><ArrowRight className="mt-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-700" /></Link>)}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="tarefas" className="scroll-mt-24 border-b border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Comece pela sua situação</p><h2 className="rj-display mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Não é uma lista de ferramentas. É um caminho até o resultado.</h2></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{journeys.map((journey, index) => <article key={journey.href} className={`group flex min-h-[360px] flex-col rounded-[2rem] border p-7 ${index === 0 ? 'border-emerald-200 bg-emerald-950 text-white' : 'border-slate-200 bg-[#f7f8f5]'}`}><journey.icon className={`h-7 w-7 ${index === 0 ? 'text-amber-300' : 'text-emerald-700'}`} /><p className={`mt-10 text-xs font-black uppercase tracking-[0.17em] ${index === 0 ? 'text-emerald-200' : 'text-slate-500'}`}>{journey.eyebrow}</p><h3 className="rj-display mt-3 text-3xl font-black leading-tight">{journey.title}</h3><p className={`mt-4 flex-1 text-sm leading-7 ${index === 0 ? 'text-emerald-100' : 'text-slate-600'}`}>{journey.text}</p><Link href={journey.href} className={`mt-7 inline-flex items-center gap-2 text-sm font-extrabold ${index === 0 ? 'text-amber-300' : 'text-emerald-800'}`}>{journey.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></article>)}</div></div></section>

      <section className="border-b border-slate-200"><div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"><div className="lg:sticky lg:top-28"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Mais procuradas</p><h2 className="rj-display mt-3 text-4xl font-black tracking-[-0.035em]">Atalhos para o que você precisa hoje.</h2><p className="mt-4 text-sm leading-7 text-slate-600">Cada página mostra o resultado esperado antes de pedir qualquer dado.</p></div><ul className="divide-y divide-slate-200 border-y border-slate-200">{paths.map((item, index) => <li key={item.href}><Link href={item.href} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 sm:gap-6"><span className="text-xs font-black text-slate-300">0{index + 1}</span><span><strong className="block text-lg group-hover:text-emerald-800">{item.label}</strong><span className="mt-1 block text-sm text-slate-500">{item.note}</span></span><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-700" /></Link></li>)}</ul></div></section>

      <section className="bg-slate-950 text-white"><div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Feito para ser útil</p><h2 className="rj-display mt-3 max-w-2xl text-4xl font-black tracking-[-0.035em] sm:text-5xl">Menos promessa. Mais clareza antes de clicar.</h2><p className="mt-5 max-w-xl text-base leading-8 text-slate-300">Você vê o que a ferramenta faz, quais dados precisa informar e como será o resultado. Sem texto inflado para esconder uma experiência vazia.</p></div><div className="grid gap-3">{[{ icon: Search, title: 'Encontre pela tarefa', text: 'Busque como você falaria, sem decorar nomes.' }, { icon: ShieldCheck, title: 'Dados sob controle', text: 'Ferramentas locais informam quando o arquivo não sai do navegador.' }, { icon: BadgeCheck, title: 'Resultado verificável', text: 'Exemplos, memória de cálculo e documentos visualizados antes de baixar.' }].map((item) => <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"><item.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /><div><h3 className="font-extrabold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{item.text}</p></div></div>)}</div></div></section>
    </div>
  );
}
