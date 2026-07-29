import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { JATO_GAMES } from '@/lib/games/brand';
import { cn } from '@/lib/utils';

export function GamesHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={JATO_GAMES.path} className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/30">
            <Gamepad2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="rj-display block truncate text-base font-extrabold tracking-tight text-white">
              {JATO_GAMES.name}
            </span>
            <span className="hidden text-[11px] text-slate-400 sm:block">{JATO_GAMES.tagline}</span>
          </span>
        </Link>
        <nav aria-label="Jato Games" className="hidden items-center gap-1 md:flex">
          {JATO_GAMES.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/busca?categoria=games"
          className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 md:hidden"
        >
          Busca
        </Link>
      </div>
      <nav
        aria-label="Jato Games mobile"
        className="flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden"
      >
        {JATO_GAMES.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function GamesFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#05080f]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-slate-200">{JATO_GAMES.name}</span>
          {' · '}
          Conteúdo evergreen sobre jogos, setups e lojas.
        </p>
        <p>
          Powered by{' '}
          <Link href={JATO_GAMES.poweredByHref} className="font-semibold text-cyan-300 hover:underline">
            {JATO_GAMES.poweredBy}
          </Link>
        </p>
      </div>
    </footer>
  );
}

export function GamesShell({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-[#070b14] text-slate-100', className)}>
      <GamesHeader />
      <main className="flex-1">{children}</main>
      <GamesFooter />
    </div>
  );
}
