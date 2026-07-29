import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalProposalEditor } from '@/components/propostas/international-proposal-editor';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Professional business proposal in PDF' : 'Propuesta comercial profesional en PDF',
    description:
      locale === 'en'
        ? 'Create a professional business proposal with scope, prices, terms and PDF export.'
        : 'Crea una propuesta comercial profesional con alcance, precios, condiciones y exportación a PDF.',
    ...internationalSeo(locale, 'tools/proposal', '/gerador-de-proposta-comercial')
  };
}

export default async function ProposalPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalProposalEditor locale={locale} />
    </>
  );
}
