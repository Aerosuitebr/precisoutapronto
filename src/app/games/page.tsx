import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Cpu, Gamepad2, Joystick, Store } from 'lucide-react';
import {
  GameCard,
  GamesHeroBackdrop,
  HardwareCard,
  ProductBridge,
  SectionAccent
} from '@/components/games/games-ui';
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
    icon: Gamepad2,
    chip: 'Ranking'
  },
  {
    href: '/games/hardware',
    title: 'Hardware',
    text: 'GPU, CPU, engines e montagem sem desperdício.',
    icon: Cpu,
    chip: 'Guias'
  },
  {
    href: '/games/consoles',
    title: 'Consoles',
    text: 'PlayStation, Xbox e Nintendo com dicas práticas.',
    icon: Joystick,
    chip: 'Dicas'
  },
  {
    href: '/games/lojas',
    title: 'Lojas',
    text: 'Jogos, skins, keys e hardware com alerta de golpe.',
    icon: Store,
    chip: 'Curadoria'
  }
] as const;

export default function GamesHubPage() {
  const top = listGamesByRank().slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200/80">
        <GamesHeroBackdrop />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              <Gamepad2 className="h-3.5 w-3.5" />
              Jato Games
            </p>
            <h1 className="rj-display mt-4 text-[clamp(2.1rem,4.8vw,3.6rem)] font-extrabold leading-[1.05] tracking-tight text-slate-950">
              {JATO_GAMES.tagline}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              {JATO_GAMES.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/games/top-jogos"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500"
              >
                Ver top jogos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/games/hardware"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:text-teal-800"
              >
                Guias de hardware
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              {['CS2', 'LoL', 'Valorant', 'GTA V', 'Minecraft', 'Fortnite'].map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-[16rem] sm:min-h-[20rem] lg:min-h-[24rem]">
            {/* posters rendered by backdrop on desktop; compact strip on mobile */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {['CS2', 'Valorant', 'Minecraft', 'GTA V'].map((title, i) => (
                <div
                  key={title}
                  className={cnPoster(i)}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                    Destaque
                  </p>
                  <p className="rj-display mt-1 text-lg font-black">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionAccent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <pillar.icon className="h-5 w-5 text-teal-600" aria-hidden />
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    {pillar.chip}
                  </span>
                </div>
                <h2 className="rj-display mt-3 text-lg font-extrabold text-slate-900">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.text}</p>
              </Link>
            ))}
          </div>
        </SectionAccent>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <SectionAccent>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Em alta</p>
              <h2 className="rj-display mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                Top jogos com setup
              </h2>
            </div>
            <Link href="/games/top-jogos" className="text-sm font-semibold text-teal-700 hover:underline">
              Ver ranking
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </SectionAccent>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <SectionAccent>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">Hardware</p>
          <h2 className="rj-display mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
            Guias para não comprar errado
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {hardwareGuides.slice(0, 4).map((guide) => (
              <HardwareCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </SectionAccent>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <ProductBridge />
      </section>
    </div>
  );
}

function cnPoster(index: number) {
  const tones = [
    'bg-gradient-to-br from-orange-500 to-amber-600',
    'bg-gradient-to-br from-rose-500 to-red-700',
    'bg-gradient-to-br from-lime-500 to-green-700',
    'bg-gradient-to-br from-emerald-500 to-teal-700'
  ];
  return `rounded-2xl p-4 text-white shadow-md ${tones[index % tones.length]}`;
}
