import Link from 'next/link';
import { ArrowRight, MessageCircleMore, Quote } from 'lucide-react';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { cn } from '@/lib/utils';

const TESTIMONIALS = [
  {
    name: 'Caleb',
    initials: 'C',
    quote:
      'Adorei como vocês colocaram o Pix no WhatsApp como ponto de partida, super prático para o público MEI. A curadoria enxuta de ferramentas também acerta em cheio.',
    highlight: 'Pix + WhatsApp para MEI',
    language: 'pt-BR'
  },
  {
    name: 'Sharmistha Hoagland',
    initials: 'SH',
    quote:
      'Finally something built for the MEI crowd that actually gets WhatsApp. The Pix budget generator saved me from chasing clients at 11pm.',
    translation:
      'Finalmente, algo feito para o público MEI que realmente entende o WhatsApp. O gerador de orçamento com Pix me livrou de correr atrás de clientes às 23h.',
    highlight: 'Orçamento com Pix',
    language: 'en'
  }
] as const;

export function TestimonialsSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'border-y border-sky-100 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_60%,#f1f5f9_100%)]',
        className
      )}
      aria-labelledby="depoimentos-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
            Quem conheceu, aprovou
          </p>
          <h2
            id="depoimentos-title"
            className="rj-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
          >
            O Precisou, Tá Pronto na voz de quem vive a rotina.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Comentários reais publicados pela comunidade depois de conhecer o produto.
          </p>
        </div>

        <ul className="mt-8 grid gap-5 lg:grid-cols-2">
          {TESTIMONIALS.map((item, index) => (
            <li
              key={item.name}
              className={cn(
                'relative flex h-full flex-col overflow-hidden rounded-[26px] border bg-white p-6 shadow-sm sm:p-7',
                index === 0 ? 'border-emerald-200' : 'border-sky-200'
              )}
            >
              <div
                className={cn(
                  'pointer-events-none absolute inset-x-0 top-0 h-1',
                  index === 0
                    ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500'
                    : 'bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500'
                )}
              />

              <div className="flex items-center justify-between gap-4">
                <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">
                  {item.highlight}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <MessageCircleMore className="h-3.5 w-3.5" aria-hidden />
                  <Link href="/depoimentos" className="hover:text-sky-700 hover:underline">Conte a sua</Link>
                </span>
              </div>

              <Quote className="mt-6 h-6 w-6 text-sky-500" aria-hidden />
              <blockquote className="mt-3 flex-1">
                <p
                  lang={item.language}
                  className="text-base font-medium leading-7 text-slate-800 sm:text-[17px]"
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                {'translation' in item ? (
                  <p className="mt-4 border-l-2 border-sky-200 pl-4 text-sm italic leading-6 text-slate-500">
                    Tradução: &ldquo;{item.translation}&rdquo;
                  </p>
                ) : null}
              </blockquote>

              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold',
                    index === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-100 text-sky-800'
                  )}
                  aria-hidden
                >
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Comentário público sobre o Precisou, Tá Pronto</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <ApprovedBrazilianTestimonials />
        <p className="mt-7 text-sm text-slate-600">Usa o produto no Brasil? <Link href="/depoimentos" className="inline-flex items-center gap-1 font-bold text-sky-700 hover:underline">Conte sua experiência real <ArrowRight className="h-3.5 w-3.5" /></Link></p>
      </div>
    </section>
  );
}

async function ApprovedBrazilianTestimonials() {
  if (!isDatabaseConfigured()) return null;
  const rows = await getPrisma().testimonialSubmission.findMany({
    where: { status: 'approved' },
    orderBy: { reviewedAt: 'desc' },
    take: 6,
    select: { id: true, publicName: true, profession: true, city: true, state: true, toolKey: true, quote: true }
  }).catch(() => []);
  if (!rows.length) return null;
  return <ul className="mt-5 grid gap-5 lg:grid-cols-2">{rows.map(item => <li key={item.id} className="rounded-[26px] border border-emerald-200 bg-white p-6 shadow-sm"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">Experiência verificada · {item.toolKey}</span><Quote className="mt-5 h-6 w-6 text-emerald-500" aria-hidden /><blockquote className="mt-3 text-base font-medium leading-7 text-slate-800">“{item.quote}”</blockquote><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-sm font-bold text-slate-900">{item.publicName}</p><p className="text-xs text-slate-500">{item.profession} · {item.city}/{item.state}</p></div></li>)}</ul>;
}
