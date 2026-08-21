import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { parseIntentNodeAdminPatch } from '@/lib/intent-graph/admin';
import { isSafeIntentKey } from '@/lib/intent-graph/contracts';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  }
  const session = await getValidSessionFromCookies();
  if (!session || !isInternalDashboardEmail(session.email)) {
    return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });
  }
  const { key } = await context.params;
  if (!isSafeIntentKey(key)) return NextResponse.json({ error: 'Node inválido.' }, { status: 400 });
  const parsed = parseIntentNodeAdminPatch(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const prisma = getPrisma();
  const previous = await prisma.intentNode.findUnique({ where: { key } });
  if (!previous) return NextResponse.json({ error: 'Node não encontrado.' }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const node = await tx.intentNode.update({ where: { key }, data: parsed.patch });
    await tx.auditLog.create({
      data: {
        event: 'intent_node.updated',
        userId: session.sub,
        email: session.email,
        meta: {
          nodeKey: key,
          previous: {
            active: previous.active,
            label: previous.label,
            description: previous.description,
            frequencyClass: previous.frequencyClass,
            riskLevel: previous.riskLevel
          },
          next: {
            active: node.active,
            label: node.label,
            description: node.description,
            frequencyClass: node.frequencyClass,
            riskLevel: node.riskLevel
          }
        }
      }
    });
    return node;
  });

  return NextResponse.json({
    node: {
      key: updated.key,
      type: updated.type,
      active: updated.active,
      label: updated.label,
      description: updated.description,
      frequencyClass: updated.frequencyClass,
      riskLevel: updated.riskLevel,
      updatedAt: updated.updatedAt.toISOString()
    }
  });
}
