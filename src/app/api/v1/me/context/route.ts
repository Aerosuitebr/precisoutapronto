import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { readBusinessContextProfile } from '@/lib/context/profile-reader';
import { writeBusinessContextProfile } from '@/lib/context/profile-repository';
import { parseBusinessContextWrite } from '@/lib/context/contracts';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const result = await readBusinessContextProfile(session.sub);
  if (!result) {
    return NextResponse.json({ error: 'Contexto temporariamente indisponível.' }, { status: 503 });
  }
  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  if (!isTrustedWriteOrigin(request)) {
    return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  }
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = parseBusinessContextWrite(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Contexto inválido.', code: parsed.error }, { status: 400 });
  }
  const result = await writeBusinessContextProfile(session.sub, parsed.data);
  if (!result) {
    return NextResponse.json({ error: 'Contexto temporariamente indisponível.' }, { status: 503 });
  }
  return NextResponse.json({ saved: true, id: result.id });
}
