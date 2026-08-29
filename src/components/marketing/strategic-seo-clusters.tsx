import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CLUSTERS = [
  {
    href: '/guias/como-fazer-orcamento-com-pix',
    number: '01',
    title: 'Pedido no WhatsApp',
    description: 'Transforme a conversa em escopo, itens, prazo e condições.'
  },
  {
    href: '/modelos-de-orcamento',
    number: '02',
    title: 'Orçamento profissional',
    description: 'Comece por um modelo específico e ajuste à realidade do serviço.'
  },
  {
    href: '/orcamento-com-pix',
    number: '03',
    title: 'Aprovação do cliente',
    description: 'O cliente aprova ou pede ajuste sem instalar aplicativo.'
  },
  {
    href: '/gerador-de-qr-code-pix',
    number: '04',
    title: 'Cobrança Pix',
    description: 'Depois do aceite, facilite o pagamento com QR Code e Copia e Cola.'
  },
  {
    href: '/gerador-de-recibo',
    number: '05',
    title: 'Recibo',
    description: 'Registre o pagamento e entregue um documento claro ao cliente.'
  }
] as const;

export function StrategicSeoClusters({ current }: { current?: string }) {
  return (
    <section aria-labelledby="strategic-clusters-title" className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Fluxo do prestador</p>
        <h2 id="strategic-clusters-title" className="precisoutapronto-display mt-2 text-2xl font-extrabold text-slate-950">
          Do pedido no WhatsApp ao recibo, sem quebrar o fluxo
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CLUSTERS.map((cluster) => (
            <Link
              key={cluster.href}
              href={cluster.href}
              aria-current={current === cluster.href ? 'page' : undefined}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-white"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">Etapa {cluster.number}</p>
              <h3 className="mt-2 font-extrabold text-slate-950">{cluster.title}</h3>
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
