import Link from 'next/link';
import { ArrowRight, Crosshair, Gamepad2, Joystick, Sparkles } from 'lucide-react';
import type { GameEntry } from '@/lib/games/games';
import type { HardwareGuide } from '@/lib/games/hardware';
import type { GameStore } from '@/lib/games/stores';
import { cn } from '@/lib/utils';

const HERO_POSTERS = [
  { title: 'CS2', subtitle: 'FPS tático', tone: 'from-orange-500 to-amber-600' },
  { title: 'LoL', subtitle: 'MOBA', tone: 'from-sky-500 to-blue-700' },
  { title: 'Valorant', subtitle: 'Tático', tone: 'from-rose-500 to-red-700' },
  { title: 'GTA V', subtitle: 'Mundo aberto', tone: 'from-emerald-500 to-teal-700' },
  { title: 'Minecraft', subtitle: 'Sandbox', tone: 'from-lime-500 to-green-700' },
  { title: 'Fortnite', subtitle: 'Battle royale', tone: 'from-violet-500 to-indigo-700' },
  { title: 'Elden Ring', subtitle: 'Action RPG', tone: 'from-yellow-600 to-stone-800' },
  { title: 'Free Fire', subtitle: 'Mobile', tone: 'from-cyan-500 to-slate-800' }
] as const;

export function GamesHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.22),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(251,191,36,0.14),transparent_50%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" />
      <div className="absolute inset-0 opacity-[0.4] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="absolute -right-4 top-6 hidden w-[min(52%,30rem)] -rotate-1 grid-cols-2 gap-3 sm:grid lg:right-6 lg:top-8 lg:w-[28rem] lg:rotate-2">
        {HERO_POSTERS.slice(0, 6).map((poster, index) => (
          <div
            key={poster.title}
            className={cn(
              'relative min-h-[7.5rem] overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-xl shadow-slate-900/10 ring-1 ring-white/50',
              poster.tone,
              index % 2 === 1 ? 'translate-y-6' : 'translate-y-0'
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
              {poster.subtitle}
            </p>
            <p className="rj-display mt-2 text-2xl font-black tracking-tight drop-shadow-sm">
              {poster.title}
            </p>
            <span className="absolute -bottom-4 -right-3 opacity-25">
              {index % 3 === 0 ? (
                <Crosshair className="h-20 w-20" />
              ) : index % 3 === 1 ? (
                <Joystick className="h-20 w-20" />
              ) : (
                <Gamepad2 className="h-20 w-20" />
              )}
            </span>
          </div>
        ))}
      </div>
      <Sparkles className="absolute left-[8%] top-10 h-5 w-5 text-teal-500/55" />
      <Sparkles className="absolute bottom-16 left-[18%] h-4 w-4 text-amber-500/45" />
      <Joystick className="absolute bottom-10 right-[42%] hidden h-8 w-8 text-slate-300/70 lg:block" />
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

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Peça</th>
            <th className="px-4 py-3 font-semibold">Mínimo</th>
            <th className="px-4 py-3 font-semibold">Recomendado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 font-semibold text-teal-700">{row.label}</td>
              <td className="px-4 py-3 text-slate-700">{row.min}</td>
              <td className="px-4 py-3 text-slate-700">{row.rec}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(game.setupMin.note || game.setupRec.note) && (
        <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
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
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md',
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-300 opacity-80" />
      <div className="flex items-center justify-between gap-3">
        <span className="rj-display text-2xl font-black text-teal-600">#{game.rank}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {game.platforms.join(' · ')}
        </span>
      </div>
      <h3 className="rj-display mt-3 text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-teal-800">
        {game.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{game.blurb}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
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
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600">Guia</p>
      <h3 className="rj-display mt-2 text-lg font-extrabold text-slate-900 group-hover:text-amber-800">
        {guide.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p>
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
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="rj-display text-base font-extrabold text-slate-900">{store.name}</h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          {store.kind}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{store.blurb}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{store.trustNote}</p>
    </a>
  );
}

export function ProductBridge() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        Também no Resolva Jato
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/ferramentas/divisor-conta"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
        >
          Rateio Game Pass / assinatura
        </Link>
        <Link
          href="/gerador-de-qr-code-pix"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
        >
          Cobrar coach no Pix
        </Link>
      </div>
    </aside>
  );
}
