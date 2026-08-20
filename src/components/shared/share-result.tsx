'use client';

import { useEffect, useState } from 'react';
import { Copy, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import type { SharedResultLine } from '@/lib/shared-results';

export function ShareResult({ tool, title, subtitle, lines, whatsappText }: { tool: string; title: string; subtitle?: string; lines: SharedResultLine[]; whatsappText?: string }) {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    trackEvent('result_generated', { tool_name: tool, user_type: 'anonymous' });
    trackEvent('share_view', { tool_name: tool, share_surface: 'result' });
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
      toast('Link do resultado copiado!');
    } catch (error) { toast(error instanceof Error ? error.message : 'Falha ao criar o link.'); }
    finally { setCreating(false); }
  }

  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="font-black text-slate-950">✅ Tá pronto!</p><p className="mt-1 text-sm text-slate-600">Conhece alguém que precisa resolver isso também? Envie o resultado.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Button variant="success" className="flex-1" onClick={shareWhatsApp} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}Compartilhar no WhatsApp</Button><Button variant="outline" onClick={copyLink} disabled={creating}><Copy className="h-4 w-4" />Copiar link</Button></div></div>;
}
