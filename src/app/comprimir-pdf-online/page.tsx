import type { Metadata } from 'next';
import { PdfCompressorApp } from '@/components/pdf-compressor/pdf-compressor-app';
import { PdfTaskLandingPage } from '@/components/marketing/pdf-task-landing-page';
import { getPdfCompressorLanding } from '@/lib/seo/pdf-compressor-landing';
const landing = getPdfCompressorLanding('pt-BR');
export const metadata: Metadata = { title: landing.title, description: landing.description, alternates: { canonical: landing.path, languages: { 'pt-BR': landing.path, en: '/en/tools/compress-pdf', es: '/es/tools/compress-pdf', 'x-default': landing.path } }, openGraph: { title: landing.title, description: landing.description, url: landing.path, type: 'website' } };
export default function CompressPdfPage() { return <PdfTaskLandingPage landing={landing}><PdfCompressorApp publicLanding /></PdfTaskLandingPage>; }
