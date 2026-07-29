import type { Metadata } from 'next';
import { consoleBlocks } from '@/lib/games/consoles';
import { GamesReadablePanel, ProductBridge, SectionAccent } from '@/components/games/games-ui';

export const metadata: Metadata = {
  title: 'Dicas de consoles: PlayStation, Xbox e Nintendo',
  description:
    'Guia evergreen de consoles com dicas práticas, acessórios e cuidados para PlayStation, Xbox e Nintendo.',
  alternates: { canonical: '/games/consoles' }
};

export default function ConsolesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionAccent>
        <GamesReadablePanel className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Consoles</p>
          <h1 className="rj-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            PlayStation, Xbox e Nintendo
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Dicas evergreen de uso, armazenamento e acessórios. Sem changelog de patch.
          </p>
        </GamesReadablePanel>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {consoleBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm"
            >
              <h2 className="rj-display text-xl font-extrabold text-slate-900">{block.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{block.blurb}</p>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-teal-700">Dicas</h3>
              <ul className="mt-2 space-y-2">
                {block.tips.map((tip) => (
                  <li key={tip} className="text-sm leading-6 text-slate-700">
                    {tip}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-amber-600">
                Acessórios úteis
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
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
      </SectionAccent>
    </div>
  );
}
