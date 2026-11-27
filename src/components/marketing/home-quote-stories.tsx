import Link from 'next/link';
import type { getApprovedStories } from '@/lib/testimonials/approved-stories';

type Stories = Awaited<ReturnType<typeof getApprovedStories>>;

function quoteExcerpt(quote: string) {
  const limit = 220;
  if (quote.length <= limit) return quote;

  const boundary = quote.lastIndexOf(' ', limit);
  return `${quote.slice(0, boundary > 0 ? boundary : limit).trimEnd()}…`;
}

export function HomeQuoteStories({ stories }: { stories: Stories }) {
  if (!stories.length) return null;

  return (
    <section id="depoimentos" aria-labelledby="quote-stories-title" className="scroll-mt-32 border-t border-slate-200 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="quote-stories-title" className="precisoutapronto-display text-3xl font-black tracking-tight">O que dizem sobre os orçamentos</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stories.map(story => (
            <figure key={story.id} className="rounded-2xl border border-blue-100 bg-[#f8faff] p-5">
              <blockquote className="break-words text-sm leading-6 text-slate-700">“{quoteExcerpt(story.quote)}”</blockquote>
              <figcaption className="mt-3 break-words text-sm text-slate-600">
                <strong className="text-slate-950">{story.publicName}</strong> · {story.profession}
              </figcaption>
            </figure>
          ))}
        </div>
        <Link href="/depoimentos#avaliacoes-pix" className="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-800 hover:underline">Ver mais depoimentos</Link>
      </div>
    </section>
  );
}
