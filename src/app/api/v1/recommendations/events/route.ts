import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isDatabaseConfigured } from '@/lib/db';
import { recordRecommendationInteraction, type RecommendationInteraction } from '@/lib/recommendation/events';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { DEVICE_COOKIE } from '@/lib/security/device-cookie';
import { getClientIp } from '@/lib/security/request-meta';

function rateSubject(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ accepted: false }, { status: 503 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (
    !body || typeof body.trackingToken !== 'string' || body.trackingToken.length > 2048 ||
    !['shown', 'clicked'].includes(String(body.interaction))
  ) return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });

  const rate = await consumeRateLimit({
    key: `recommendation-events:ip:${rateSubject(await getClientIp())}`,
    ...RATE_LIMITS.recommendationEvents
  });
  if (!rate.allowed) {
    return NextResponse.json({ accepted: false }, {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfterSec) }
    });
  }
  const session = await getValidSessionFromCookies();
  const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value || '';
  if (!deviceId) return NextResponse.json({ accepted: false });
  const accepted = await recordRecommendationInteraction({
    trackingToken: body.trackingToken,
    interaction: body.interaction as RecommendationInteraction,
    deviceId,
    authenticatedSessionId: session?.sid,
    userId: session?.sub
  });
  return NextResponse.json({ accepted });
}
