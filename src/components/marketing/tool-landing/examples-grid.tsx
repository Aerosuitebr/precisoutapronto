import Link from 'next/link';
import type { ReactNode } from 'react';

export interface ToolLandingExampleItem {
  title: string;
  description: string;
  href: string;
  /** Miniatura real do modelo (preferível a imagem estática). */
  thumbnail: ReactNode;
}

export function ToolLandingExamples({ examples }: { examples: ToolLandingExampleItem[] }) {
  if (examples.length === 0) return null;

  return (
    <section id="exemplos" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-800">Modelos prontos</p>
      <h2 className="rj-display mt-3 max-w-xl text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
        Compare os modelos lado a lado e escolha o seu.
      </h2>
      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-700">
        Cada modelo já vem preenchido com um exemplo real, pra você ver o resultado antes de começar.
      </p>
      <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {examples.map((example) => (
          <li
            key={example.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-[24px]"
          >
            <div className="relative flex aspect-[4/3] w-full items-start justify-center overflow-hidden bg-slate-100 p-3 sm:p-4">
              <div className="pointer-events-none w-full max-w-[200px] origin-top scale-[0.55] shadow-lg sm:max-w-[220px] sm:scale-[0.62] sm:transition-transform sm:duration-300 sm:group-hover:scale-[0.66]">
                {example.thumbnail}
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900">{example.title}</h3>
              <p className="mt-1.5 flex-1 text-sm font-medium leading-6 text-slate-700">{example.description}</p>
              <Link
                href={example.href}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Usar este modelo
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
