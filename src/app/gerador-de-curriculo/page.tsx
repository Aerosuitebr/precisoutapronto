import type { Metadata } from 'next';
import { ToolLandingPage } from '@/components/marketing/tool-landing/tool-landing-page';
import { curriculoSeoContent } from '@/lib/seo-pages/curriculo';
import { CurriculoLivePreview } from './curriculo-live-preview';

const SITE_URL = 'https://precisoutapronto.com.br';

export const metadata: Metadata = {
  title: curriculoSeoContent.seo.metaTitle,
  description: curriculoSeoContent.seo.metaDescription,
  keywords: curriculoSeoContent.seo.keywords,
  alternates: {
    canonical: `${SITE_URL}/${curriculoSeoContent.slug}`,
    languages: {
      'pt-BR': `/${curriculoSeoContent.slug}`,
      en: '/en/tools/resume',
      es: '/es/tools/resume',
      'x-default': `/${curriculoSeoContent.slug}`
    }
  },
  openGraph: {
    title: curriculoSeoContent.seo.metaTitle,
    description: curriculoSeoContent.seo.metaDescription,
    url: `${SITE_URL}/${curriculoSeoContent.slug}`,
    siteName: 'Precisou, Tá Pronto',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `/${curriculoSeoContent.slug}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: curriculoSeoContent.seo.metaTitle,
    description: curriculoSeoContent.seo.metaDescription,
    images: [`/${curriculoSeoContent.slug}/opengraph-image`]
  }
};

export default function GeradorDeCurriculoPage() {
  return (
    <ToolLandingPage
      content={curriculoSeoContent}
      toolPreview={<CurriculoLivePreview />}
    />
  );
}
