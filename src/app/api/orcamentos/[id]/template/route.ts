import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { toSafeQuoteTemplate } from '@/lib/orcamentos/safe-template';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  }
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Modelo inválido.' }, { status: 400 });

  try {
    const row = await getPrisma().orcamento.findUnique({
      where: { id },
      select: { itens: true, sourceOccupation: true }
    });
    if (!row) return NextResponse.json({ error: 'Modelo não encontrado.' }, { status: 404 });

    return NextResponse.json(
      {
        items: toSafeQuoteTemplate(row.itens),
        sourceOccupation: row.sourceOccupation?.slice(0, 120) || ''
      },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('[GET /api/orcamentos/:id/template]', error);
    return NextResponse.json({ error: 'Não foi possível carregar o modelo.' }, { status: 500 });
  }
}
