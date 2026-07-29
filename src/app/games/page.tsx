import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Cpu, Gamepad2, Joystick, Store } from 'lucide-react';
import { GameCard, HardwareCard, ProductBridge } from '@/components/games/games-ui';
import { JATO_GAMES } from '@/lib/games/brand';
import { listGamesByRank } from '@/lib/games/games';
import { hardwareGuides } from '@/lib/games/hardware';

export const metadata: Metadata = {
  title: { absolute: `${JATO_GAMES.name} | ${JATO_GAMES.tagline}` },
  description: JATO_GAMES.description,
  alternates: { canonical: '/games' },
  openGraph: {
    title: JATO_GAMES.name,
    description: JATO_GAMES.description,
    url: '/games',
    siteName: JATO_GAMES.name
  }
};

const pillars = [
  {
    href: '/games/top-jogos',
    title: 'Top jogos',
    text: 'Ranking evergreen com ficha e setup sugerido.',
    icon: Gamepad2
  },
  {
    href: '/games/hardware',
    title: 'Hardware',
    text: 'GPU, CPU, engines e montagem sem desperdício.',
    icon: Cpu
  },
  {
    href: '/games/consoles',
    title: 'Consoles',
    text: 'PlayStation, Xbox e Nintendo com dicas práticas.',
    icon: Joystick
  },
  {
    href: '/games/lojas',
    title: 'Lojas',
    text: 'Jogos, skins, keys e hardware com alerta de golpe.',
    icon: Store
  }
] as const;

export default function GamesHubPage() {
  const top = listGamesByRank().slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Jato Games</p>
          <h1 className="rj-display mt-3 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            {JATO_GAMES.tagline}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            {JATO_GAMES.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/games/top-jogos"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Ver top jogos
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/games/hardware"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Guias de hardware
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <Link
              key={pillar.href}
              href={pillar.href}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-300/40"
            >
              <pillar.icon className="h-5 w-5 text-cyan-300" aria-hidden />
              <h2 className="rj-display mt-3 text-lg font-extrabold text-white">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{pillar.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Em alta</p>
            <h2 className="rj-display mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              Top jogos com setup
            </h2>
          </div>
          <Link href="/games/top-jogos" className="text-sm font-semibold text-cyan-300 hover:underline">
            Ver ranking
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Hardware</p>
        <h2 className="rj-display mt-2 text-2xl font-extrabold text-white sm:text-3xl">
          Guias para não comprar errado
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {hardwareGuides.slice(0, 4).map((guide) => (
            <HardwareCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <ProductBridge />
      </section>
    </div>
  );
}
