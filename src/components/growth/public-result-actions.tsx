'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="mt-6 space-y-3 text-center">
      <Link
        href={creatorTarget}
        onClick={() => {
          trackEvent('public_result_cta_clicked', { tool_path: toolPath, campaign });
          emitClientProductEvent({ eventName: 'growth.recipient_action', toolKey: toolPath.replace(/^\//, ''), properties: { action: 'create_my_own', surface: 'public_result' } });
        }}
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300"
      >
        Criar o meu grátis <ArrowRight className="h-4 w-4" />
      </Link>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" variant="success" icon={MessageCircle} onClick={whatsapp}>WhatsApp</Button>
        <Button type="button" size="sm" variant="outline" icon={Share2} onClick={share}>Compartilhar novamente</Button>
      </div>
    </div>
  );
}
