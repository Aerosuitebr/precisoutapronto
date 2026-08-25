import type { Metadata } from 'next';
import { GamesShell } from '@/components/games/games-shell';
import { PRECISOUTAPRONTO_GAMES } from '@/lib/games/brand';

export const metadata: Metadata = {
  title: {
    default: `${PRECISOUTAPRONTO_GAMES.name} | ${PRECISOUTAPRONTO_GAMES.tagline}`,
    template: `%s | ${PRECISOUTAPRONTO_GAMES.name}`
  },
  description: PRECISOUTAPRONTO_GAMES.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: PRECISOUTAPRONTO_GAMES.name,
    description: PRECISOUTAPRONTO_GAMES.description,
    siteName: PRECISOUTAPRONTO_GAMES.name,
    locale: 'pt_BR',
    type: 'website',
    url: PRECISOUTAPRONTO_GAMES.path
  },
  twitter: {
    card: 'summary_large_image',
    title: PRECISOUTAPRONTO_GAMES.name,
    description: PRECISOUTAPRONTO_GAMES.description
  }
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <GamesShell>{children}</GamesShell>;
}
