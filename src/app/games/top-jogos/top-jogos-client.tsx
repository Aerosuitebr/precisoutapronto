'use client';

import { useMemo, useState } from 'react';
import { GameCard } from '@/components/games/games-ui';
import type { GameEntry } from '@/lib/games/games';
import { cn } from '@/lib/utils';

type PlatformFilter = 'all' | 'pc' | 'console' | 'mobile';

const FILTERS: { id: PlatformFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pc', label: 'Só PC' },
  { id: 'console', label: 'Só Console' },
  { id: 'mobile', label: 'Só Mobile' }
];

const CONSOLE_TOKENS = new Set(['Console', 'PlayStation', 'Xbox', 'Nintendo']);

function matchesFilter(game: GameEntry, filter: PlatformFilter) {
  if (filter === 'all') return true;
  if (filter === 'pc') return game.platforms.includes('PC');
  if (filter === 'mobile') return game.platforms.includes('Mobile');
  return game.platforms.some((p) => CONSOLE_TOKENS.has(p));
}

export function TopJogosClient({ games }: { games: GameEntry[] }) {
  const [filter, setFilter] = useState<PlatformFilter>('all');

  const filtered = useMemo(
    () => games.filter((game) => matchesFilter(game, filter)),
    [games, filter]
  );

  const champion = filter === 'all' ? filtered.find((g) => g.rank === 1) : null;
  const rest = champion ? filtered.filter((g) => g.slug !== champion.slug) : filtered;

  return (
    <div>
      <div
        className="mt-6 flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Filtrar por plataforma"
      >
        {FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={active}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition',
                active
                  ? 'border-teal-700 bg-teal-600 text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-teal-500 hover:bg-teal-50'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Nenhum jogo neste filtro. Tente outra plataforma.
        </p>
      ) : (
        <div className="mt-10 space-y-5">
          {champion ? <GameCard game={champion} featured /> : null}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
