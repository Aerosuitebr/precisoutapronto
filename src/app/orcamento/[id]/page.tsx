import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { OrcamentoPublicView } from '@/components/orcamentos/orcamento-public-view';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { toOrcamentoPublic } from '@/lib/orcamentos/public-map';
import type { OrcamentoPublic } from '@/lib/orcamentos/types';
import { isLikelyBot } from '@/lib/i18n-locale';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'Você recebeu um orçamento | Precisou, Tá Pronto' },
  description: 'Abra para conferir os itens e responder pelo celular. Sem instalar aplicativo e sem criar conta.',
  openGraph: {
    title: 'Você recebeu um orçamento',
    description: 'Confira os itens e aprove ou peça um ajuste pelo celular.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Você recebeu um orçamento',
    description: 'Confira os itens e responda pelo celular.'
  },
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer'
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source_occupation?: string }>;
}

async function loadOrcamento(id: string, markViewed: boolean): Promise<OrcamentoPublic | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const prisma = getPrisma();
    const row = await prisma.orcamento.findUnique({ where: { id } });
    if (!row) return null;
    if (markViewed && !row.firstViewedAt) {
      try {
        await prisma.$executeRaw`
          UPDATE "orcamentos"
          SET "firstViewedAt" = NOW()
          WHERE "id" = CAST(${id} AS uuid) AND "firstViewedAt" IS NULL
        `;
      } catch {
        // A falha da telemetria nunca deve impedir o destinatário de abrir o orçamento.
      }
    }
    return toOrcamentoPublic(row);
  } catch {
    return null;
  }
}

export default async function OrcamentoPublicPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { source_occupation: sourceOccupation } = await searchParams;
  const userAgent = (await headers()).get('user-agent');
  const orcamento = await loadOrcamento(id, !isLikelyBot(userAgent));

  if (!orcamento) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Orçamento indisponível</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Não encontramos este orçamento. Confira o link ou peça um novo ao profissional.
            Se o banco ainda não estiver configurado neste ambiente, o link público não estará ativo.
          </p>
        </div>
      </div>
    );
  }

  return <OrcamentoPublicView initial={orcamento} sourceOccupation={sourceOccupation} />;
}
