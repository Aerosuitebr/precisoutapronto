import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { parsePersonalTemplateCreate } from '@/lib/templates/contracts';
import { createPersonalTemplate } from '@/lib/templates/repository';

export async function POST(request: Request) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = parsePersonalTemplateCreate(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Template inválido.', code: parsed.error }, { status: 400 });
  const result = await createPersonalTemplate(session.sub, parsed.data);
  if (!result) return NextResponse.json({ error: 'Templates temporariamente indisponíveis.' }, { status: 503 });
  if (!result.enabled) return NextResponse.json({ enabled: false, created: false });
  if (result.notFound) return NextResponse.json({ error: 'Artefato de origem não encontrado.' }, { status: 404 });
  return NextResponse.json({ enabled: true, created: true, template: result.template }, { status: 201 });
}
