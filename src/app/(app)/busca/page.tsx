import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BuscaClient } from './search-client';

export const metadata: Metadata = {
  title: 'Busca de ferramentas e recursos',
  description:
    'Encontre geradores de currículo, contrato, recibo, proposta, orçamento com Pix e guias práticos do Precisou, Tá Pronto.',
  alternates: { canonical: '/busca' },
  openGraph: {
    title: 'Busca | Precisou, Tá Pronto',
    description: 'Encontre a ferramenta ou o guia certo para resolver agora.',
    url: '/busca'
  },
  robots: { index: false, follow: true }
};

export default function BuscaPage() {
  return (
    <div className="space-y-6">
      <Suspense>
        <BuscaClient />
      </Suspense>
    </div>
  );
}
