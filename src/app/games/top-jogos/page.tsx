import type { Metadata } from 'next';
import { GameCard, GamesReadablePanel, SectionAccent } from '@/components/games/games-ui';
import { listGamesByRank } from '@/lib/games/games';

export const metadata: Metadata = {
  title: 'Top 10 jogos com setup sugerido',
  description:
    'Ranking evergreen de jogos populares no Brasil com ficha, plataformas e setup mínimo e recomendado.',
  alternates: { canonical: '/games/top-jogos' }
};

export default function TopJogosPage() {
  const games = listGamesByRank();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionAccent>
        <GamesReadablePanel className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Ranking</p>
          <h1 className="rj-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Top 10 jogos com setup sugerido
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Lista evergreen focada no que a galera joga de verdade no Brasil. Cada ficha traz
            plataformas, dicas e PC sugerido.
          </p>
        </GamesReadablePanel>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </SectionAccent>
    </div>
  );
}
