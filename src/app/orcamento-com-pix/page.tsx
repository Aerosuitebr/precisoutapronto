import type { Metadata } from 'next';
import { OrcamentosApp } from '@/components/orcamentos/orcamentos-app';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

const content = SEO_LANDINGS['orcamento-com-pix'];
const SITE_URL = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  keywords: [
    'orçamento com pix',
    'gerador de orçamento',
    'orçamento online grátis',
    'orçamento whatsapp',
    'orçamento mei',
    'cobrança pix orçamento'
  ],
  alternates: {
    canonical: content.path,
    languages: {
      'pt-BR': content.path,
      en: '/en/tools/quote-pix',
      es: '/es/tools/quote-pix',
      'x-default': content.path
    }
  },
  openGraph: {
    title: content.title,
    description: content.description,
    url: `${SITE_URL}${content.path}`,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: `${content.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: content.title,
    description: content.description,
    images: [`${content.path}/opengraph-image`]
  }
};

export default function OrcamentoComPixPage() {
  return (
    <SeoLandingPage
      content={content}
      demo={
        <section
          id="montar"
          className="scroll-mt-24 border-b border-slate-200 bg-[image:var(--precisoutapronto-page-bg)]"
        >
          <div className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:px-8 lg:py-7">
            <OrcamentosApp publicAccess />
          </div>
        </section>
      }
    />
  );
}
