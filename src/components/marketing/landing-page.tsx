import Link from 'next/link';
import { ArrowRight, BadgeCheck, Calculator, Check, FileCheck2, FileText, ImageIcon, Receipt, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { HomeQuickSearch } from '@/components/marketing/home-quick-search';
import { CategoryExplorer } from '@/components/marketing/category-explorer';

const quickActions = [
  { href: '/orcamento-com-pix', label: 'Orçamento + Pix', note: 'Envie, aprove e cobre no WhatsApp', icon: FileCheck2, tone: 'bg-[#effbdc] text-[#315f00]' },
  { href: '/gerador-de-recibo', label: 'Criar recibo', note: 'Preencha, baixe e compartilhe', icon: Receipt, tone: 'bg-[#eef5ff] text-[#0b5cff]' },
  { href: '/calculadora-de-rescisao', label: 'Calcular rescisão', note: 'Veja uma estimativa detalhada', icon: Calculator, tone: 'bg-[#f3f7ff] text-[#031f4b]' },
  { href: '/pdf', label: 'Ferramentas de PDF', note: 'Edite, comprima, junte e converta', icon: FileText, tone: 'bg-[#eef5ff] text-[#0b5cff]' },
] as const;

const popularNow = [
  { href: '/gerador-de-contrato', label: 'Criar contrato', note: 'Partes, cláusulas e PDF', icon: FileText },
  { href: '/gerador-de-proposta-comercial', label: 'Proposta comercial', note: 'Apresente escopo, prazo e valor', icon: FileCheck2 },
  { href: '/calculadora-de-preco-freelancer', label: 'Calcular preço freelancer', note: 'Transforme custos e horas em preço', icon: Calculator },
  { href: '/comprimir-redimensionar-imagem', label: 'Comprimir imagem', note: 'Reduza sem enviar o arquivo', icon: ImageIcon }
] as const;

const journeys = [
  { eyebrow: 'Recebeu um pagamento', title: 'Registre sem improvisar no WhatsApp.', text: 'Escolha o tipo de recibo, confira um exemplo preenchido e gere o PDF com os dados certos.', href: '/recibos', action: 'Encontrar meu recibo', icon: Receipt },
  { eyebrow: 'Vai prestar um serviço', title: 'Do preço combinado ao pagamento.', text: 'Monte o orçamento, envie para aprovação, cobre por Pix e emita o recibo no mesmo fluxo.', href: '/orcamento-com-pix', action: 'Montar um orçamento', icon: FileCheck2 },
  { eyebrow: 'Precisa calcular', title: 'Entenda o resultado, não só o número.', text: 'Use calculadoras com memória de cálculo, contexto e próximos passos para conferir o cenário.', href: '/calculadora-de-rescisao', action: 'Ver calculadoras', icon: Calculator }
] as const;

export function LandingPage() {
  return (
    <div className="bg-[#f8faf7] text-[#031f4b]">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0b5cff] to-transparent" />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(520px,0.98fr)] lg:items-center lg:gap-20 lg:px-10 lg:pb-24 lg:pt-20 2xl:px-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#83d600]/60 bg-white px-3 py-1.5 text-xs font-bold text-[#315f00] shadow-sm"><Sparkles className="h-3.5 w-3.5 text-[#0b5cff]" /> Ferramentas úteis, sem enrolação</div>
            <h1 className="rj-display mt-6 max-w-3xl text-[clamp(2.7rem,6vw,5.2rem)] font-black leading-[0.94] tracking-[-0.05em] text-[#031f4b]">Resolva agora. <span className="text-[#0b5cff]">Saia com algo pronto.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">Precisou mandar um orçamento, emitir recibo, calcular a rescisão ou resolver um PDF? Tá pronto.</p>
            <div className="mt-7 max-w-2xl"><HomeQuickSearch /></div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">{['Sem instalar nada', 'Comece grátis', 'Funciona no celular'].map((item) => <li key={item} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#69ad00]" />{item}</li>)}</ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(11,92,255,0.16),rgba(131,214,0,0.10)_48%,transparent_72%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between border-b border-[#0b5cff]/10 px-5 py-4"><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#031f4b]" /><span className="h-2.5 w-2.5 rounded-full bg-[#0b5cff]" /><span className="h-2.5 w-2.5 rounded-full bg-[#83d600]" /></div><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#031f4b]/45">Precisou, Tá Pronto</span></div>
              <div className="p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0b5cff]">Produtos em destaque</p><p className="mt-2 text-sm leading-6 text-slate-500">Quatro soluções para lembrar. As demais continuam no catálogo.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{quickActions.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-[#0b5cff]/15 p-4 transition hover:-translate-y-0.5 hover:border-[#0b5cff]/45 hover:shadow-md"><span className={`grid h-9 w-9 place-items-center rounded-xl ${item.tone}`}><item.icon className="h-4 w-4" /></span><p className="mt-4 font-extrabold text-[#031f4b]">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p><ArrowRight className="mt-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0b5cff]" /></Link>)}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="tarefas" className="scroll-mt-24 border-b border-[#0b5cff]/10 bg-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]">Comece pela sua situação</p><h2 className="rj-display mt-3 text-4xl font-black tracking-[-0.035em] text-[#031f4b] sm:text-5xl">Não é uma lista de ferramentas. É um caminho até o resultado.</h2></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{journeys.map((journey, index) => <article key={journey.href} className={`group flex min-h-[360px] flex-col rounded-[2rem] border p-7 ${index === 0 ? 'border-[#0b5cff]/50 bg-[#031f4b] text-white' : 'border-[#0b5cff]/15 bg-[#f8faf7]'}`}><journey.icon className={`h-7 w-7 ${index === 0 ? 'text-[#83d600]' : 'text-[#0b5cff]'}`} /><p className={`mt-10 text-xs font-black uppercase tracking-[0.17em] ${index === 0 ? 'text-[#a9ed42]' : 'text-slate-500'}`}>{journey.eyebrow}</p><h3 className="rj-display mt-3 text-3xl font-black leading-tight">{journey.title}</h3><p className={`mt-4 flex-1 text-sm leading-7 ${index === 0 ? 'text-blue-100' : 'text-slate-600'}`}>{journey.text}</p><Link href={journey.href} className={`mt-7 inline-flex items-center gap-2 text-sm font-extrabold ${index === 0 ? 'text-[#a9ed42]' : 'text-[#0b5cff]'}`}>{journey.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></article>)}</div></div></section>

      <section className="border-b border-[#0b5cff]/10 bg-[#f8faf7]"><div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"><div className="lg:sticky lg:top-28"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]">Em destaque agora</p><h2 className="rj-display mt-3 text-4xl font-black tracking-[-0.035em] text-[#031f4b]">Outras tarefas que estão resolvendo o dia.</h2><p className="mt-4 text-sm leading-7 text-slate-600">Sugestões diferentes dos atalhos do topo, para ampliar sua descoberta sem repetir caminhos.</p></div><ul className="divide-y divide-[#0b5cff]/10 border-y border-[#0b5cff]/10">{popularNow.map((item) => <li key={item.href}><Link href={item.href} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 sm:gap-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#0b5cff] ring-1 ring-[#0b5cff]/15"><item.icon className="h-4 w-4" /></span><span><strong className="block text-lg text-[#031f4b] group-hover:text-[#0b5cff]">{item.label}</strong><span className="mt-1 block text-sm text-slate-500">{item.note}</span></span><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0b5cff]" /></Link></li>)}</ul></div></section>

      <section id="catalogo" className="scroll-mt-24 border-b border-[#0b5cff]/10 bg-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5cff]">Catálogo por área</p><h2 className="rj-display mt-3 text-4xl font-black tracking-[-0.035em] text-[#031f4b] sm:text-5xl">Filtre pelo tipo de resultado que precisa.</h2><p className="mt-5 text-base leading-8 text-slate-600">Finanças, documentos, carreira, PDFs e outras tarefas organizadas para você comparar opções sem percorrer uma lista interminável.</p></div><div className="mt-10"><CategoryExplorer /></div></div></section>

      <section className="relative bg-[#031f4b] text-white before:absolute before:inset-x-0 before:top-0 before:h-20 before:-translate-y-full before:bg-gradient-to-b before:from-transparent before:to-[#031f4b]/10"><div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_0.8fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#a9ed42]">Confiança antes da ação</p><h2 className="rj-display mt-3 max-w-2xl text-4xl font-black tracking-[-0.035em] sm:text-5xl">Menos promessa. Mais clareza antes de clicar.</h2><p className="mt-5 max-w-xl text-base leading-8 text-blue-100">Você vê o que a ferramenta faz, quais dados precisa informar e como será o resultado. Sem texto inflado para esconder uma experiência vazia.</p><Link href="/qualidade-e-seguranca" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#a9ed42]">Conhecer nossos critérios <ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-3">{[{ icon: Search, title: 'Encontre pela tarefa', text: 'Busque como você falaria, sem decorar nomes.' }, { icon: ShieldCheck, title: 'Dados sob controle', text: 'Ferramentas locais informam quando o arquivo não sai do navegador.' }, { icon: BadgeCheck, title: 'Resultado verificável', text: 'Exemplos, memória de cálculo e documentos visualizados antes de baixar.' }].map((item) => <div key={item.title} className="flex gap-4 rounded-2xl border border-[#0b5cff]/35 bg-white/5 p-5"><item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#83d600]" /><div><h3 className="font-extrabold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-blue-100/75">{item.text}</p></div></div>)}</div></div></section>
    </div>
  );
}
