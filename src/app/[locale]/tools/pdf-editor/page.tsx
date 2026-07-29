import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorPdfApp } from '@/components/editor-pdf/editor-pdf-app';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';
import { findInternationalTool } from '@/lib/international-tools-catalog';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  const tool = findInternationalTool('pdf-editor')!;
  return {
    title: tool[locale].name,
    description: tool[locale].description,
    ...internationalSeo(locale, 'tools/pdf-editor', tool.ptPath)
  };
}

export default async function PdfEditorPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <EditorPdfApp locale={locale} />
    </>
  );
}
