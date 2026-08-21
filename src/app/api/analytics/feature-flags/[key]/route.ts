import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { isValidFeatureFlagKey, parseFeatureFlagAdminPatch } from '@/lib/experimentation/flag-admin';
import { featureFlagSubjectHash } from '@/lib/experimentation/feature-flags';

export const dynamic = 'force-dynamic';

async function internalSession() {
  if (!isDatabaseConfigured()) return null;
  const session = await getValidSessionFromCookies();
  return session && isInternalDashboardEmail(session.email) ? session : null;
}

export async function GET(_: Request, context: { params: Promise<{ key: string }> }) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  const session = await internalSession();
  if (!session) return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });
  const { key } = await context.params;
  if (!isValidFeatureFlagKey(key)) return NextResponse.json({ error: 'Flag inválida.' }, { status: 400 });
  const flag = await getPrisma().featureFlag.findUnique({ where: { key } });
  if (!flag) return NextResponse.json({ error: 'Flag não encontrada.' }, { status: 404 });
  return NextResponse.json({
    flag,
    currentSubjectHash: featureFlagSubjectHash(session.sub),
    killSwitchActive: (process.env.FEATURE_KILL_SWITCHES || '').split(',').map((item) => item.trim()).some((item) => item === '*' || item === key)
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ key: string }> }) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  const session = await internalSession();
  if (!session) return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });
  const { key } = await context.params;
  if (!isValidFeatureFlagKey(key)) return NextResponse.json({ error: 'Flag inválida.' }, { status: 400 });
  const parsed = parseFeatureFlagAdminPatch(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const prisma = getPrisma();
  const previous = await prisma.featureFlag.findUnique({ where: { key } });
  if (!previous) return NextResponse.json({ error: 'Flag não encontrada.' }, { status: 404 });
  const updated = await prisma.featureFlag.update({
    where: { key },
    data: {
      ...(parsed.patch.enabled !== undefined ? { enabled: parsed.patch.enabled } : {}),
      ...(parsed.patch.rolloutPercent !== undefined ? { rolloutPercent: parsed.patch.rolloutPercent } : {}),
      ...(parsed.patch.rules ? { rules: parsed.patch.rules as Prisma.InputJsonValue } : {})
    }
  });
  await prisma.auditLog.create({
    data: {
      event: 'feature_flag.updated',
      userId: session.sub,
      email: session.email,
      meta: {
        flagKey: key,
        previous: { enabled: previous.enabled, rolloutPercent: previous.rolloutPercent, rules: previous.rules },
        next: { enabled: updated.enabled, rolloutPercent: updated.rolloutPercent, rules: updated.rules }
      }
    }
  });
  return NextResponse.json({ flag: updated });
}
