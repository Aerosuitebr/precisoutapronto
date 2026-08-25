import { NextResponse } from 'next/server';
import { getDiagnosticTarget } from '@/lib/games/diagnostic-targets';
import { listGamesByRank } from '@/lib/games/games';

const CATALOG_UPDATED_AT = '2026-07-30T00:00:00.000Z';

export function GET() {
  const games = listGamesByRank().slice(0, 10).map((game) => ({
    slug: game.slug,
    rank: game.rank,
    name: game.title,
    platforms: game.platforms,
    minimum: `${game.setupMin.cpu} · ${game.setupMin.gpu} · ${game.setupMin.ram} · ${game.setupMin.storage}`,
    recommended: `${game.setupRec.cpu} · ${game.setupRec.gpu} · ${game.setupRec.ram} · ${game.setupRec.storage}`,
    ...getDiagnosticTarget(game)
  }));

  return NextResponse.json(
    {
      schemaVersion: 2,
      catalogVersion: CATALOG_UPDATED_AT,
      source: 'Precisou, Tá Pronto Games',
      games
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  );
}
