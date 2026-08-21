import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { buildServerEventIdentity, emitServerProductEvent } from '@/lib/events/server-emitter';
import { writeCanonicalArtifactShadow } from '@/lib/artifacts/writer';
import { validateOrcamentoPayload } from '@/lib/orcamentos/schema';
import { DEVICE_COOKIE } from '@/lib/security/device-cookie';
import type { OrcamentoItem } from '@/lib/orcamentos/types';

function appBaseUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;
  const origin = request.headers.get('origin');
  if (origin) return origin;
  const host = request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  }
  return 'http://localhost:3000';
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            'Banco não configurado. Defina DATABASE_URL no .env (veja .env.example) e rode npx prisma db push.'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = validateOrcamentoPayload(body);
    if (!validated.ok || !validated.data) {
      return NextResponse.json({ error: validated.error || 'Dados inválidos.' }, { status: 400 });
    }

    const prisma = getPrisma();
    const session = await getValidSessionFromCookies();
    const effectiveOwnerEmail = session?.email.trim().toLowerCase() || null;
    const owner = effectiveOwnerEmail
      ? await prisma.user.findUnique({
          where: { email: effectiveOwnerEmail },
          select: { profile: { select: { logoDataUrl: true, occupation: true, segment: true } } }
        })
      : null;
    const requestedRecruitSource = validated.data.recruitedFromDocument || '';
    const recruitSource = requestedRecruitSource
      ? await prisma.orcamento.findUnique({
          where: { id: requestedRecruitSource },
          select: { id: true, status: true }
        })
      : null;
    const recruitedFromDocument = recruitSource && recruitSource.status !== 'pending'
      ? recruitSource.id
      : null;
    const created = await prisma.orcamento.create({
      data: {
        profissionalNome: validated.data.profissionalNome,
        profissionalWhatsapp: validated.data.profissionalWhatsapp,
        clienteNome: validated.data.clienteNome,
        clienteContato: validated.data.clienteContato || '',
        clienteEmail: validated.data.clienteEmail || '',
        itens: validated.data.itens as unknown as Prisma.InputJsonValue,
        total: validated.data.total,
        validade: validated.data.validade || '',
        observacoes: validated.data.observacoes || '',
        pixKey: validated.data.pixKey || '',
        pixKeyType: validated.data.pixKeyType || '',
        pixMerchantName: validated.data.pixMerchantName || '',
        pixMerchantCity: validated.data.pixMerchantCity || '',
        ownerEmail: effectiveOwnerEmail,
        profissionalLogoDataUrl: validated.data.profissionalLogoDataUrl || owner?.profile?.logoDataUrl || null,
        sourceOccupation: validated.data.sourceOccupation || owner?.profile?.occupation || owner?.profile?.segment || null
        ,recruitedFromDocument
      }
    });

    const url = `${appBaseUrl(request)}/orcamento/${created.id}`;
    const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value || '';
    const completedAt = new Date();
    const anonymousSessionId = deviceId
      ? buildServerEventIdentity({
          deviceId,
          authenticatedSessionId: session?.sid,
          occurredAt: completedAt
        }).sessionId
      : undefined;
    const canonical = await writeCanonicalArtifactShadow({
      ...(session?.sub ? { userId: session.sub } : {}),
      ...(anonymousSessionId ? { anonymousSessionId } : {}),
      toolKey: 'orcamentos',
      intentKey: 'orcamentos',
      artifactType: 'quote',
      legacyArtifactId: created.id,
      summary: {
        total_items: validated.data.itens.length,
        outcome: 'share_link'
      }
    });
    await emitServerProductEvent({
      eventName: 'task.completed',
      occurredAt: completedAt,
      deviceId,
      authenticatedSessionId: session?.sid,
      userId: session?.sub,
      toolKey: 'orcamentos',
      taskId: canonical?.taskId,
      artifactId: canonical?.artifactId || created.id,
      properties: {
        duration_ms: Date.now() - startedAt,
        outcome_type: 'share_link'
      }
    });
    return NextResponse.json({
      id: created.id,
      url,
      total: created.total,
      status: created.status,
      whatsapp: {
        sent: false,
        configured: true,
        mode: 'ephemeral',
        error: null
      }
    });
  } catch (error) {
    console.error('[POST /api/orcamentos]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível salvar o orçamento.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get('ownerEmail')?.trim().toLowerCase();
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Informe ownerEmail para listar orçamentos.' }, { status: 400 });
    }
    const session = await getValidSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (session.email.trim().toLowerCase() !== ownerEmail) {
      return NextResponse.json({ error: 'Você só pode consultar seus próprios orçamentos.' }, { status: 403 });
    }

    const prisma = getPrisma();
    const rows = await prisma.orcamento.findMany({
      where: { ownerEmail },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const base = appBaseUrl(request);
    return NextResponse.json(
      { items: rows.map((row) => ({
        id: row.id,
        url: `${base}/orcamento/${row.id}`,
        clienteNome: row.clienteNome,
        clienteContato: row.clienteContato,
        clienteEmail: row.clienteEmail,
        profissionalNome: row.profissionalNome,
        profissionalWhatsapp: row.profissionalWhatsapp,
        profissionalLogoDataUrl: row.profissionalLogoDataUrl || '',
        sourceOccupation: row.sourceOccupation || '',
        recruitedFromDocument: row.recruitedFromDocument || '',
        validade: row.validade,
        observacoes: row.observacoes,
        itens: row.itens as unknown as OrcamentoItem[],
        total: row.total,
        pixKey: row.pixKey,
        pixKeyType: row.pixKeyType,
        pixMerchantName: row.pixMerchantName,
        pixMerchantCity: row.pixMerchantCity,
        status: row.status,
        firstViewedAt: row.firstViewedAt?.toISOString() || '',
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      })) },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('[GET /api/orcamentos]', error);
    return NextResponse.json({ error: 'Não foi possível listar orçamentos.' }, { status: 500 });
  }
}
