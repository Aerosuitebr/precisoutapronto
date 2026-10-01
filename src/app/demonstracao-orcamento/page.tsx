import type { Metadata } from 'next';
import { QuoteDemo } from '@/components/orcamentos/quote-demo';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export const metadata: Metadata = { title: 'Veja um orçamento pronto', description: 'Experimente uma demonstração de aprovação de orçamento, sem cadastro.', alternates: { canonical: '/demonstracao-orcamento' } };
export default function Page() { return <><SiteHeader /><main><QuoteDemo /></main><SiteFooter /></>; }
