import Link from 'next/link';
import { ArrowRight, Calculator, FileText, QrCode, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HomeQuickSearch } from '@/components/marketing/home-quick-search';

const usefulTools = [
  { href: '/gerador-de-recibo', name: 'Recibo em PDF', description: 'Valor por extenso, assinatura e modelos prontos.', icon: Receipt, tone: 'bg-emerald-50 text-emerald-700' },
  { href: '/gerador-de-qr-code-pix', name: 'QR Code Pix', description: 'QR e Copia e Cola sem taxa e sem cadastro.', icon: QrCode, tone: 'bg-sky-50 text-sky-700' },
  { href: '/orcamento-com-pix', name: 'Orçamento com Pix', description: 'Envie, aprove e cobre pelo WhatsApp.', icon: FileText, tone: 'bg-violet-50 text-violet-700' },
  { href: '/calculadora-de-rescisao', name: 'Rescisão', description: 'Estime verbas, aviso e FGTS.', icon: Calculator, tone: 'bg-amber-50 text-amber-700' },
  { href: '/calculadora-de-ferias', name: 'Férias', description: 'Calcule férias e adicional de um terço.', icon: Calculator, tone: 'bg-rose-50 text-rose-700' },
  { href: '/calculadora-de-decimo-terceiro', name: '13º salário', description: 'Veja parcelas e valor proporcional.', icon: Calculator, tone: 'bg-blue-50 text-blue-700' }
] as const;

export function UsefulToolsStrip({ currentPath, className, title = 'Mais ferramentas para resolver de verdade' }: { currentPath?: string; className?: string; title?: string }) {
  const tools = usefulTools.filter((tool) => tool.href !== currentPath).slice(0, 6);
  return (
    <section className={cn('border-y border-slate-200 bg-slate-50', className)} aria-labelledby="ferramentas-uteis-title">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#155eef]">Continue resolvendo</p><h2 id="ferramentas-uteis-title" className="precisoutapronto-display mt-3 text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Ferramentas gratuitas para organizar, cobrar, documentar e apresentar melhor o seu trabalho.</p></div>
          <Link href="/guias" className="inline-flex items-center gap-2 text-sm font-black text-[#155eef]">Ver guias dos temas <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#155eef]">Encontre pelo que você precisa fazer</p>
          <h3 className="precisoutapronto-display mt-2 text-2xl font-black tracking-[-.035em] text-slate-950 sm:text-3xl">Será que encontro essa ferramenta aqui?</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Escreva sua tarefa com suas palavras. Nós mostramos as ferramentas mais relacionadas e levamos você direto à melhor opção.</p>
          <div className="mt-5"><HomeQuickSearch /></div>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => <li key={tool.href}><Link href={tool.href} className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"><span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', tool.tone)}><tool.icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-black text-slate-900">{tool.name}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{tool.description}</span></span><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#155eef]" /></Link></li>)}
        </ul>
      </div>
    </section>
  );
}
