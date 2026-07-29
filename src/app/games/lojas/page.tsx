import type { Metadata } from 'next';
import { ProductBridge, StoreCard } from '@/components/games/games-ui';
import { gameStores, storeSafetyTips } from '@/lib/games/stores';

export const metadata: Metadata = {
  title: 'Lojas de jogos, skins e hardware',
  description:
    'Diretório curado de lojas de jogos, skins, keys, consoles e hardware, com alertas de segurança.',
  alternates: { canonical: '/games/lojas' }
};

export default function LojasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Lojas</p>
      <h1 className="rj-display mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Jogos, skins, keys e hardware
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        Lista curada para achar onde comprar com menos dor de cabeça. Sempre leia a nota de confiança.
      </p>

      <section className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/5 p-5">
        <h2 className="text-sm font-bold text-red-200">Antes de pagar</h2>
        <ul className="mt-3 space-y-2">
          {storeSafetyTips.map((tip) => (
            <li key={tip} className="text-sm leading-6 text-red-100/90">
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
    </div>
  );
}
