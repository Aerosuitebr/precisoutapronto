import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getGrowthSegment, growthSegments } from '@/lib/growth/segments';
import { intentPages } from '@/lib/growth/intents';

type Props = { params: Promise<{ segmento: string }> };

export function generateStaticParams() {
  return growthSegments.map((segment) => ({ segmento: segment.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segment = getGrowthSegment((await params).segmento);
  if (!segment) return {};
  return {
    title: `${segment.name}: ferramentas e documentos gratuitos`,
    description: segment.description,
    alternates: { canonical: `/para/${segment.slug}` }
  };
}

export default async function SegmentPage({ params }: Props) {
  const segment = getGrowthSegment((await params).segmento);
  if (!segment) notFound();
  const relatedIntents = intentPages.filter((item) => item.segmentSlugs.includes(segment.slug));
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(145deg,#020617,#0f172a_50%,#064e3b)] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Resolva Jato para {segment.name}</p>
            <h1 className="rj-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{segment.headline}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{segment.description}</p>
            <Link href={segment.tools[0].href} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300">
              Começar agora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="rj-display text-3xl font-extrabold text-slate-950">Ferramentas recomendadas</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {segment.tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="group rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                <Check className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-4 text-xl font-bold text-slate-950">{tool.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="rj-display text-3xl font-extrabold text-slate-950">Respostas para tarefas frequentes</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {relatedIntents.map((intent) => (
                <Link key={intent.slug} href={`/modelos/${intent.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-300">
                  <h3 className="font-bold text-slate-950">{intent.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{intent.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
