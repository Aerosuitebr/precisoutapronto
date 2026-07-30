import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/marketing/seo-landing-page';
import { SEO_LANDINGS } from '@/lib/seo/landing-content';

const content = SEO_LANDINGS['para-estudantes'];
const description = 'Ferramentas gratuitas para estudantes criarem trabalhos, referências ABNT, cronogramas, currículos e redações com mais organização.';

export const metadata: Metadata = {
  title: content.title,
  description,
  alternates: { canonical: content.path },
  openGraph: {
    title: content.title,
    description,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: `${content.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: content.title,
    description,
    images: [`${content.path}/opengraph-image`]
  }
};

export default function ParaEstudantesPage() {
  return <SeoLandingPage content={content} />;
}
