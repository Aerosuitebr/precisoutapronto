import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { GameEntry } from '@/lib/games/games';
import type { HardwareGuide } from '@/lib/games/hardware';
import type { GameStore } from '@/lib/games/stores';
import { cn } from '@/lib/utils';

/** Painel legível sobre o fundo collage (títulos e intros). */
export function GamesReadablePanel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-md sm:p-8',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionAccent({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -left-3 top-0 hidden h-full w-1 rounded-full bg-gradient-to-b from-teal-400 to-amber-300 sm:block"
        aria-hidden
      />
      {children}
    </div>
  );
}

export function SetupTable({ game }: { game: GameEntry }) {
  const rows = [
    { label: 'CPU', min: game.setupMin.cpu, rec: game.setupRec.cpu },
    { label: 'GPU', min: game.setupMin.gpu, rec: game.setupRec.gpu },
    { label: 'RAM', min: game.setupMin.ram, rec: game.setupRec.ram },
    { label: 'Armazenamento', min: game.setupMin.storage, rec: game.setupRec.storage }
  ];
  const note = [game.setupMin.note, game.setupRec.note].filter(Boolean).join(' ');

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Mobile: cards empilhados, texto inteiro, sem scroll horizontal */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-extrabold tracking-tight text-teal-700">{row.label}</h3>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Mínimo
                </dt>
                <dd className="mt-1 break-words text-sm leading-6 text-slate-700">{row.min}</dd>
              </div>
              <div className="rounded-xl bg-teal-50/80 px-3 py-2.5">
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700/80">
                  Recomendado
                </dt>
                <dd className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800">
                  {row.rec}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {/* Desktop: tabela completa */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[36rem] table-fixed text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-[22%] px-4 py-3 font-semibold">Peça</th>
                <th className="w-[39%] px-4 py-3 font-semibold">Mínimo</th>
                <th className="w-[39%] px-4 py-3 font-semibold">Recomendado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 align-top font-semibold text-teal-700">{row.label}</td>
                  <td className="px-4 py-3 align-top break-words text-slate-700">{row.min}</td>
                  <td className="px-4 py-3 align-top break-words text-slate-700">{row.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {note ? (
        <p className="mt-3 break-words rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function GameCard({ game, className }: { game: GameEntry; className?: string }) {
  return (
    <Link
      href={`/games/jogos/${game.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md',
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-300 opacity-80" />
      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className="rj-display shrink-0 text-2xl font-black text-teal-600">#{game.rank}</span>
        <span className="max-w-[70%] break-words rounded-full bg-slate-100 px-2.5 py-1 text-right text-[11px] font-semibold uppercase leading-4 tracking-wide text-slate-500">
          {game.platforms.join(' · ')}
        </span>
      </div>
      <h3 className="rj-display mt-4 break-words text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-800">
        {game.title}
      </h3>
      <p className="mt-3 flex-1 break-words text-base leading-7 text-slate-700">{game.blurb}</p>
      <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
        Ver setup
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}

export function HardwareCard({ guide }: { guide: HardwareGuide }) {
  return (
    <Link
      href={`/games/hardware/${guide.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600">Guia</p>
      <h3 className="rj-display mt-2 text-xl font-extrabold text-slate-900 group-hover:text-amber-800">
        {guide.title}
      </h3>
      <p className="mt-3 text-base leading-7 text-slate-700">{guide.description}</p>
      <p className="mt-5 text-sm font-semibold text-slate-500">{guide.readTime} de leitura</p>
    </Link>
  );
}

export function StoreCard({ store }: { store: GameStore }) {
  return (
    <a
      href={store.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="rj-display text-base font-extrabold text-slate-900">{store.name}</h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          {store.kind}
        </span>
      </div>
      <p className="mt-3 text-base leading-7 text-slate-700">{store.blurb}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{store.trustNote}</p>
    </a>
  );
}

export function ProductBridge() {
  return (
    <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        Também no Resolva Jato
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href="/ferramentas/divisor-conta"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold leading-5 text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
        >
          Rateio Game Pass / assinatura
        </Link>
        <Link
          href="/gerador-de-qr-code-pix"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold leading-5 text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
        >
          Cobrar coach no Pix
        </Link>
      </div>
    </aside>
  );
}
