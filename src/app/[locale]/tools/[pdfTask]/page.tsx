import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorPdfApp } from '@/components/editor-pdf/editor-pdf-app';
import { ImageStudioApp } from '@/components/image-tools/image-studio-app';
import { PdfCompressorApp } from '@/components/pdf-compressor/pdf-compressor-app';
import { PdfTaskLandingPage } from '@/components/marketing/pdf-task-landing-page';
import { isInternationalLocale } from '@/lib/i18n';
import { getPdfTaskLanding, type PdfTask } from '@/lib/seo/pdf-task-landings';
import { getImageTaskLanding, type ImageTask } from '@/lib/seo/image-task-landings';
import { getPdfCompressorLanding } from '@/lib/seo/pdf-compressor-landing';
import { isStagingEnv, stagingRobots } from '@/lib/app-env';

type Props = { params: Promise<{ locale: string; pdfTask: string }> };
const TASKS: Record<string, PdfTask> = { 'merge-pdf': 'merge', 'split-pdf': 'split' };
const IMAGE_TASKS: Record<string, ImageTask> = { 'image-optimizer': 'optimize', 'image-converter': 'convert' };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pdfTask } = await params;
  if (!isInternationalLocale(locale) || (!TASKS[pdfTask] && !IMAGE_TASKS[pdfTask] && pdfTask !== 'compress-pdf')) return {};
  const landing = TASKS[pdfTask] ? getPdfTaskLanding(TASKS[pdfTask], locale) : IMAGE_TASKS[pdfTask] ? getImageTaskLanding(IMAGE_TASKS[pdfTask], locale) : getPdfCompressorLanding(locale);
  const ptPath = TASKS[pdfTask] ? (TASKS[pdfTask] === 'merge' ? '/juntar-pdf-online' : '/dividir-pdf-online') : IMAGE_TASKS[pdfTask] ? (IMAGE_TASKS[pdfTask] === 'optimize' ? '/comprimir-redimensionar-imagem' : '/converter-imagem-online') : '/comprimir-pdf-online';
  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical: landing.path, languages: { 'pt-BR': ptPath, en: `/en/tools/${pdfTask}`, es: `/es/tools/${pdfTask}`, 'x-default': ptPath } },
    robots: isStagingEnv() ? stagingRobots() : { index: true, follow: true },
    openGraph: { title: landing.title, description: landing.description, url: landing.path, type: 'website', locale: locale === 'en' ? 'en_US' : 'es_ES' }
  };
}

export default async function InternationalPdfTaskPage({ params }: Props) {
  const { locale, pdfTask } = await params;
  if (!isInternationalLocale(locale) || (!TASKS[pdfTask] && !IMAGE_TASKS[pdfTask] && pdfTask !== 'compress-pdf')) notFound();
  const landing = TASKS[pdfTask] ? getPdfTaskLanding(TASKS[pdfTask], locale) : IMAGE_TASKS[pdfTask] ? getImageTaskLanding(IMAGE_TASKS[pdfTask], locale) : getPdfCompressorLanding(locale);
  return <>
    <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
    <PdfTaskLandingPage landing={landing}>{TASKS[pdfTask] ? <EditorPdfApp locale={locale} publicLanding /> : IMAGE_TASKS[pdfTask] ? <ImageStudioApp locale={locale} mode={IMAGE_TASKS[pdfTask]} publicLanding /> : <PdfCompressorApp locale={locale} publicLanding />}</PdfTaskLandingPage>
  </>;
}
