import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HUBS = [
  {
    href: '/recibos',
    title: 'Recibos para cada situação',
    description: 'Pagamento, serviço, MEI, autônomo, Pix, aluguel, assinatura e PDF.'
  },
  {
    href: '/rescisao',
    title: 'Rescisão trabalhista',
    description: 'Cálculo, aviso-prévio, FGTS, férias e dúvidas por tipo de desligamento.'
  },
  {
    href: '/redacao-enem',
    title: 'Redação ENEM',
    description: 'Correção, competências, repertório, estrutura e preparação para a prova.'
  },
  {
    href: '/pix',
    title: 'Ferramentas Pix',
    description: 'QR Code, Copia e Cola, orçamento, cobrança e recibo de pagamento.'
  },
  {
    href: '/pdf',
    title: 'Ferramentas para PDF',
    description: 'Juntar, dividir, comprimir, editar e organizar documentos no navegador.'
  }
] as const;

export function StrategicHubs({ compact = false }: { compact?: boolean }) {
  return (
    <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="strategic-hubs-title">
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${compact ? 'py-10' : 'py-14 sm:py-16'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Guias e ferramentas por assunto</p>
        <h2 id="strategic-hubs-title" className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          Resolva o problema completo, não apenas uma etapa
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Entre pelo assunto que você precisa e encontre calculadoras, geradores, modelos e respostas relacionadas.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HUBS.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <h3 className="font-bold text-slate-950">{hub.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{hub.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-sky-700">
                Explorar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
