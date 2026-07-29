import type { Metadata } from 'next';
import { DocumentAssistant } from '@/components/assistant/document-assistant';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export const metadata: Metadata = { title: 'Assistente de documentos', description: 'Explique seu caso, responda perguntas e prepare uma primeira versão antes de abrir o editor.' };
type Props = { searchParams: Promise<{ tipo?: string }> };
export default async function AssistantPage({ searchParams }: Props) {
  const type = (await searchParams).tipo;
  const initialType = type === 'curriculo' || type === 'recibo' || type === 'proposta' ? type : 'contrato';
  return <><SiteHeader /><main className="min-h-[75vh] bg-[linear-gradient(145deg,#f8fafc,#ecfdf5)] px-4 py-12 sm:px-6"><div className="mx-auto mb-8 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Documento guiado</p><h1 className="rj-display mt-3 text-4xl font-extrabold text-slate-950">Conte seu caso. O assistente organiza o caminho.</h1><p className="mt-4 text-lg leading-8 text-slate-600">O fluxo adiciona perguntas, sugestões e alertas antes dos geradores existentes.</p></div><DocumentAssistant initialType={initialType} /></main><SiteFooter /></>;
}
