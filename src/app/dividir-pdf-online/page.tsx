import type { Metadata } from 'next';
import { EditorPdfApp } from '@/components/editor-pdf/editor-pdf-app';
import { PdfTaskLandingPage } from '@/components/marketing/pdf-task-landing-page';
import { getPdfTaskLanding } from '@/lib/seo/pdf-task-landings';

const landing = getPdfTaskLanding('split', 'pt-BR');
export const metadata: Metadata = {
  title: landing.title,
  description: landing.description,
  alternates: { canonical: landing.path, languages: { 'pt-BR': landing.path, en: '/en/tools/split-pdf', es: '/es/tools/split-pdf', 'x-default': landing.path } },
  openGraph: { title: landing.title, description: landing.description, url: landing.path, type: 'website' }
};
export default function DividirPdfPage() {
  return <PdfTaskLandingPage landing={landing}><EditorPdfApp publicLanding /></PdfTaskLandingPage>;
}
