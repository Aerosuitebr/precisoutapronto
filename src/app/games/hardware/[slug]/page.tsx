import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductBridge } from '@/components/games/games-ui';
import { JATO_GAMES } from '@/lib/games/brand';
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
        datePublished: JATO_GAMES.publishedAt,
        dateModified: JATO_GAMES.publishedAt,
        mainEntityOfPage: `${base}/games/hardware/${guide.slug}`,
        author: { '@type': 'Organization', name: JATO_GAMES.name, url: `${base}/games` },
        publisher: {
          '@type': 'Organization',
          name: JATO_GAMES.name,
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
          { '@type': 'ListItem', position: 1, name: 'Jato Games', item: `${base}/games` },
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
      <nav className="text-xs text-slate-500">
        <Link href="/games" className="hover:text-cyan-300">
          Jato Games
        </Link>
        {' / '}
        <Link href="/games/hardware" className="hover:text-cyan-300">
          Hardware
        </Link>
        {' / '}
        <span className="text-slate-300">{guide.title}</span>
      </nav>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
        {guide.readTime} de leitura
      </p>
      <h1 className="rj-display mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {guide.title}
      </h1>
      <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-4 text-sm leading-7 text-amber-50">
        {guide.answer}
      </p>

      <div className="mt-10 space-y-8">
        {guide.sections.map((section) => (
          <section key={section.title}>
            <h2 className="rj-display text-xl font-extrabold text-white">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-7 text-slate-400">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="rj-display text-xl font-extrabold text-white">Perguntas frequentes</h2>
        <div className="mt-4 space-y-3">
          {guide.faq.map((item) => (
            <div key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-bold text-white">{item.question}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <ProductBridge />
      </div>
    </div>
  );
}
