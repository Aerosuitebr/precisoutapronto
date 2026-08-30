import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { TrustSeals } from '@/components/marketing/trust-seals';
import type { SeoPageContent } from '@/lib/seo-pages/types';
import { ToolLandingArticle } from './article-section';
import { ToolLandingBenefits } from './benefits-grid';
import type { ToolLandingExampleItem } from './examples-grid';
import { ToolLandingExamples } from './examples-grid';
import { ToolLandingFaq } from './faq-section';
import { ToolLandingHero } from './hero';
import { ToolLandingHowItWorks } from './how-it-works';
import { ToolLandingJsonLd } from './json-ld';
import { ToolLandingRelated } from './related-tools';
import { ToolLandingShare } from './share-buttons';
import { ToolLandingEmbed } from './tool-embed';

interface ToolLandingPageProps {
  content: SeoPageContent;
  /** Mockup estático/leve exibido no hero. */
  heroMockup: ReactNode;
  /** Área "Ferramenta": preview interativo real, específico de cada ferramenta. */
  toolPreview: ReactNode;
  /** Miniaturas reais dos modelos (ex: ResumePreview em escala). */
  examples: ToolLandingExampleItem[];
}

export function ToolLandingPage({ content, heroMockup, toolPreview, examples }: ToolLandingPageProps) {
  return (
    <>
      <ToolLandingJsonLd content={content} />
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>
      <SiteHeader />
      <main id="conteudo-principal">
        <ToolLandingHero content={content} preview={heroMockup} />

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <TrustSeals />
        </section>

        <ToolLandingEmbed
          toolName={content.toolName}
          tool={toolPreview}
          ctaHref={content.ctaHref}
          ctaLabel={content.ctaPrimary}
          openWithoutAccount={content.openWithoutAccount}
        />

        <ToolLandingBenefits toolName={content.toolName} benefits={content.benefits} />
        <ToolLandingHowItWorks steps={content.steps} />
        <ToolLandingExamples examples={examples} />
        <TestimonialsSection />
        <ToolLandingFaq faq={content.faq} />
        <ToolLandingArticle title={content.article.title} html={content.article.html} />

        <section className="border-y border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-16">
            <div className="max-w-xl">
              <h2 className="precisoutapronto-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Experimente na própria página
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                {content.openWithoutAccount
                  ? 'Use a demo acima. Orçamento e recibo saem sem cadastro.'
                  : 'Use a demo acima. Orçamento e recibo saem sem cadastro. Nas outras ferramentas, duas gerações livres.'}
              </p>
            </div>
            <Button asChild size="lg" className="h-12 shrink-0 bg-sky-500 px-6 font-bold hover:bg-sky-400">
              <a href="#ferramenta">
                {content.ctaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <ToolLandingShare toolName={content.toolName} />
        </section>

        <ToolLandingRelated tools={content.relatedTools} />
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-10px_30px_-18px_rgba(15,23,42,.45)] backdrop-blur lg:hidden">
        <Button asChild size="lg" className="w-full bg-[#0b5cff] font-bold hover:bg-[#0648c9]">
          <a href="#ferramenta">{content.ctaPrimary}<ArrowRight className="h-4 w-4" aria-hidden /></a>
        </Button>
      </div>
      <SiteFooter />
    </>
  );
}
