import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/db';
import { isMailConfigured, sendEmail } from '@/lib/mail/send-email';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';

const SUGGESTION_TO = process.env.TOOL_SUGGESTION_TO || 'contato@resolvajato.com.br';
const MAX_MESSAGE_LEN = 1200;
const MAX_NAME_LEN = 120;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | {
          message?: string;
          name?: string;
          email?: string;
          category?: string;
          website?: string; // honeypot
        }
      | null;

    if (!body) {
      return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
    }

    // Honeypot: campo invisível que só bots preenchem.
    if (body.website && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const message = (body.message || '').trim();
    const name = (body.name || '').trim().slice(0, MAX_NAME_LEN);
    const email = (body.email || '').trim().slice(0, 180);
    const category = (body.category || '').trim().slice(0, 80);

    if (message.length < 8) {
      return NextResponse.json(
        { error: 'Conte com um pouco mais de detalhe o que você precisa (mín. 8 caracteres).' },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE_LEN) {
      return NextResponse.json(
        { error: `Mensagem muito longa (máx. ${MAX_MESSAGE_LEN} caracteres).` },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }

    const ip = getClientIp();
    const userAgent = getClientUserAgent();

    if (isDatabaseConfigured()) {
      const rate = await consumeRateLimit({
        key: `tool-suggestion:ip:${ip}`,
        ...RATE_LIMITS.toolSuggestion
      });
      if (!rate.allowed) {
        return NextResponse.json(
          { error: `Muitas sugestões enviadas. Tente novamente em ${rate.retryAfterSec}s.` },
          { status: 429 }
        );
      }
    }

    if (!isMailConfigured()) {
      // Sem provedor de e-mail configurado: registra no log do servidor para não perder a sugestão.
      console.warn('[tool-suggestion] envio de e-mail não configurado. Sugestão recebida:', {
        message,
        name,
        email,
        category,
        ip
      });
      return NextResponse.json({ ok: true, delivered: false });
    }

    const subject = category
      ? `Sugestão de ferramenta — ${category}`
      : 'Sugestão de ferramenta';

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Nova sugestão de ferramenta</h2>
        ${category ? `<p><strong>Categoria:</strong> ${escapeHtml(category)}</p>` : ''}
        <p><strong>Mensagem:</strong></p>
        <p style="white-space: pre-wrap; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">${escapeHtml(
          message
        )}</p>
        <hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0;" />
        <p style="color:#64748b; font-size:12px;">
          ${name ? `Nome: ${escapeHtml(name)}<br/>` : ''}
          ${email ? `E-mail para contato: ${escapeHtml(email)}<br/>` : ''}
          IP: ${escapeHtml(ip)}<br/>
          User-Agent: ${escapeHtml(userAgent || 'desconhecido')}
        </p>
      </div>
    `;

    const text = [
      'Nova sugestão de ferramenta',
      category ? `Categoria: ${category}` : null,
      '',
      message,
      '',
      name ? `Nome: ${name}` : null,
      email ? `E-mail para contato: ${email}` : null,
      `IP: ${ip}`
    ]
      .filter(Boolean)
      .join('\n');

    const result = await sendEmail({ to: SUGGESTION_TO, subject, html, text });

    if (!result.sent) {
      console.error('[tool-suggestion] falha ao enviar e-mail:', result.error);
      return NextResponse.json(
        { error: 'Não conseguimos enviar sua sugestão agora. Tente novamente em instantes.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error('[tool-suggestion] erro inesperado:', error);
    return NextResponse.json({ error: 'Erro inesperado ao enviar sua sugestão.' }, { status: 500 });
  }
}
