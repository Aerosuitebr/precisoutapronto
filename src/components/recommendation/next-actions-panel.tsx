'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NextActionDTO {
  key: string;
  label: string;
  targetUrl: string;
  trackingToken: string;
}

function recordInteraction(trackingToken: string, interaction: 'shown' | 'clicked') {
  return fetch('/api/v1/recommendations/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackingToken, interaction }),
    keepalive: true
  }).catch(() => undefined);
}

export function NextActionsPanel({ sourceToolKey, active }: { sourceToolKey: string; active: boolean }) {
  const [actions, setActions] = useState<NextActionDTO[]>([]);
  const shownTokens = useRef(new Set<string>());

  useEffect(() => {
    if (!active) {
      setActions([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/v1/intent/next-actions?toolKey=${encodeURIComponent(sourceToolKey)}&outcomeStatus=completed`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setActions(Array.isArray(payload?.actions) ? payload.actions.slice(0, 3) : []))
      .catch(() => setActions([]));
    return () => controller.abort();
  }, [active, sourceToolKey]);

  useEffect(() => {
    for (const action of actions) {
      if (shownTokens.current.has(action.trackingToken)) continue;
      shownTokens.current.add(action.trackingToken);
      void recordInteraction(action.trackingToken, 'shown');
    }
  }, [actions]);

  if (!actions.length) return null;
  return (
    <section className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-4" aria-labelledby="next-actions-title">
      <div className="flex items-center gap-2 text-sky-950">
        <Sparkles className="h-4 w-4" aria-hidden />
        <h3 id="next-actions-title" className="text-sm font-extrabold">Você também pode precisar</h3>
      </div>
      <p className="mt-1 text-xs leading-5 text-sky-900">Próximos passos opcionais. Seu orçamento continuará salvo.</p>
      <ul className="mt-3 space-y-2">
        {actions.map((action) => (
          <li key={action.key}>
            <a
              href={action.targetUrl}
              onClick={() => { void recordInteraction(action.trackingToken, 'clicked'); }}
              className="flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 transition hover:border-sky-400 hover:bg-sky-50"
            >
              <span>{action.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-sky-700" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
