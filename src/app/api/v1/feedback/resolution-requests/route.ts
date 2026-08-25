import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request-meta';
import { pseudonymizeFeedbackIdentity, validFeedbackAnonymousKey } from '@/lib/feedback/helpfulness';
import { createResolutionRequest, parseResolutionRequest } from '@/lib/feedback/resolution-requests';
import { emitServerProductEvent } from '@/lib/events/server-emitter';

export async function POST(request: Request) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const rateKey = createHash('sha256').update(await getClientIp()).digest('hex').slice(0, 32);
  const rate = await consumeRateLimit({ key: `resolution-request:${rateKey}`, ...RATE_LIMITS.recommendationEvents });
  if (!rate.allowed) return NextResponse.json({ accepted: false }, {
    status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) }
  });
  const body = await request.json().catch(() => null);
  const parsed = parseResolutionRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Pedido inválido.', code: parsed.error }, { status: 400 });
  const session = await getValidSessionFromCookies();
  const anonymousKey = request.headers.get('x-precisoutapronto-device-id') || '';
  if (!validFeedbackAnonymousKey(anonymousKey)) return NextResponse.json({ error: 'Identidade inválida.' }, { status: 400 });
  const result = await createResolutionRequest({
    ...(session ? { userId: session.sub } : {}),
    anonymousId: pseudonymizeFeedbackIdentity(anonymousKey)
  }, parsed.data);
  if (!result) return NextResponse.json({ error: 'Pedido temporariamente indisponível.' }, { status: 503 });
  await emitServerProductEvent({
    eventName: 'request.resolution_gap',
    deviceId: anonymousKey,
    ...(session?.sid ? { authenticatedSessionId: session.sid } : {}),
    ...(session ? { userId: session.sub } : {}),
    properties: { normalized_intent: result.normalizedIntent, source: parsed.data.source }
  });
  return NextResponse.json({ accepted: true, requestId: result.requestId }, { status: 201 });
}
