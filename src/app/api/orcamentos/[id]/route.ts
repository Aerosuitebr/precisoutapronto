import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { notifyProfissional } from '@/lib/orcamentos/notify';
import { toOrcamentoPublic } from '@/lib/orcamentos/public-map';
import { validateOrcamentoPayload, validateStatusPatch } from '@/lib/orcamentos/schema';
import type { OrcamentoPublic } from '@/lib/orcamentos/types';

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

type RouteContext = { params: Promise<{ id: string }> };

function toPublic(row: Parameters<typeof toOrcamentoPublic>[0], includePix?: boolean): OrcamentoPublic {
  return toOrcamentoPublic(row, includePix === undefined ? undefined : { includePix });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }

    const { id } = await context.params;
    const prisma = getPrisma();
    const row = await prisma.orcamento.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(toPublic(row));
  } catch (error) {
    console.error('[GET /api/orcamentos/:id]', error);
    return NextResponse.json({ error: 'Não foi possível carregar o orçamento.' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }

    const body = await request.json();
    const validated = validateOrcamentoPayload(body);
    if (!validated.ok || !validated.data) {
      return NextResponse.json({ error: validated.error || 'Dados inválidos.' }, { status: 400 });
    }

    const { id } = await context.params;
    const prisma = getPrisma();
    const existing = await prisma.orcamento.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }
    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Só é possível editar orçamentos ainda aguardando resposta.', orcamento: toPublic(existing) },
        { status: 409 }
      );
    }

    const ownerEmail = validated.data.ownerEmail?.toLowerCase() || null;
    if (!ownerEmail || existing.ownerEmail?.toLowerCase() !== ownerEmail) {
      return NextResponse.json({ error: 'Você não pode editar este orçamento.' }, { status: 403 });
    }

    const updated = await prisma.orcamento.update({
      where: { id },
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
        profissionalLogoDataUrl: validated.data.profissionalLogoDataUrl || null,
        sourceOccupation: validated.data.sourceOccupation || null
        ,recruitedFromDocument: validated.data.recruitedFromDocument || null
      }
    });

    const url = `${appBaseUrl(request)}/orcamento/${updated.id}`;
    return NextResponse.json({
      id: updated.id,
      url,
      total: updated.total,
      status: updated.status,
      orcamento: toPublic(updated, true)
    });
  } catch (error) {
    console.error('[PUT /api/orcamentos/:id]', error);
    return NextResponse.json({ error: 'Não foi possível atualizar o orçamento.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }

    const body = await request.json();
    const validated = validateStatusPatch(body);
    if (!validated.ok || !validated.status) {
      return NextResponse.json({ error: validated.error || 'Dados inválidos.' }, { status: 400 });
    }

    const { id } = await context.params;
    const prisma = getPrisma();
    const existing = await prisma.orcamento.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }
    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Este orçamento já foi respondido e não pode ser alterado.', orcamento: toPublic(existing) },
        { status: 409 }
      );
    }

    const updated = await prisma.orcamento.update({
      where: { id },
      data: {
        status: validated.status,
        feedbackCliente: validated.feedbackCliente ?? null
      }
    });

    const publicUrl = `${appBaseUrl(request)}/orcamento/${updated.id}`;
    const notifications = await notifyProfissional({
      id: updated.id,
      profissionalNome: updated.profissionalNome,
      profissionalWhatsapp: updated.profissionalWhatsapp,
      clienteNome: updated.clienteNome,
      total: updated.total,
      status: validated.status as 'approved' | 'declined',
      feedbackCliente: updated.feedbackCliente,
      ownerEmail: updated.ownerEmail,
      publicUrl
    });

    return NextResponse.json({
      ...toPublic(updated),
      notifications
    });
  } catch (error) {
    console.error('[PATCH /api/orcamentos/:id]', error);
    return NextResponse.json({ error: 'Não foi possível atualizar o orçamento.' }, { status: 500 });
  }
}
