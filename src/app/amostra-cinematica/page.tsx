import type { Metadata } from 'next';
import { CinematicSample } from '@/components/marketing/cinematic-sample';

export const metadata: Metadata = {
  title: 'Amostra cinematográfica',
  description: 'Filme interativo de amostra. Pessoas, movimento e cara de grande produção.',
  robots: { index: false, follow: false }
};

export default function AmostraCinematicaPage() {
  return <CinematicSample />;
}
