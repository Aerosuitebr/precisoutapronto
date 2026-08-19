import type { Metadata } from 'next';
import { PropostaPreview } from '@/components/propostas/proposta-preview';
import { ToolLandingPage } from '@/components/marketing/tool-landing/tool-landing-page';
import { SAMPLE_PROPOSAL } from '@/lib/propostas/defaults';
import { propostasSeoContent } from '@/lib/seo-pages/propostas';
import { PropostaLivePreview } from './proposta-live-preview';

const SITE_URL = 'https://precisoutapronto.com.br';

export const metadata: Metadata = {
  title: propostasSeoContent.seo.metaTitle,
  description: propostasSeoContent.seo.metaDescription,
  keywords: propostasSeoContent.seo.keywords,
  alternates: {
    canonical: `${SITE_URL}/${propostasSeoContent.slug}`,
    languages: {
      'pt-BR': `/${propostasSeoContent.slug}`,
      en: '/en/tools/proposal',
      es: '/es/tools/proposal',
      'x-default': `/${propostasSeoContent.slug}`
    }
  },
  openGraph: {
    title: propostasSeoContent.seo.metaTitle,
    description: propostasSeoContent.seo.metaDescription,
    url: `${SITE_URL}/${propostasSeoContent.slug}`,
    siteName: 'Precisou, Tá Pronto',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `/${propostasSeoContent.slug}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: propostasSeoContent.seo.metaTitle,
    description: propostasSeoContent.seo.metaDescription,
    images: [`/${propostasSeoContent.slug}/opengraph-image`]
  }
};

const examples = [
  {
    title: 'Corporativa',
    description: 'Visual clássico e formal, indicado para propostas B2B e licitações.',
    href: propostasSeoContent.ctaHref,
    thumbnail: <PropostaPreview data={{ ...SAMPLE_PROPOSAL, templateId: 'corporativa' as const }} />
  },
  {
    title: 'Executiva',
    description: 'Foco em consultoria e escopo de trabalho (SOW), com linguagem objetiva.',
    href: propostasSeoContent.ctaHref,
    thumbnail: <PropostaPreview data={{ ...SAMPLE_PROPOSAL, templateId: 'executiva' as const }} />
  },
  {
    title: 'Criativa',
    description: 'Visual mais colorido, indicado para agências e freelancers criativos.',
    href: propostasSeoContent.ctaHref,
    thumbnail: <PropostaPreview data={{ ...SAMPLE_PROPOSAL, templateId: 'criativa' as const }} />
  }
];

export default function GeradorDePropostaComercialPage() {
  return (
    <ToolLandingPage
      content={propostasSeoContent}
      heroMockup={
        <div className="origin-top scale-[0.9] rounded-xl bg-white shadow-xl">
          <PropostaPreview data={SAMPLE_PROPOSAL} />
        </div>
      }
      toolPreview={<PropostaLivePreview />}
      examples={examples}
    />
  );
}
