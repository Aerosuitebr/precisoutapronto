import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { SHARED_RESULT_TOOLS, sanitizeSharedResultLines } from '@/lib/shared-results';

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Compartilhamento temporariamente indisponível.' }, { status: 503 });
  }
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const tool = typeof body.tool === 'string' ? body.tool : '';
  const config = SHARED_RESULT_TOOLS[tool];
  const lines = sanitizeSharedResultLines(body.lines);
  if (!config || lines.length === 0) {
    return NextResponse.json({ error: 'Resultado inválido.' }, { status: 400 });
  }

  const token = randomBytes(7).toString('base64url');
  const expiresAt = new Date(Date.now() + 30 * 86_400_000);
  const result = await getPrisma().sharedResult.create({
    data: {
      token,
      tool,
      title: typeof body.title === 'string' ? body.title.trim().slice(0, 90) : 'Resultado pronto',
      subtitle: typeof body.subtitle === 'string' ? body.subtitle.trim().slice(0, 140) : null,
      data: lines as unknown as Prisma.InputJsonValue,
      ctaLabel: config.cta,
      ctaPath: config.path,
      source: typeof body.source === 'string' ? body.source.slice(0, 40) : 'result',
      referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 32) : null,
      expiresAt
    }
  });
  return NextResponse.json({ id: result.token, url: `/r/${result.token}`, expiresAt: expiresAt.toISOString() });
}
