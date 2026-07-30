import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Gamepad2 } from 'lucide-react';
import { CostPerHourCalculator, EdpiCalculator, StoragePlanner } from '@/components/games/gamer-tools';
import { getViralBaseUrl } from '@/lib/viral-loop';

export const metadata: Metadata = {
  title: { absolute: 'Ferramentas gamer grátis | Jato Games' },
  description: 'Use calculadora de eDPI, planejador de armazenamento e custo por hora jogada. Ferramentas gamer gratuitas e diretas.',
  alternates: { canonical: '/games/ferramentas' },
  openGraph: {
    title: 'Ferramentas gamer grátis | Jato Games',
    description: 'Calcule eDPI, espaço para jogos e custo por hora antes da próxima partida ou compra.',
    url: '/games/ferramentas',
    type: 'website'
  }
};

export default function GamerToolsPage() {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const url = `${base}/games/ferramentas`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Ferramentas gamer grátis',
        description: 'Calculadoras e planejadores para decisões práticas de jogadores.',
        url,
        inLanguage: 'pt-BR'
      },
      {
        '@type': 'ItemList',
        name: 'Calculadoras gamer',
        itemListElement: ['Calculadora de eDPI', 'Planejador de armazenamento', 'Custo por hora jogada'].map((name, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Jato Games', item: `${base}/games` },
          { '@type': 'ListItem', position: 2, name: 'Ferramentas gamer', item: url }
        ]
      }
    ]
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <Link href="/games" className="hover:text-teal-700">Jato Games</Link>
        <ChevronRight className="h-4 w-4" />
        <span aria-current="page">Ferramentas</span>
      </nav>
      <header className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-7 text-white shadow-xl sm:p-10">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-teal-300"><Gamepad2 className="h-4 w-4" /> Central de utilidades</p>
        <h1 className="rj-display mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Ferramentas gamer que resolvem antes da partida</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Ajuste sua mira, planeje o SSD e entenda se uma compra vale o tempo que você realmente pretende jogar.</p>
        <div className="mt-7 flex flex-wrap gap-2">
          {[
            ['#edpi', 'Calcular eDPI'],
            ['#armazenamento', 'Planejar armazenamento'],
            ['#custo', 'Calcular custo por hora']
          ].map(([href, label]) => <a key={href} href={href} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">{label}</a>)}
        </div>
      </header>
      <div className="mt-8 space-y-8">
        <div id="edpi"><EdpiCalculator /></div>
        <div id="armazenamento"><StoragePlanner /></div>
        <div id="custo"><CostPerHourCalculator /></div>
      </div>
      <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <h2 className="rj-display text-2xl font-extrabold text-slate-950">Próximas ferramentas previstas</h2>
        <p className="mt-3 leading-7 text-slate-700">Comparador de sensibilidade entre jogos, checklist “meu PC roda?”, calculadora de fonte e planejador de upgrade serão adicionados com bases técnicas verificáveis.</p>
      </section>
    </div>
  );
}
