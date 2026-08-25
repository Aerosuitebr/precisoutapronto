import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductBridge, GamesReadablePanel } from '@/components/games/games-ui';
import { PRECISOUTAPRONTO_GAMES } from '@/lib/games/brand';
import { getHardwareGuide, hardwareGuides } from '@/lib/games/hardware';
import { getViralBaseUrl } from '@/lib/viral-loop';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return hardwareGuides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getHardwareGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/games/hardware/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      url: `/games/hardware/${guide.slug}`
    }
  };
}

export default async function HardwareGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getHardwareGuide(slug);
  if (!guide) notFound();

  const base = getViralBaseUrl().replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        inLanguage: 'pt-BR',
        datePublished: PRECISOUTAPRONTO_GAMES.publishedAt,
        dateModified: PRECISOUTAPRONTO_GAMES.publishedAt,
        mainEntityOfPage: `${base}/games/hardware/${guide.slug}`,
        author: { '@type': 'Organization', name: PRECISOUTAPRONTO_GAMES.name, url: `${base}/games` },
        publisher: {
          '@type': 'Organization',
          name: PRECISOUTAPRONTO_GAMES.name,
          url: `${base}/games`
        }
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Precisou, Tá Pronto Games', item: `${base}/games` },
          { '@type': 'ListItem', position: 2, name: 'Hardware', item: `${base}/games/hardware` },
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: `${base}/games/hardware/${guide.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 rounded-xl border border-white/70 bg-white/85 px-3 py-2 text-xs text-slate-500 backdrop-blur-sm">
        <Link href="/games" className="hover:text-teal-700">
          Precisou, Tá Pronto Games
        </Link>
        {' / '}
        <Link href="/games/hardware" className="hover:text-teal-700">
          Hardware
        </Link>
        {' / '}
        <span className="text-slate-700">{guide.title}</span>
      </nav>

      <GamesReadablePanel>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
          {guide.readTime} de leitura
        </p>
        <h1 className="precisoutapronto-display mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
          {guide.answer}
        </p>
      </GamesReadablePanel>

      <div className="mt-10 space-y-8 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm sm:p-7">
        {guide.sections.map((section) => (
          <section key={section.title}>
            <h2 className="precisoutapronto-display text-xl font-extrabold text-slate-900">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-7 text-slate-600">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="precisoutapronto-display mb-4 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-xl font-extrabold text-slate-900 backdrop-blur-sm">
          Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {guide.faq.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm"
            >
              <p className="text-sm font-bold text-slate-900">{item.question}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <ProductBridge />
      </div>
      <aside className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Utilidades gratuitas</p>
        <h2 className="precisoutapronto-display mt-2 text-xl font-extrabold text-slate-950">Teste decisões do seu setup</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/games/ferramentas/calculadora-edpi" className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600">
            Calcular eDPI
          </Link>
          <Link href="/games/ferramentas/planejador-armazenamento" className="rounded-xl border border-teal-300 bg-white px-4 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-100">
            Planejar espaço no SSD
          </Link>
        </div>
      </aside>
    </div>
  );
}
