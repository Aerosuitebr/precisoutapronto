import type { Metadata } from 'next';
import { GamesShell } from '@/components/games/games-shell';
import { JATO_GAMES } from '@/lib/games/brand';

export const metadata: Metadata = {
  title: {
    default: `${JATO_GAMES.name} | ${JATO_GAMES.tagline}`,
    template: `%s | ${JATO_GAMES.name}`
  },
  description: JATO_GAMES.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: JATO_GAMES.name,
    description: JATO_GAMES.description,
    siteName: JATO_GAMES.name,
    locale: 'pt_BR',
    type: 'website',
    url: JATO_GAMES.path
  },
  twitter: {
    card: 'summary_large_image',
    title: JATO_GAMES.name,
    description: JATO_GAMES.description
  }
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <GamesShell>{children}</GamesShell>;
}
