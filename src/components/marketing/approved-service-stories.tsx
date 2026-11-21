import Link from 'next/link';
import { ArrowRight, CreditCard, FilePenLine, FileText, ReceiptText } from 'lucide-react';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { TESTIMONIAL_CONSENT_VERSION } from '@/lib/testimonials/contracts';
import { HOME_STORIES, type HomeStory } from '@/lib/testimonials/home-stories';

const tools = [
  { key: 'pix', title: 'Link de pagamento e cobrança Pix', href: '/orcamento-com-pix#montar', action: 'Criar orçamento com Pix', icon: CreditCard },
  { key: 'recibo', title: 'Gerador de recibo', href: '/gerador-de-recibo#ferramenta', action: 'Gerar recibo', icon: ReceiptText },
  { key: 'curriculo', title: 'Gerador de currículo', href: '/gerador-de-curriculo', action: 'Criar currículo', icon: FileText },
  { key: 'pdf', title: 'Editor de PDF', href: '/editor-de-pdf-online', action: 'Editar PDF', icon: FilePenLine }
] as const;

function StoryQuote({ story }: { story: HomeStory }) {
  return (
    <figure>
      <blockquote className="leading-7 text-slate-700">“{story.quote}”</blockquote>
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-bold text-slate-950">{story.publicName}</span>
        <span className="text-sm text-slate-600">{story.location}</span>
      </figcaption>
    </figure>
  );
}

export async function ApprovedServiceStories({ full = false }: { full?: boolean }) {
  const groups = await Promise.all(tools.map(async tool => {
    const approved = full && isDatabaseConfigured() ? await getPrisma().testimonialSubmission.findMany({
      where: {
        status: 'approved',
        reviewedAt: { not: null },
        consentVersion: TESTIMONIAL_CONSENT_VERSION,
        toolKey: { in: tool.key === 'pix' ? ['pix', 'orcamento'] : [tool.key] }
      },
      orderBy: { reviewedAt: 'desc' },
      select: { id: true, publicName: true, profession: true, quote: true }
    }).catch(() => []) : [];
    const stories = full ? HOME_STORIES[tool.key] : HOME_STORIES[tool.key].slice(0, 3);
    return {
      ...tool,
      stories: [...stories, ...approved.map(({ profession, ...story }) => ({ ...story, location: profession }))]
    };
  }));

  return (
    <section id="depoimentos" aria-labelledby="home-stories-title" className="scroll-mt-44 bg-slate-50 py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h2 id="home-stories-title" className="precisoutapronto-display text-3xl font-black tracking-[-.04em] sm:text-4xl">O que dizem sobre nossas ferramentas</h2>
            <p className="mt-3 text-slate-600">Leia as experiências de quem já usou o Precisou, Tá Pronto.</p>
          </div>
          <Link href={full ? "#enviar-depoimento" : "/depoimentos#depoimentos"} className="inline-flex min-h-11 items-center text-sm font-bold text-blue-700 hover:underline">
            {full ? "Enviar meu depoimento" : "Ver todas as avaliações"}
          </Link>
        </div>

        <div className="mt-8 grid items-start gap-5 md:grid-cols-2">
          {groups.map(({ key, title, href, action, icon: Icon, stories }) => (
              <article key={key} aria-labelledby={`home-stories-${key}`} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" id={`avaliacoes-${key}`}>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 id={`home-stories-${key}`} className="text-lg font-extrabold text-slate-950">{title}</h3>
                </div>
                <ul className="mt-3 divide-y divide-slate-100">
                  {stories.map(story => <li key={story.id} className="py-3"><StoryQuote story={story} /></li>)}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-x-4 border-t border-slate-100">
                  {!full && (
                    <Link href={`/depoimentos#avaliacoes-${key}`} className="inline-flex min-h-11 items-center text-sm font-bold text-blue-700 hover:underline">
                      Mais avaliações
                    </Link>
                  )}
                  <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-blue-700 hover:underline">
                    {action} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
          ))}
        </div>
      </div>
    </section>
  );
}
