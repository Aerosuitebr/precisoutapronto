import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { parseIntentEdgeAdminPatch } from '@/lib/intent-graph/admin';
import { isSafeIntentKey } from '@/lib/intent-graph/contracts';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ fromKey: string; toKey: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  }
  const session = await getValidSessionFromCookies();
  if (!session || !isInternalDashboardEmail(session.email)) {
    return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });
  }
  const { fromKey, toKey } = await context.params;
  if (!isSafeIntentKey(fromKey) || !isSafeIntentKey(toKey) || fromKey === toKey) {
    return NextResponse.json({ error: 'Edge inválido.' }, { status: 400 });
  }
  const parsed = parseIntentEdgeAdminPatch(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const prisma = getPrisma();
  const nodes = await prisma.intentNode.findMany({
    where: { key: { in: [fromKey, toKey] } },
    select: { id: true, key: true }
  });
  const fromNode = nodes.find((node) => node.key === fromKey);
  const toNode = nodes.find((node) => node.key === toKey);
  if (!fromNode || !toNode) return NextResponse.json({ error: 'Node não encontrado.' }, { status: 404 });

  const where = {
    fromNodeId_toNodeId_relationType: {
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
      relationType: 'next_action'
    }
  };
  const previous = await prisma.intentEdge.findUnique({ where });
  if (!previous) return NextResponse.json({ error: 'Edge não encontrado.' }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const edge = await tx.intentEdge.update({
      where,
      data: {
        ...(parsed.patch.active !== undefined ? { active: parsed.patch.active } : {}),
        ...(parsed.patch.weight !== undefined ? { weight: parsed.patch.weight } : {}),
        ...(parsed.patch.transferSchema ? { transferSchema: parsed.patch.transferSchema as unknown as Prisma.InputJsonValue } : {}),
        ...(parsed.patch.ruleJson ? { ruleJson: parsed.patch.ruleJson as Prisma.InputJsonValue } : {})
      }
    });
    await tx.auditLog.create({
      data: {
        event: 'intent_edge.updated',
        userId: session.sub,
        email: session.email,
        meta: {
          fromKey,
          toKey,
          relationType: 'next_action',
          previous: {
            active: previous.active,
            weight: Number(previous.weight),
            transferSchema: previous.transferSchema,
            ruleJson: previous.ruleJson
          },
          next: {
            active: edge.active,
            weight: Number(edge.weight),
            transferSchema: edge.transferSchema,
            ruleJson: edge.ruleJson
          }
        }
      }
    });
    return edge;
  });

  return NextResponse.json({
    edge: {
      fromKey,
      toKey,
      relationType: updated.relationType,
      active: updated.active,
      weight: Number(updated.weight),
      transferSchema: updated.transferSchema,
      ruleJson: updated.ruleJson
    }
  });
}
