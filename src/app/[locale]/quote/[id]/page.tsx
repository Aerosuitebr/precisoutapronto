import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalQuotePublicView } from '@/components/orcamentos/international-quote-public-view';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { isInternationalLocale } from '@/lib/i18n';
import type { OrcamentoItem, OrcamentoPublic } from '@/lib/orcamentos/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer'
};

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

async function loadQuote(id: string): Promise<OrcamentoPublic | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const row = await getPrisma().orcamento.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id,
      profissionalNome: row.profissionalNome,
      profissionalWhatsapp: row.profissionalWhatsapp,
      clienteNome: row.clienteNome,
      clienteContato: row.clienteContato,
      clienteEmail: row.clienteEmail || '',
      itens: row.itens as unknown as OrcamentoItem[],
      total: row.total,
      validade: row.validade,
      observacoes: row.observacoes,
      status: row.status,
      feedbackCliente: row.feedbackCliente,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  } catch {
    return null;
  }
}

export default async function LocalizedQuotePage({ params }: PageProps) {
  const { locale, id } = await params;
  if (!isInternationalLocale(locale)) notFound();
  const quote = await loadQuote(id);
  if (!quote) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">
            {locale === 'en' ? 'Quote unavailable' : 'Presupuesto no disponible'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {locale === 'en'
              ? 'Check the link or ask the professional to send a new one.'
              : 'Revisa el enlace o solicita uno nuevo al profesional.'}
          </p>
        </div>
      </main>
    );
  }
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalQuotePublicView locale={locale} initial={quote} />
    </>
  );
}
