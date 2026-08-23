'use client';

import { useRef, type ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';
import { emitClientProductEvent } from '@/lib/events/client-emitter';

export function ToolStartBoundary({ toolName, children }: { toolName: string; children: ReactNode }) {
  const started = useRef(false);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const safeUtm = (key: string) => (params.get(key) || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    const utmSource = safeUtm('utm_source');
    const utmMedium = safeUtm('utm_medium');
    const utmCampaign = safeUtm('utm_campaign');
    trackEvent('tool_started', { tool_name: toolName, utm_source: utmSource || undefined, utm_medium: utmMedium || undefined, utm_campaign: utmCampaign || undefined });
    emitClientProductEvent({
      eventName: 'task.started',
      toolKey: toolName,
      properties: {
        trigger: 'first_interaction',
        ...(utmSource ? { utm_source: utmSource } : {}),
        ...(utmMedium ? { utm_medium: utmMedium } : {}),
        ...(utmCampaign ? { utm_campaign: utmCampaign } : {})
      }
    });

    const source = utmSource;
    const recipientSource = source === 'shared_result' || source === 'shared_document' || source === 'public_result' || source === 'approved_quote'
      ? source
      : params.has('source_document')
        ? 'shared_quote'
        : null;
    if (recipientSource) {
      emitClientProductEvent({
        eventName: 'growth.recipient_activated',
        toolKey: toolName,
        properties: { source: recipientSource, activation: 'first_interaction' }
      });
    }
  }

  return <div onFocusCapture={markStarted} onPointerDownCapture={markStarted}>{children}</div>;
}
