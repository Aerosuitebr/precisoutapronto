import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isDatabaseConfigured } from '@/lib/db';
import { isSafeIntentKey } from '@/lib/intent-graph/contracts';
import { getGatedRankedNextActions } from '@/lib/recommendation/ranker';
import { createNextActionTrackingToken } from '@/lib/recommendation/tracking-token';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { DEVICE_COOKIE } from '@/lib/security/device-cookie';
import { getClientIp } from '@/lib/security/request-meta';

export const dynamic = 'force-dynamic';

function rateSubject(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ actions: [], reason: 'unavailable' }, { status: 503 });
  }
  const url = new URL(request.url);
  const toolKey = url.searchParams.get('toolKey') || '';
  const outcomeStatus = url.searchParams.get('outcomeStatus') || 'completed';
  if (!isSafeIntentKey(toolKey) || outcomeStatus !== 'completed') {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  }

  const rate = await consumeRateLimit({
    key: `next-actions:ip:${rateSubject(await getClientIp())}`,
    ...RATE_LIMITS.nextActions
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.', retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  const session = await getValidSessionFromCookies();
  const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value || '';
  const subjectKey = session?.sub || deviceId;
  if (!subjectKey) return NextResponse.json({ actions: [], reason: 'missing-subject' });

  const ranked = await getGatedRankedNextActions({
    sourceToolKey: toolKey,
    subjectKey,
    outcomeStatus
  });
  const issuedAt = Date.now();
  const actions = ranked.flatMap((action) => {
    const trackingToken = createNextActionTrackingToken({
      sourceToolKey: toolKey,
      targetToolKey: action.targetToolKey,
      variant: action.variant,
      rank: action.rank,
      issuedAt
    });
    return trackingToken ? [{ ...action, trackingToken }] : [];
  });
  return NextResponse.json({
    actions,
    exposureRecorded: false,
    reason: actions.length ? 'ranked' : 'disabled-or-unavailable'
  });
}
