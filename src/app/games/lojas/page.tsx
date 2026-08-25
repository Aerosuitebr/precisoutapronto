import type { Metadata } from 'next';
import { GamesReadablePanel, ProductBridge, SectionAccent, StoreCard } from '@/components/games/games-ui';
import { gameStores, storeSafetyTips } from '@/lib/games/stores';

export const metadata: Metadata = {
  title: { absolute: 'Lojas de jogos, skins e hardware | Precisou, Tá Pronto Games' },
  description:
    'Diretório curado de lojas de jogos, skins, keys, consoles e hardware, com alertas de segurança.',
  alternates: { canonical: '/games/lojas' }
};

export default function LojasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionAccent>
        <GamesReadablePanel className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Lojas</p>
          <h1 className="precisoutapronto-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Jogos, skins, keys e hardware
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Lista curada para achar onde comprar com menos dor de cabeça. Sempre leia a nota de
            confiança.
          </p>
        </GamesReadablePanel>

        <section className="mt-8 rounded-2xl border border-red-200 bg-red-50/95 p-5 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-red-800">Antes de pagar</h2>
          <ul className="mt-3 space-y-2">
            {storeSafetyTips.map((tip) => (
              <li key={tip} className="text-sm leading-6 text-red-800/90">
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gameStores.map((store) => (
            <StoreCard key={store.name} store={store} />
          ))}
        </div>

        <div className="mt-10">
          <ProductBridge />
        </div>
      </SectionAccent>
    </div>
  );
}
