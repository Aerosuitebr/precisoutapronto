import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { parseCustomerCreate } from '@/lib/context/contracts';
import { createContextCustomer } from '@/lib/context/customer-repository';
import { listContextCustomers, parseCustomerListQuery } from '@/lib/context/customer-reader';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const query = parseCustomerListQuery(new URL(request.url).searchParams);
  if (!query) return NextResponse.json({ error: 'Consulta inválida.' }, { status: 400 });
  const result = await listContextCustomers(session.sub, query);
  if (!result) return NextResponse.json({ error: 'Clientes temporariamente indisponíveis.' }, { status: 503 });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!isTrustedWriteOrigin(request)) {
    return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  }
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = parseCustomerCreate(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Cliente inválido.', code: parsed.error }, { status: 400 });
  const result = await createContextCustomer(session.sub, parsed.data);
  if (!result) return NextResponse.json({ error: 'Clientes temporariamente indisponíveis.' }, { status: 503 });
  if (result.duplicate) {
    return NextResponse.json({ duplicate: true, customer: result.customer }, { status: 409 });
  }
  return NextResponse.json(result, { status: 201 });
}
