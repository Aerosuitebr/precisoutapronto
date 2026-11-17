import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorPdfApp } from '@/components/editor-pdf/editor-pdf-app';
import { OrphanToolLandingPage } from '@/components/marketing/orphan-tool-landing-page';
import { getOrphanLanding } from '@/lib/seo/orphan-tool-landings';
import { getViralBaseUrl } from '@/lib/viral-loop';
import { ToolStartBoundary } from '@/components/analytics/tool-start-boundary';

const landing = getOrphanLanding('editor-pdf')!;
const SITE = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: landing.metaTitle,
  description: landing.metaDescription,
  keywords: landing.keywords,
  alternates: { canonical: landing.path },
  openGraph: {
    title: landing.metaTitle,
    description: landing.metaDescription,
    url: `${SITE}${landing.path}`,
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: `${landing.path}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: landing.metaTitle,
    description: landing.metaDescription,
    images: [`${landing.path}/opengraph-image`]
  }
};

export default function EditorDePdfOnlinePage() {
  return (
    <OrphanToolLandingPage landing={landing}>
      <nav aria-label="Outras tarefas com PDF" className="mb-4 flex flex-wrap gap-2">
        <Link className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50" href="/juntar-pdf-online#tool">Juntar PDFs</Link>
        <Link className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50" href="/dividir-pdf-online#tool">Dividir PDF</Link>
        <Link className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50" href="/comprimir-pdf-online#tool">Comprimir PDF</Link>
      </nav>
      <ToolStartBoundary toolName="editor-pdf" landingPath={landing.path}>
        <EditorPdfApp publicLanding />
      </ToolStartBoundary>
    </OrphanToolLandingPage>
  );
}
