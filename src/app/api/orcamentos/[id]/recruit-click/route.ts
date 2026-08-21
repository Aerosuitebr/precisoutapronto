import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(_request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) return new NextResponse(null, { status: 204 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 400 });

  try {
    await getPrisma().$executeRaw`
      UPDATE "orcamentos"
      SET "firstRecruitClickedAt" = NOW()
      WHERE "id" = CAST(${id} AS uuid)
        AND "status" IN ('approved', 'declined')
        AND "firstRecruitClickedAt" IS NULL
    `;
  } catch {
    // A medição nunca bloqueia a navegação para o editor.
  }
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'private, no-store' } });
}
