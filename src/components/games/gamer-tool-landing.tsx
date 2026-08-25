import Link from 'next/link';
import { ChevronRight, Gamepad2 } from 'lucide-react';
import { getViralBaseUrl } from '@/lib/viral-loop';

type Faq = { question: string; answer: string };

export function GamerToolLanding({
  title,
  eyebrow,
  description,
  path,
  directAnswer,
  steps,
  faqs,
  children
}: {
  title: string;
  eyebrow: string;
  description: string;
  path: string;
  directAnswer: string;
  steps: string[];
  faqs: Faq[];
  children: React.ReactNode;
}) {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const url = `${base}${path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: title,
        description,
        url,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' }
      },
      {
        '@type': 'HowTo',
        name: `Como usar: ${title}`,
        description,
        step: steps.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, text }))
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Precisou, Tá Pronto Games', item: `${base}/games` },
          { '@type': 'ListItem', position: 2, name: 'Ferramentas gamer', item: `${base}/games/ferramentas` },
          { '@type': 'ListItem', position: 3, name: title, item: url }
        ]
      }
    ]
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Navegação estrutural" className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
        <Link href="/games" className="hover:text-teal-700">Precisou, Tá Pronto Games</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/games/ferramentas" className="hover:text-teal-700">Ferramentas gamer</Link>
        <ChevronRight className="h-4 w-4" />
        <span aria-current="page">{title}</span>
      </nav>
      <header className="rounded-[32px] border border-slate-800 bg-slate-950 p-7 text-white shadow-xl sm:p-10">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-teal-300"><Gamepad2 className="h-4 w-4" /> {eyebrow}</p>
        <h1 className="precisoutapronto-display mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">Resposta direta</p>
          <p className="mt-2 leading-7 text-slate-100">{directAnswer}</p>
        </div>
      </header>
      <div className="mt-8">{children}</div>
      <article className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="precisoutapronto-display text-2xl font-extrabold text-slate-950">Como usar</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 font-black text-teal-800">{index + 1}</span><span>{step}</span></li>)}
          </ol>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="precisoutapronto-display text-2xl font-extrabold text-slate-950">Perguntas frequentes</h2>
          <dl className="mt-5 space-y-5">
            {faqs.map((faq) => <div key={faq.question}><dt className="font-bold text-slate-950">{faq.question}</dt><dd className="mt-2 text-sm leading-6 text-slate-700">{faq.answer}</dd></div>)}
          </dl>
        </section>
      </article>
      <aside className="mt-10 rounded-3xl border border-teal-200 bg-teal-50 p-6 text-center">
        <h2 className="precisoutapronto-display text-xl font-extrabold text-slate-950">Mais decisões gamer em um só lugar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">Explore calculadoras, guias de hardware, requisitos e jogos com setup sugerido.</p>
        <Link href="/games/ferramentas" className="mt-4 inline-flex rounded-xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-500">Ver todas as ferramentas gamer</Link>
      </aside>
    </div>
  );
}
