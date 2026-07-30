import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Crosshair, Gamepad2, HardDrive, WalletCards } from 'lucide-react';
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
        itemListElement: [
          ['Calculadora de eDPI', '/games/ferramentas/calculadora-edpi'],
          ['Planejador de armazenamento', '/games/ferramentas/planejador-armazenamento'],
          ['Custo por hora jogada', '/games/ferramentas/custo-por-hora']
        ].map(([name, path], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
          url: `${base}${path}`
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
            ['/games/ferramentas/calculadora-edpi', 'Calcular eDPI'],
            ['/games/ferramentas/planejador-armazenamento', 'Planejar armazenamento'],
            ['/games/ferramentas/custo-por-hora', 'Calcular custo por hora']
          ].map(([href, label]) => <Link key={href} href={href} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">{label}</Link>)}
        </div>
      </header>
      <section aria-labelledby="tools-title" className="mt-8">
        <h2 id="tools-title" className="sr-only">Escolha uma ferramenta gamer</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              href: '/games/ferramentas/calculadora-edpi',
              title: 'Calculadora de eDPI',
              description: 'Calcule DPI × sensibilidade e crie uma referência consistente para sua mira em jogos FPS.',
              cta: 'Calcular meu eDPI',
              icon: Crosshair
            },
            {
              href: '/games/ferramentas/planejador-armazenamento',
              title: 'Espaço para jogos',
              description: 'Some sua biblioteca, reserve margem para atualizações e descubra quanto espaço livre precisa.',
              cta: 'Planejar meu SSD',
              icon: HardDrive
            },
            {
              href: '/games/ferramentas/custo-por-hora',
              title: 'Custo por hora',
              description: 'Compare preço, DLCs e tempo estimado para tomar uma decisão de compra mais consciente.',
              cta: 'Analisar uma compra',
              icon: WalletCards
            }
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <article key={tool.href} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-100 text-teal-800"><Icon className="h-6 w-6" /></span>
                <h3 className="rj-display mt-5 text-2xl font-extrabold text-slate-950">{tool.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{tool.description}</p>
                <Link href={tool.href} className="mt-6 inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-600">
                  {tool.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <h2 className="rj-display text-2xl font-extrabold text-slate-950">Próximas ferramentas previstas</h2>
        <p className="mt-3 leading-7 text-slate-700">Comparador de sensibilidade entre jogos, checklist “meu PC roda?”, calculadora de fonte e planejador de upgrade serão adicionados com bases técnicas verificáveis.</p>
      </section>
    </div>
  );
}
