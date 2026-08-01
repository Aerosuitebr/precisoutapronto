import { NextResponse } from 'next/server';
import { reviewWithConfiguredProvider } from '@/lib/assistant/review';
import type { AssistantDocumentType } from '@/lib/assistant-briefing';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request-meta';
import { isDatabaseConfigured } from '@/lib/db';

const TYPES = new Set<AssistantDocumentType>(['contrato', 'curriculo', 'recibo', 'proposta']);
const KEYS = ['case', 'payment', 'risk'] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { type?: AssistantDocumentType; answers?: Record<string, unknown> } | null;
    if (!body?.type || !TYPES.has(body.type) || !body.answers) {
      return NextResponse.json({ error: 'Briefing inválido.' }, { status: 400 });
    }
    const answers = Object.fromEntries(KEYS.map((key) => [key, typeof body.answers?.[key] === 'string' ? body.answers[key].trim().slice(0, 2000) : '']));
    if (!answers.case || !answers.payment) return NextResponse.json({ error: 'Briefing incompleto.' }, { status: 400 });
    if (isDatabaseConfigured()) {
      const ip = await getClientIp();
      const rate = await consumeRateLimit({ key: `assistant-review:ip:${ip}`, ...RATE_LIMITS.assistantReview });
      if (!rate.allowed) return NextResponse.json({ error: 'Limite de análises atingido. Tente novamente mais tarde.' }, { status: 429 });
    }
    const review = await reviewWithConfiguredProvider(body.type, answers);
    return NextResponse.json({ review });
  } catch (error) {
    console.error('[assistant:review]', error);
    return NextResponse.json({ error: 'Não foi possível analisar o briefing.' }, { status: 500 });
  }
}
