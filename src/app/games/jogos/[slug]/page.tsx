import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductBridge, SetupTable } from '@/components/games/games-ui';
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
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="break-words text-xs text-slate-500">
        <Link href="/games" className="hover:text-teal-700">
          Jato Games
        </Link>
        {' / '}
        <Link href="/games/top-jogos" className="hover:text-teal-700">
          Top jogos
        </Link>
        {' / '}
        <span className="text-slate-700">{game.title}</span>
      </nav>

      <p className="mt-6 break-words text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
        #{game.rank} · {game.genres.join(' · ')}
      </p>
      <h1 className="rj-display mt-2 break-words text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
        {game.title}
      </h1>
      <p className="mt-3 max-w-3xl break-words text-base leading-7 text-slate-600">{game.blurb}</p>
      <p className="mt-2 break-words text-sm text-slate-500">
        Plataformas: {game.platforms.join(', ')}
      </p>

      <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 space-y-8">
          <section className="min-w-0">
            <h2 className="rj-display text-xl font-extrabold text-slate-900">Por que está no radar</h2>
            <p className="mt-3 break-words text-sm leading-7 text-slate-600">{game.whyPopular}</p>
          </section>
          <section className="min-w-0">
            <h2 className="rj-display text-xl font-extrabold text-slate-900">Setup sugerido</h2>
            <div className="mt-4 min-w-0">
              <SetupTable game={game} />
            </div>
          </section>
          <section>
            <h2 className="rj-display text-xl font-extrabold text-slate-900">Dicas rápidas</h2>
            <ul className="mt-3 space-y-2">
              {game.tips.map((tip) => (
                <li
                  key={tip}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="space-y-4">
          <ProductBridge />
          <Link
            href="/games/hardware/escolher-placa-de-video"
            className="block rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm transition hover:border-amber-300"
          >
            Montando PC? Veja o guia de placa de vídeo.
          </Link>
        </div>
      </div>
    </div>
  );
}
