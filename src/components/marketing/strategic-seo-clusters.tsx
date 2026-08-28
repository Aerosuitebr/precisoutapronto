import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CLUSTERS = [
  {
    href: '/modelos-de-orcamento',
    title: 'Orçamentos por profissão',
    description: 'Modelos preenchidos, aprovação pelo WhatsApp e cobrança por Pix.'
  },
  {
    href: '/recibos',
    title: 'Recibos e comprovantes',
    description: 'Modelos para serviços, Pix, aluguel, MEI e pagamentos em geral.'
  },
  {
    href: '/calculadora-de-preco-freelancer',
    title: 'Precificação de serviços',
    description: 'Calcule custos, horas produtivas, impostos, risco e margem.'
  }
] as const;

export function StrategicSeoClusters({ current }: { current?: (typeof CLUSTERS)[number]['href'] }) {
  return (
    <section aria-labelledby="strategic-clusters-title" className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Fluxo do prestador</p>
        <h2 id="strategic-clusters-title" className="precisoutapronto-display mt-2 text-2xl font-extrabold text-slate-950">
          Defina o preço, envie o orçamento e registre o pagamento
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {CLUSTERS.map((cluster) => (
            <Link
              key={cluster.href}
              href={cluster.href}
              aria-current={current === cluster.href ? 'page' : undefined}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-white"
            >
              <h3 className="font-extrabold text-slate-950">{cluster.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{cluster.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-sky-700">
                {current === cluster.href ? 'Explorar este tema' : 'Continuar'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
