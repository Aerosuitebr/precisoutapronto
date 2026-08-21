import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { restoreContextCustomer } from '@/lib/context/customer-repository';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 });
  const result = await restoreContextCustomer(session.sub, id);
  if (!result) return NextResponse.json({ error: 'Clientes temporariamente indisponíveis.' }, { status: 503 });
  if (result.notFound) return NextResponse.json({ error: 'Cliente arquivado não encontrado.' }, { status: 404 });
  return NextResponse.json({ restored: true, restoredAt: result.restoredAt });
}
