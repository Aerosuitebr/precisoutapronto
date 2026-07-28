import type { Metadata } from 'next';
import { OrcamentosApp } from '@/components/orcamentos/orcamentos-app';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

const content = SEO_LANDINGS['orcamento-com-pix'];

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  alternates: { canonical: content.path },
  openGraph: {
    title: content.title,
    description: content.description,
    url: `${getViralBaseUrl()}${content.path}`,
    type: 'website',
    locale: 'pt_BR'
  }
};

export default function OrcamentoComPixPage() {
  return (
    <SeoLandingPage
      content={content}
      demo={
        <section
          id="montar"
          className="scroll-mt-24 border-b border-slate-200 bg-[image:var(--rj-page-bg)]"
        >
          <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
            <OrcamentosApp publicAccess />
          </div>
        </section>
      }
    />
  );
}
