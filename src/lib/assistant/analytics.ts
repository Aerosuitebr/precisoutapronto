'use client';

import type { AssistantDocumentType } from '@/lib/assistant-briefing';
import { trackEvent } from '@/lib/analytics';

export type AssistantFunnelEvent =
  | 'assistant_started'
  | 'assistant_type_selected'
  | 'assistant_step_completed'
  | 'assistant_briefing_completed'
  | 'assistant_review_started'
  | 'assistant_review_completed'
  | 'assistant_review_failed'
  | 'assistant_editor_opened'
  | 'assistant_abandoned';

interface AssistantFunnelInput {
  type: AssistantDocumentType;
  step?: number;
  totalSteps?: number;
  provider?: 'local' | 'remote';
}

export function assistantFunnelParams(input: AssistantFunnelInput) {
  return {
    document_type: input.type,
    ...(typeof input.step === 'number' ? { step: Math.max(0, Math.trunc(input.step)) } : {}),
    ...(typeof input.totalSteps === 'number'
      ? { total_steps: Math.max(1, Math.trunc(input.totalSteps)) }
      : {}),
    ...(input.provider ? { provider: input.provider } : {})
  };
}

export function trackAssistantFunnel(event: AssistantFunnelEvent, input: AssistantFunnelInput) {
  trackEvent(event, assistantFunnelParams(input));
}
