import type { Metadata } from 'next';
import { GamesReadablePanel, HardwareCard, SectionAccent } from '@/components/games/games-ui';
import { hardwareGuides } from '@/lib/games/hardware';

export const metadata: Metadata = {
  title: 'Hardware gamer: GPU, CPU e engines',
  description:
    'Guias evergreen para escolher placa de vídeo, processador, entender game engines e montar PC sem desperdiçar.',
  alternates: { canonical: '/games/hardware' }
};

export default function HardwareIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionAccent>
        <GamesReadablePanel className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">Hardware</p>
          <h1 className="rj-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            GPU, CPU, engines e montagem
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Conteúdo evergreen para comprar certo e entender o que pesa de verdade nos jogos.
          </p>
        </GamesReadablePanel>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {hardwareGuides.map((guide) => (
            <HardwareCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </SectionAccent>
    </div>
  );
}
