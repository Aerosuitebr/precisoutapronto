import type { Metadata } from 'next';
import { consoleBlocks } from '@/lib/games/consoles';
import { ProductBridge } from '@/components/games/games-ui';

export const metadata: Metadata = {
  title: 'Dicas de consoles: PlayStation, Xbox e Nintendo',
  description:
    'Guia evergreen de consoles com dicas práticas, acessórios e cuidados para PlayStation, Xbox e Nintendo.',
  alternates: { canonical: '/games/consoles' }
};

export default function ConsolesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Consoles</p>
      <h1 className="rj-display mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        PlayStation, Xbox e Nintendo
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        Dicas evergreen de uso, armazenamento e acessórios. Sem changelog de patch.
      </p>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {consoleBlocks.map((block) => (
          <article
            key={block.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <h2 className="rj-display text-xl font-extrabold text-white">{block.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{block.blurb}</p>
            <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-cyan-300">Dicas</h3>
            <ul className="mt-2 space-y-2">
              {block.tips.map((tip) => (
                <li key={tip} className="text-sm leading-6 text-slate-300">
                  {tip}
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-amber-300">
              Acessórios úteis
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              {block.accessories.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <ProductBridge />
      </div>
    </div>
  );
}
