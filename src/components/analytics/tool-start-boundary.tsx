'use client';

import { useRef, type ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

export function ToolStartBoundary({ toolName, children }: { toolName: string; children: ReactNode }) {
  const started = useRef(false);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent('tool_started', { tool_name: toolName });
  }

  return <div onFocusCapture={markStarted} onPointerDownCapture={markStarted}>{children}</div>;
}
