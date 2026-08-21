import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { isDatabaseConfigured } from '@/lib/db';
import {
  MAX_EVENT_BATCH_SIZE,
  persistProductEvents,
  validateProductEvent
} from '@/lib/events/product-events';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request-meta';

const MAX_BODY_BYTES = 64 * 1024;

function hashedRateLimitSubject(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Event ingestion unavailable.' }, { status: 503 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Batch too large.' }, { status: 413 });
  }

  const body = (await request.json().catch(() => null)) as { events?: unknown[] } | null;
  if (!body || !Array.isArray(body.events) || body.events.length < 1 || body.events.length > MAX_EVENT_BATCH_SIZE) {
    return NextResponse.json({ error: 'Invalid event batch.' }, { status: 400 });
  }

  const firstAnonymousId = typeof body.events[0] === 'object' && body.events[0]
    ? String((body.events[0] as Record<string, unknown>).anonymousId || '')
    : '';
  const session = await getValidSessionFromCookies();
  const subjectKey = session?.sub || firstAnonymousId;
  if (!subjectKey) return NextResponse.json({ error: 'Missing subject.' }, { status: 400 });

  const flag = await getFeatureFlagDecision('event_platform_v1', subjectKey);
  if (!flag.enabled) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const rate = await consumeRateLimit({
    key: `events:ip:${hashedRateLimitSubject(await getClientIp())}`,
    ...RATE_LIMITS.productEventBatch
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.', retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  const validated = body.events.map((event) => validateProductEvent(event));
  const invalidIndex = validated.findIndex((result) => !result.ok);
  if (invalidIndex >= 0) {
    const result = validated[invalidIndex];
    return NextResponse.json(
      { error: result.ok ? 'Invalid event.' : result.error, eventIndex: invalidIndex },
      { status: 400 }
    );
  }

  const events = validated.flatMap((result) => result.ok ? [result.event] : []);
  try {
    const persisted = await persistProductEvents(events, session?.sub);
    return NextResponse.json({ accepted: persisted.count, received: events.length });
  } catch (error) {
    console.error('[product-events] ingestion failed', { count: events.length, error });
    return NextResponse.json({ error: 'Event ingestion unavailable.' }, { status: 503 });
  }
}
