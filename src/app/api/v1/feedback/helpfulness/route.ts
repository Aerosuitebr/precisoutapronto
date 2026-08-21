import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isTrustedWriteOrigin } from '@/lib/security/request-origin';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request-meta';
import {
  createHelpfulnessFeedback,
  parseHelpfulnessFeedback,
  pseudonymizeFeedbackIdentity,
  validFeedbackAnonymousKey
} from '@/lib/feedback/helpfulness';
import { emitServerProductEvent } from '@/lib/events/server-emitter';

export async function POST(request: Request) {
  if (!isTrustedWriteOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  const rateKey = createHash('sha256').update(await getClientIp()).digest('hex').slice(0, 32);
  const rate = await consumeRateLimit({ key: `helpfulness:${rateKey}`, ...RATE_LIMITS.recommendationEvents });
  if (!rate.allowed) return NextResponse.json({ accepted: false }, {
    status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) }
  });
  const body = await request.json().catch(() => null);
  const parsed = parseHelpfulnessFeedback(body);
  if (!parsed.ok) return NextResponse.json({ error: 'Feedback inválido.', code: parsed.error }, { status: 400 });
  const session = await getValidSessionFromCookies();
  const anonymousKey = request.headers.get('x-rj-device-id') || '';
  if (!validFeedbackAnonymousKey(anonymousKey)) return NextResponse.json({ error: 'Identidade inválida.' }, { status: 400 });
  const result = await createHelpfulnessFeedback({
    ...(session ? { userId: session.sub } : {}),
    anonymousId: pseudonymizeFeedbackIdentity(anonymousKey)
  }, parsed.data);
  if (!result) return NextResponse.json({ error: 'Feedback temporariamente indisponível.' }, { status: 503 });
  await emitServerProductEvent({
    eventName: 'feedback.helpfulness',
    deviceId: anonymousKey,
    ...(session?.sid ? { authenticatedSessionId: session.sid } : {}),
    ...(session ? { userId: session.sub } : {}),
    properties: {
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      rating: parsed.data.rating
    }
  });
  return NextResponse.json({ accepted: true, feedbackId: result.feedbackId }, { status: 201 });
}
