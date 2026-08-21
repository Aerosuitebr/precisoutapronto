import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isDatabaseConfigured } from '@/lib/db';
import { isSafeIntentKey } from '@/lib/intent-graph/contracts';
import { getActiveIntentGraph } from '@/lib/intent-graph/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  }
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!isInternalDashboardEmail(session.email)) {
    return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });
  }

  const toolKey = new URL(request.url).searchParams.get('toolKey') || undefined;
  if (toolKey && !isSafeIntentKey(toolKey)) {
    return NextResponse.json({ error: 'toolKey inválido.' }, { status: 400 });
  }
  const nodes = await getActiveIntentGraph(toolKey);
  return NextResponse.json({
    nodes,
    totals: {
      nodes: nodes.length,
      edges: nodes.reduce((total, node) => total + node.outgoingEdges.length, 0)
    },
    mode: 'read-only',
    publicConsumer: false
  });
}
