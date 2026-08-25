'use client';

import { trackEvent } from '@/lib/analytics';
import { hasAnalyticsConsent } from '@/lib/analytics-consent';

export type ClientProductEventName =
  | 'task.started'
  | 'task.first_value'
  | 'task.completed'
  | 'outcome.shared'
  | 'outcome.approved'
  | 'continuity.duplicated'
  | 'growth.share_opened'
  | 'growth.recipient_action'
  | 'growth.recipient_activated';

type EventProperty = string | number | boolean | null;

interface ClientProductEventInput {
  eventName: ClientProductEventName;
  toolKey?: string;
  properties?: Record<string, EventProperty>;
}

const ANONYMOUS_ID_KEY = 'precisoutapronto_product_anonymous_id';
const SESSION_ID_KEY = 'precisoutapronto_product_session_id';
const INGESTION_DISABLED_KEY = 'precisoutapronto_product_ingestion_disabled';

function uuid() {
  return crypto.randomUUID();
}

function browserId(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const created = uuid();
  storage.setItem(key, created);
  return created;
}

/**
 * Dual-write incremental: mantém GA4/Clarity e envia o envelope canônico.
 * A telemetria é best-effort e nunca interfere na tarefa do usuário.
 */
export function emitClientProductEvent(input: ClientProductEventInput) {
  if (typeof window === 'undefined') return;

  trackEvent(input.eventName.replaceAll('.', '_'), {
    ...(input.toolKey ? { tool_name: input.toolKey } : {}),
    ...(input.properties || {})
  });

  try {
    if (!hasAnalyticsConsent(window.localStorage)) return;
    if (window.sessionStorage.getItem(INGESTION_DISABLED_KEY) === 'true') return;

    const event = {
      eventId: uuid(),
      eventName: input.eventName,
      occurredAt: new Date().toISOString(),
      schemaVersion: 1,
      anonymousId: browserId(window.localStorage, ANONYMOUS_ID_KEY),
      sessionId: browserId(window.sessionStorage, SESSION_ID_KEY),
      ...(input.toolKey ? { toolKey: input.toolKey } : {}),
      properties: input.properties || {}
    };

    void fetch('/api/v1/events/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [event] }),
      keepalive: true
    }).then((response) => {
      if (response.status === 404) window.sessionStorage.setItem(INGESTION_DISABLED_KEY, 'true');
    }).catch(() => undefined);
  } catch {
    // Storage, crypto ou rede podem estar indisponíveis; o produto continua.
  }
}
