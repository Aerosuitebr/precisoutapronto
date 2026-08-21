import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { parseCustomerPatch } from '@/lib/context/contracts';
import { archiveContextCustomer, updateContextCustomer } from '@/lib/context/customer-repository';
import { getContextCustomer } from '@/lib/context/customer-reader';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';

type RouteContext = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: RouteContext) {
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 });
  const result = await getContextCustomer(session.sub, id);
  if (!result) return NextResponse.json({ error: 'Clientes temporariamente indisponíveis.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, customer: null });
  if (result.notFound) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
  return NextResponse.json({ enabled: true, customer: result.customer });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 });
  const body = await request.json().catch(() => null);
  const parsed = parseCustomerPatch(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Cliente inválido.', code: parsed.error }, { status: 400 });
  const result = await updateContextCustomer(session.sub, id, parsed.data);
  if (!result) return NextResponse.json({ error: 'Clientes temporariamente indisponíveis.' }, { status: 503 });
  if (result.notFound) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
  return NextResponse.json({ updated: true, customer: result.customer });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 });
  const result = await archiveContextCustomer(session.sub, id);
  if (!result) return NextResponse.json({ error: 'Clientes temporariamente indisponíveis.' }, { status: 503 });
  if (result.notFound) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
  return NextResponse.json({ archived: true, archivedAt: result.archivedAt });
}
