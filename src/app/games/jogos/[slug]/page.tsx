import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  GameHero,
  GameNextSteps,
  GameTips,
  ProductBridge,
  SetupTable
} from '@/components/games/games-ui';
import { JATO_GAMES } from '@/lib/games/brand';
import { gamesCatalog, getGame } from '@/lib/games/games';
import { getViralBaseUrl } from '@/lib/viral-loop';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return gamesCatalog.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  const title = `${game.title}: setup mínimo e recomendado`;
  const description = `${game.blurb} Plataformas: ${game.platforms.join(', ')}.`;
  return {
    title,
    description,
    alternates: { canonical: `/games/jogos/${game.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/games/jogos/${game.slug}`
    }
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${game.title}: setup e dicas`,
        description: game.blurb,
        inLanguage: 'pt-BR',
        datePublished: JATO_GAMES.publishedAt,
        dateModified: JATO_GAMES.publishedAt,
        mainEntityOfPage: `${base}/games/jogos/${game.slug}`,
        author: { '@type': 'Organization', name: JATO_GAMES.name, url: `${base}/games` },
        publisher: {
          '@type': 'Organization',
          name: JATO_GAMES.name,
          url: `${base}/games`
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Jato Games', item: `${base}/games` },
          { '@type': 'ListItem', position: 2, name: 'Top jogos', item: `${base}/games/top-jogos` },
          {
            '@type': 'ListItem',
            position: 3,
            name: game.title,
            item: `${base}/games/jogos/${game.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 break-words rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
        <Link href="/games" className="hover:text-teal-700">
          Jato Games
        </Link>
        {' / '}
        <Link href="/games/top-jogos" className="hover:text-teal-700">
          Top jogos
        </Link>
        {' / '}
        <span className="text-slate-900">{game.title}</span>
      </nav>

      <GameHero game={game} />

      <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="min-w-0 space-y-8">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 sm:p-6">
            <h2 className="rj-display text-xl font-extrabold text-slate-950">Por que está no radar</h2>
            <p className="mt-3 break-words text-base leading-7 text-slate-800">{game.whyPopular}</p>
          </section>

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 sm:p-6">
            <h2 className="rj-display text-xl font-extrabold text-slate-950">Setup sugerido</h2>
            <div className="mt-4 min-w-0">
              <SetupTable game={game} />
            </div>
            <div className="mt-6">
              <GameNextSteps game={game} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 sm:p-6">
            <h2 className="rj-display text-xl font-extrabold text-slate-950">Dicas rápidas</h2>
            <GameTips tips={game.tips} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ProductBridge context="game" />
          <Link
            href="/games/hardware/escolher-placa-de-video"
            className="block rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-slate-800 shadow-sm ring-1 ring-amber-900/5 transition hover:border-amber-400 hover:bg-amber-100/80"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
              Guia de hardware
            </p>
            <p className="mt-2 font-semibold text-slate-950">
              Montando PC? Veja como escolher placa de vídeo sem desperdício.
            </p>
          </Link>
          <Link
            href="/games/ferramentas/planejador-armazenamento"
            className="block rounded-2xl border border-teal-200 bg-teal-50 p-5 text-sm leading-6 text-slate-800 shadow-sm transition hover:border-teal-400 hover:bg-teal-100/80"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
              Antes de instalar
            </p>
            <p className="mt-2 font-semibold text-slate-950">
              Some seus jogos e descubra quanto espaço reservar no SSD.
            </p>
          </Link>
          <Link
            href="/games/top-jogos"
            className="block rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-teal-300"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Ranking</p>
            <p className="mt-2 font-semibold text-slate-950">Voltar ao Top 10 com setup sugerido</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}
