'use client';

import { useEffect, useState } from 'react';
import { PostResultActionBar } from '@/components/shared/post-result-action-bar';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import { emitClientProductEvent } from '@/lib/events/client-emitter';
import type { SharedResultLine } from '@/lib/shared-results';

export function ShareResult({ tool, title, subtitle, lines, whatsappText }: { tool: string; title: string; subtitle?: string; lines: SharedResultLine[]; whatsappText?: string }) {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    trackEvent('result_generated', { tool_name: tool, user_type: 'anonymous' });
    trackEvent('share_view', { tool_name: tool, share_surface: 'result' });
    emitClientProductEvent({ eventName: 'task.first_value', toolKey: tool, properties: { surface: 'result' } });
    emitClientProductEvent({ eventName: 'task.completed', toolKey: tool, properties: { output: 'result' } });
  }, [tool]);

  async function createLink() {
    const response = await fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool, title, subtitle, lines, source: 'result' }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível criar o link.');
    return `${window.location.origin}${data.url}` as string;
  }

  async function shareWhatsApp() {
    setCreating(true);
    try {
      const url = await createLink();
      trackEvent('share_whatsapp', { tool_name: tool, result_id: url.split('/').pop(), share_surface: 'result', user_type: 'anonymous' });
      emitClientProductEvent({ eventName: 'outcome.shared', toolKey: tool, properties: { channel: 'whatsapp', surface: 'result' } });
      window.location.href = `https://wa.me/?text=${encodeURIComponent(`${whatsappText || title}\n\nVeja o resultado completo:\n${url}\n\nCriado grátis no Precisou? Tá Pronto.`)}`;
    } catch (error) { toast(error instanceof Error ? error.message : 'Falha ao compartilhar.'); }
    finally { setCreating(false); }
  }

  async function copyLink() {
    setCreating(true);
    try {
      const url = await createLink();
      await navigator.clipboard.writeText(url);
      trackEvent('share_copy_link', { tool_name: tool, result_id: url.split('/').pop(), share_surface: 'result' });
      emitClientProductEvent({ eventName: 'outcome.shared', toolKey: tool, properties: { channel: 'copy_link', surface: 'result' } });
      toast('Link do resultado copiado!');
    } catch (error) { toast(error instanceof Error ? error.message : 'Falha ao criar o link.'); }
    finally { setCreating(false); }
  }

  function createAnother() {
    emitClientProductEvent({ eventName: 'continuity.duplicated', toolKey: tool, properties: { mode: 'context_preserved', surface: 'result' } });
    trackEvent('result_duplicated', { tool_name: tool, mode: 'context_preserved' });
    const form = document.querySelector('form');
    const target = form || document.querySelector('input, textarea, select');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (target instanceof HTMLElement) window.setTimeout(() => target.focus(), 350);
    toast('Contexto mantido. Ajuste apenas o que mudou.');
  }

  return <PostResultActionBar onWhatsApp={() => void shareWhatsApp()} onCopyLink={() => void copyLink()} onCreateAnother={createAnother} busy={creating} />;
}
