'use client';

import { useRef, type ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';
import { emitClientProductEvent } from '@/lib/events/client-emitter';

export function ToolStartBoundary({ toolName, children }: { toolName: string; children: ReactNode }) {
  const started = useRef(false);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent('tool_started', { tool_name: toolName });
    emitClientProductEvent({ eventName: 'task.started', toolKey: toolName, properties: { trigger: 'first_interaction' } });

    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
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
