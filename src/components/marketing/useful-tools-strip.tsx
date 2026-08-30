import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Calculator, FileSignature, QrCode, Receipt, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const usefulTools = [
  { href: '/gerador-de-recibo', name: 'Recibo em PDF', description: 'Valor por extenso, assinatura e modelos prontos.', icon: Receipt, tone: 'bg-emerald-50 text-emerald-700' },
  { href: '/gerador-de-qr-code-pix', name: 'QR Code Pix', description: 'QR e Copia e Cola sem taxa e sem cadastro.', icon: QrCode, tone: 'bg-sky-50 text-sky-700' },
  { href: '/gerador-de-proposta-comercial', name: 'Proposta comercial', description: 'Escopo, investimento e PDF profissional.', icon: BriefcaseBusiness, tone: 'bg-violet-50 text-violet-700' },
  { href: '/gerador-de-contrato', name: 'Contratos', description: 'Organize o combinado antes de começar.', icon: FileSignature, tone: 'bg-amber-50 text-amber-700' },
  { href: '/calculadora-de-preco-freelancer', name: 'Preço do serviço', description: 'Calcule custos, margem e valor por hora.', icon: Calculator, tone: 'bg-rose-50 text-rose-700' },
  { href: '/gerador-de-curriculo', name: 'Currículo', description: 'Monte e baixe um currículo profissional.', icon: ScrollText, tone: 'bg-blue-50 text-blue-700' }
] as const;

export function UsefulToolsStrip({ currentPath, className, title = 'Mais ferramentas para resolver de verdade' }: { currentPath?: string; className?: string; title?: string }) {
  const tools = usefulTools.filter((tool) => tool.href !== currentPath).slice(0, 6);
  return (
    <section className={cn('border-y border-slate-200 bg-slate-50', className)} aria-labelledby="ferramentas-uteis-title">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#155eef]">Continue resolvendo</p><h2 id="ferramentas-uteis-title" className="precisoutapronto-display mt-3 text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Ferramentas gratuitas para organizar, cobrar, documentar e apresentar melhor o seu trabalho.</p></div>
          <Link href="/recursos" className="inline-flex items-center gap-2 text-sm font-black text-[#155eef]">Ver todas as ferramentas <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => <li key={tool.href}><Link href={tool.href} className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"><span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', tool.tone)}><tool.icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-black text-slate-900">{tool.name}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{tool.description}</span></span><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#155eef]" /></Link></li>)}
        </ul>
      </div>
    </section>
  );
}
