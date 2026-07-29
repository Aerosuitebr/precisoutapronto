import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Cpu,
  ExternalLink,
  Gamepad2,
  Monitor,
  QrCode,
  Split,
  Wrench
} from 'lucide-react';
import type { GameEntry } from '@/lib/games/games';
import type { HardwareGuide } from '@/lib/games/hardware';
import type { GameStore } from '@/lib/games/stores';
import { gameHeroTheme, getGameStoreLinks } from '@/lib/games/game-links';
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
        'rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 sm:p-8',
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
        <p className="mt-3 break-words rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function GamesHeroArt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-cyan-50 to-amber-50 p-6',
        className
      )}
      aria-hidden
    >
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-teal-300/30 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-amber-300/25 blur-2xl" />
      <div className="relative grid w-full max-w-sm grid-cols-2 gap-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
          <Gamepad2 className="h-8 w-8 text-teal-600" />
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Top jogos</p>
          <p className="rj-display text-lg font-extrabold text-slate-900">Setup pronto</p>
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
          <Cpu className="h-8 w-8 text-amber-600" />
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hardware</p>
          <p className="rj-display text-lg font-extrabold text-slate-900">Sem desperdício</p>
        </div>
        <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-sm">
          <Monitor className="h-6 w-6 shrink-0 text-cyan-600" />
          <p className="text-sm font-semibold leading-5 text-slate-800">
            Ranking, guias e lojas em um só lugar
          </p>
        </div>
      </div>
    </div>
  );
}

function rankBarClass(rank: number) {
  if (rank === 1) return 'from-teal-500 via-emerald-400 to-teal-300';
  if (rank <= 4) return 'from-cyan-500 via-sky-400 to-blue-400';
  if (rank <= 7) return 'from-indigo-400 via-sky-400 to-cyan-300';
  return 'from-amber-400 via-yellow-300 to-orange-300';
}

export function GameCard({
  game,
  className,
  featured = false
}: {
  game: GameEntry;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/games/jogos/${game.slug}`}
      className={cn(
        'group relative flex h-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5 transition duration-200 hover:-translate-y-1 hover:border-teal-400 hover:shadow-[0_22px_44px_-16px_rgba(15,23,42,0.55)]',
        featured
          ? 'flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8'
          : 'flex-col p-6',
        className
      )}
    >
      <div
        className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r opacity-90', rankBarClass(game.rank))}
      />
      <div
        className={cn(
          'flex shrink-0 items-start justify-between gap-3',
          featured && 'sm:flex-col sm:items-start sm:justify-center'
        )}
      >
        <span
          className={cn(
            'rj-display font-black leading-none text-teal-600',
            featured ? 'text-5xl sm:text-6xl' : 'text-4xl'
          )}
        >
          #{game.rank}
        </span>
        <span className="max-w-[70%] break-words rounded-full bg-slate-100 px-2.5 py-1 text-right text-[11px] font-semibold uppercase leading-4 tracking-wide text-slate-600 sm:max-w-none">
          {game.platforms.join(' · ')}
        </span>
      </div>
      <div className={cn('flex min-w-0 flex-1 flex-col', !featured && 'mt-4')}>
        {featured ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            Destaque do ranking
          </p>
        ) : null}
        <h3
          className={cn(
            'rj-display break-words font-extrabold tracking-tight text-slate-900 group-hover:text-teal-800',
            featured ? 'mt-1 text-2xl sm:text-3xl' : 'text-xl'
          )}
        >
          {game.title}
        </h3>
        <p className="mt-3 flex-1 break-words text-base leading-7 text-slate-800 sm:text-lg sm:leading-8">
          {game.blurb}
        </p>
        <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700">
          Ver setup
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

export function HardwareCard({ guide }: { guide: HardwareGuide }) {
  return (
    <Link
      href={`/games/hardware/${guide.slug}`}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5 transition duration-200 hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_22px_44px_-16px_rgba(15,23,42,0.55)]"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 opacity-90" />
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">Guia</p>
      <h3 className="rj-display mt-2 text-xl font-extrabold text-slate-900 group-hover:text-amber-800">
        {guide.title}
      </h3>
      <p className="mt-3 flex-1 text-base leading-7 text-slate-800 sm:text-lg sm:leading-8">
        {guide.description}
      </p>
      <p className="mt-5 text-sm font-bold text-slate-600">{guide.readTime} de leitura</p>
    </Link>
  );
}

export function StoreCard({ store }: { store: GameStore }) {
  return (
    <a
      href={store.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.5)]"
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

export function ProductBridge({ context = 'default' }: { context?: 'default' | 'game' }) {
  const isGame = context === 'game';

  return (
    <aside className="min-w-0 overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-teal-900/5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/25">
          <Wrench className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-800">
            {isGame ? 'Ferramentas para a galera' : 'Também no Resolva Jato'}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-800 sm:text-base">
            {isGame
              ? 'Depois do setup, organize a sessão com amigos sem planilha improvisada.'
              : 'Ferramentas práticas do hub para rateio de assinatura e cobrança rápida no Pix.'}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href="/ferramentas/divisor-conta"
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold leading-5 text-slate-900 shadow-sm transition hover:border-teal-400 hover:bg-teal-50"
        >
          <Split className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden />
          <span>Rateio de Game Pass / assinatura</span>
        </Link>
        <Link
          href="/gerador-de-qr-code-pix"
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold leading-5 text-slate-900 shadow-sm transition hover:border-teal-400 hover:bg-teal-50"
        >
          <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden />
          <span>Cobrar coach no Pix</span>
        </Link>
      </div>
    </aside>
  );
}

export function GameHero({ game }: { game: GameEntry }) {
  const theme = gameHeroTheme(game.slug);

  return (
    <header className="relative overflow-hidden rounded-[28px] border border-slate-200 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5">
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          theme.from,
          theme.via,
          theme.to
        )}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl',
          theme.glow
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
          backgroundSize: '22px 22px'
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/55 to-slate-950/25" />

      <div className="relative z-10 grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8 lg:p-10">
        <div className="min-w-0">
          <p className="inline-flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-white backdrop-blur-sm">
              #{game.rank}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-white/90 backdrop-blur-sm">
              {theme.label}
            </span>
            <span className="text-teal-100">{game.genres.join(' · ')}</span>
          </p>
          <h1 className="rj-display mt-4 break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {game.title}
          </h1>
          <p className="mt-4 max-w-2xl break-words text-base leading-7 text-white/95 sm:text-lg">
            {game.blurb}
          </p>
          <p className="mt-3 break-words text-sm font-semibold text-white/90">
            Plataformas: {game.platforms.join(', ')}
          </p>
        </div>
        <div
          className="rj-display hidden select-none text-[7rem] font-black leading-none text-white/15 sm:block lg:text-[9rem]"
          aria-hidden
        >
          #{game.rank}
        </div>
      </div>
    </header>
  );
}

export function GameTips({ tips }: { tips: string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {tips.map((tip) => (
        <li key={tip} className="flex gap-3 text-sm leading-6 text-slate-800">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          </span>
          <span className="min-w-0 break-words">{tip}</span>
        </li>
      ))}
    </ul>
  );
}

export function GameNextSteps({ game }: { game: GameEntry }) {
  const storeLinks = getGameStoreLinks(game);

  return (
    <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 shadow-sm ring-1 ring-teal-900/5 sm:p-6">
      <h2 className="rj-display text-xl font-extrabold text-slate-950">Próximo passo</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Use o setup acima como base e avance para cotação, lojas confiáveis ou a página oficial do
        jogo.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/games/hardware/escolher-placa-de-video"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500"
        >
          Ver guia da GPU
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/games/lojas"
          className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-slate-800 bg-white px-5 text-sm font-bold text-slate-900 transition hover:border-teal-700 hover:bg-teal-50"
        >
          Ver lojas de jogos e hardware
        </Link>
        {storeLinks.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:border-teal-400 hover:text-teal-900"
            >
              {link.label}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:border-teal-400 hover:text-teal-900"
            >
              {link.label}
            </Link>
          )
        )}
      </div>
    </section>
  );
}
