'use client';

import { useEffect } from 'react';
import { PostResultActionBar } from '@/components/shared/post-result-action-bar';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import { emitClientProductEvent } from '@/lib/events/client-emitter';

export function PublicResultActions({ title, value, toolPath, campaign }: { title: string; value: string; toolPath: string; campaign: string }) {
  const { toast } = useToast();
  const creatorTarget = `${toolPath}${toolPath.includes('?') ? '&' : '?'}utm_source=public_result&utm_medium=viral_loop&utm_campaign=${encodeURIComponent(campaign)}`;

  useEffect(() => {
    trackEvent('public_result_viewed', { tool_path: toolPath, campaign });
    emitClientProductEvent({ eventName: 'growth.share_opened', toolKey: toolPath.replace(/^\//, ''), properties: { surface: 'public_result', campaign } });
  }, [campaign, toolPath]);

  function whatsapp() {
    const text = `${title}: ${value}\n\nVeja este Resultado Jato e crie o seu:\n${window.location.href}`;
    trackEvent('public_result_reshared', { method: 'whatsapp', tool_path: toolPath, campaign });
    emitClientProductEvent({ eventName: 'outcome.shared', toolKey: toolPath.replace(/^\//, ''), properties: { channel: 'whatsapp', surface: 'public_result' } });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function share() {
    const data = { title: `${title} · Precisou, Tá Pronto`, text: `${title}: ${value}`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        trackEvent('public_result_reshared', { method: 'native', tool_path: toolPath, campaign });
        emitClientProductEvent({ eventName: 'outcome.shared', toolKey: toolPath.replace(/^\//, ''), properties: { channel: 'native', surface: 'public_result' } });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        trackEvent('public_result_reshared', { method: 'copy_link', tool_path: toolPath, campaign });
        emitClientProductEvent({ eventName: 'outcome.shared', toolKey: toolPath.replace(/^\//, ''), properties: { channel: 'copy_link', surface: 'public_result' } });
        toast('Link copiado!');
      }
    } catch {
      // Cancelar a folha de compartilhamento não é erro.
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      trackEvent('public_result_reshared', { method: 'copy_link', tool_path: toolPath, campaign });
      emitClientProductEvent({ eventName: 'outcome.shared', toolKey: toolPath.replace(/^\//, ''), properties: { channel: 'copy_link', surface: 'public_result' } });
      toast('Link copiado!');
    } catch {
      toast('Não foi possível copiar o link agora.');
    }
  }

  function createMine() {
    trackEvent('public_result_cta_clicked', { tool_path: toolPath, campaign });
    emitClientProductEvent({ eventName: 'growth.recipient_action', toolKey: toolPath.replace(/^\//, ''), properties: { action: 'create_my_own', surface: 'public_result' } });
    window.location.href = creatorTarget;
  }

  return (
    <div className="mt-6"><PostResultActionBar onWhatsApp={whatsapp} onCopyLink={() => void copyLink()} onShare={() => void share()} onCreateAnother={createMine} createAnotherLabel="Criar o meu grátis" /></div>
  );
}
