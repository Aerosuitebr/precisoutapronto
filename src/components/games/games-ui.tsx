import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { GameEntry } from '@/lib/games/games';
import type { HardwareGuide } from '@/lib/games/hardware';
import type { GameStore } from '@/lib/games/stores';
import { cn } from '@/lib/utils';

export function SetupTable({ game }: { game: GameEntry }) {
  const rows = [
    { label: 'CPU', min: game.setupMin.cpu, rec: game.setupRec.cpu },
    { label: 'GPU', min: game.setupMin.gpu, rec: game.setupRec.gpu },
    { label: 'RAM', min: game.setupMin.ram, rec: game.setupRec.ram },
    { label: 'Armazenamento', min: game.setupMin.storage, rec: game.setupRec.storage }
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Peça</th>
            <th className="px-4 py-3 font-semibold">Mínimo</th>
            <th className="px-4 py-3 font-semibold">Recomendado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-3 font-semibold text-cyan-200">{row.label}</td>
              <td className="px-4 py-3 text-slate-300">{row.min}</td>
              <td className="px-4 py-3 text-slate-300">{row.rec}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(game.setupMin.note || game.setupRec.note) && (
        <p className="border-t border-white/10 px-4 py-3 text-xs text-slate-400">
          {[game.setupMin.note, game.setupRec.note].filter(Boolean).join(' ')}
        </p>
      )}
    </div>
  );
}

export function GameCard({ game, className }: { game: GameEntry; className?: string }) {
  return (
    <Link
      href={`/games/jogos/${game.slug}`}
      className={cn(
        'group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.05]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rj-display text-2xl font-black text-cyan-300">#{game.rank}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {game.platforms.join(' · ')}
        </span>
      </div>
      <h3 className="rj-display mt-3 text-lg font-extrabold tracking-tight text-white group-hover:text-cyan-100">
        {game.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{game.blurb}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-300/40 hover:bg-white/[0.05]"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">Guia</p>
      <h3 className="rj-display mt-2 text-lg font-extrabold text-white group-hover:text-amber-100">
        {guide.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{guide.description}</p>
      <p className="mt-4 text-xs font-semibold text-slate-500">{guide.readTime} de leitura</p>
    </Link>
  );
}

export function StoreCard({ store }: { store: GameStore }) {
  return (
    <a
      href={store.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-300/40 hover:bg-white/[0.05]"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="rj-display text-base font-extrabold text-white">{store.name}</h3>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
          {store.kind}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{store.blurb}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{store.trustNote}</p>
    </a>
  );
}

export function ProductBridge() {
  return (
    <aside className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Também no Resolva Jato
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/ferramentas/divisor-conta"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/50 hover:text-cyan-100"
        >
          Rateio Game Pass / assinatura
        </Link>
        <Link
          href="/gerador-de-qr-code-pix"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/50 hover:text-cyan-100"
        >
          Cobrar coach no Pix
        </Link>
      </div>
    </aside>
  );
}
