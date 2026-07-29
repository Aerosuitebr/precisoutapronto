import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { JATO_GAMES } from '@/lib/games/brand';
import { cn } from '@/lib/utils';

export function GamesHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href={JATO_GAMES.path} className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500 text-white shadow-sm shadow-teal-500/25">
            <Gamepad2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="rj-display block truncate text-lg font-extrabold tracking-tight text-slate-900">
              {JATO_GAMES.name}
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">{JATO_GAMES.tagline}</span>
          </span>
        </Link>
        <nav aria-label="Jato Games" className="hidden items-center gap-0.5 md:flex">
          {JATO_GAMES.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2.5 text-[15px] font-bold text-slate-800 transition hover:bg-teal-50 hover:text-teal-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/busca?categoria=games"
          className="rounded-lg bg-teal-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500 md:hidden"
        >
          Busca
        </Link>
      </div>
      {/* Nav com scroll horizontal isolado para nao puxar a pagina no eixo Y */}
      <nav
        aria-label="Jato Games mobile"
        className="flex touch-pan-x gap-1.5 overflow-x-auto overscroll-x-contain border-t border-slate-200/80 px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {JATO_GAMES.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-800"
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
    <footer className="relative z-10 mt-auto border-t border-white/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-slate-800">{JATO_GAMES.name}</span>
          {' · '}
          Conteúdo evergreen sobre jogos, setups e lojas.
        </p>
        <p>
          Powered by{' '}
          <Link href={JATO_GAMES.poweredByHref} className="font-semibold text-teal-700 hover:underline">
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
    <div
      className={cn(
        // svh = altura com a barra do browser visivel; evita loop sobe/desce do 100vh no mobile
        'relative flex min-h-svh flex-col overscroll-x-none text-slate-800',
        className
      )}
    >
      {/* Fundo suave: collage atenuada + velatura (menos fadiga visual) */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-teal-50/40 to-amber-50/30" />
        <div
          className="absolute inset-0 bg-[url('/background_games.png')] bg-cover bg-[center_35%] bg-no-repeat opacity-[0.28] sm:bg-center sm:opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-white/70 sm:bg-white/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/60" />
      </div>

      <GamesHeader />
      <main className="relative z-0 min-w-0 flex-1 overflow-x-clip">{children}</main>
      <GamesFooter />
    </div>
  );
}
