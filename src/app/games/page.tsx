import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, Cpu, Gamepad2, Gauge, HardDrive, Joystick, ShieldCheck, Store } from 'lucide-react';
import {
  GameCard,
  GamesHeroArt,
  GamesReadablePanel,
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
    href: '/games/ferramentas',
    title: 'Ferramentas gamer',
    text: 'eDPI, armazenamento e custo por hora jogada.',
    icon: Calculator,
    chip: 'Grátis'
  },
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
      <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <GamesReadablePanel className="max-w-none">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                <Gamepad2 className="h-3.5 w-3.5" />
                Jato Games
              </p>
              <h1 className="rj-display mt-4 text-[clamp(2.1rem,4.8vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-slate-950">
                {JATO_GAMES.tagline}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-800 sm:text-lg sm:leading-8">
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
                  className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-slate-800 bg-white px-6 text-sm font-bold text-slate-900 shadow-sm transition hover:border-teal-700 hover:bg-teal-50 hover:text-teal-900"
                >
                  Guias de hardware
                </Link>
              </div>
            </div>
            <GamesHeroArt className="min-h-[260px] max-sm:hidden" />
          </div>
        </GamesReadablePanel>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <SectionAccent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <pillar.icon className="h-5 w-5 text-teal-600" aria-hidden />
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    {pillar.chip}
                  </span>
                </div>
                <h2 className="rj-display mt-3 text-lg font-extrabold text-slate-900">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">{pillar.text}</p>
              </Link>
            ))}
          </div>
        </SectionAccent>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Não é só notícia gamer</p>
              <h2 className="rj-display mt-3 text-3xl font-black leading-tight">Resolva uma decisão antes de abrir o jogo</h2>
              <p className="mt-4 leading-7 text-slate-300">O Jato Games ajuda a configurar, comprar e organizar seu setup com respostas práticas — sem transformar toda dúvida em uma lista de produtos.</p>
              <Link href="/games/ferramentas" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-teal-400 px-5 font-bold text-slate-950 hover:bg-teal-300">
                Abrir ferramentas grátis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Gauge, title: 'Ajuste a mira', text: 'Calcule o eDPI para comparar configurações no mesmo FPS.' },
                { icon: HardDrive, title: 'Planeje o SSD', text: 'Veja se o próximo jogo cabe antes de começar o download.' },
                { icon: Calculator, title: 'Compre melhor', text: 'Compare preço e horas esperadas com custo por hora.' }
              ].map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <item.icon className="h-6 w-6 text-teal-300" />
                  <h3 className="mt-4 font-extrabold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <SectionAccent>
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Escolha seu objetivo</p>
            <h2 className="rj-display mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Conteúdo para a dúvida que você tem agora</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/games/ferramentas/calculadora-edpi', icon: Gauge, title: 'Jogar competitivo', text: 'Calcule eDPI e entenda decisões de estabilidade, monitor e resposta.' },
              { href: '/games/hardware/montar-pc-gamer-sem-desperdicar', icon: Cpu, title: 'Montar ou melhorar o PC', text: 'Priorize peças pelo jogo e pela resolução, não pelo marketing.' },
              { href: '/games/lojas', icon: ShieldCheck, title: 'Comprar com segurança', text: 'Canais confiáveis, alertas de golpe e cuidados antes de pagar.' },
              { href: '/games/top-jogos', icon: Gamepad2, title: 'Descobrir o que jogar', text: 'Jogos populares, plataformas, dicas e setup sugerido.' }
            ].map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-md">
                <item.icon className="h-6 w-6 text-teal-600" />
                <h3 className="rj-display mt-4 text-lg font-extrabold text-slate-950 group-hover:text-teal-800">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
              </Link>
            ))}
          </div>
        </SectionAccent>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <SectionAccent>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Em alta</p>
              <h2 className="rj-display mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                Top jogos com setup
              </h2>
            </div>
            <Link href="/games/top-jogos" className="text-sm font-bold text-teal-700 hover:underline">
              Ver ranking
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </SectionAccent>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <SectionAccent>
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">Hardware</p>
            <h2 className="rj-display mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Guias para não comprar errado
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {hardwareGuides.slice(0, 4).map((guide) => (
              <HardwareCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </SectionAccent>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <ProductBridge />
      </section>
    </div>
  );
}
