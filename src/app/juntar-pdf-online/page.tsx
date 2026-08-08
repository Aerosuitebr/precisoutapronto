import type { Metadata } from 'next';
import { EditorPdfApp } from '@/components/editor-pdf/editor-pdf-app';
import { PdfTaskLandingPage } from '@/components/marketing/pdf-task-landing-page';
import { getPdfTaskLanding } from '@/lib/seo/pdf-task-landings';

const landing = getPdfTaskLanding('merge', 'pt-BR');
export const metadata: Metadata = {
  title: landing.title,
  description: landing.description,
  alternates: { canonical: landing.path, languages: { 'pt-BR': landing.path, en: '/en/tools/merge-pdf', es: '/es/tools/merge-pdf', 'x-default': landing.path } },
  openGraph: { title: landing.title, description: landing.description, url: landing.path, type: 'website' }
};
export default function JuntarPdfPage() {
  return <PdfTaskLandingPage landing={landing}><EditorPdfApp publicLanding /></PdfTaskLandingPage>;
}
