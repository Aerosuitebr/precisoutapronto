import type { Metadata } from 'next';
import { ImageStudioApp } from '@/components/image-tools/image-studio-app';
import { PdfTaskLandingPage } from '@/components/marketing/pdf-task-landing-page';
import { getImageTaskLanding } from '@/lib/seo/image-task-landings';
const landing = getImageTaskLanding('optimize', 'pt-BR');
export const metadata: Metadata = { title: landing.title, description: landing.description, alternates: { canonical: landing.path, languages: { 'pt-BR': landing.path, en: '/en/tools/image-optimizer', es: '/es/tools/image-optimizer', 'x-default': landing.path } }, openGraph: { title: landing.title, description: landing.description, url: landing.path, type: 'website' } };
export default function ImageOptimizerPage() { return <PdfTaskLandingPage landing={landing}><ImageStudioApp mode="optimize" publicLanding /></PdfTaskLandingPage>; }
