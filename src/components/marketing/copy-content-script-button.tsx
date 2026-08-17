'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';

export function CopyContentScriptButton({ script, campaign }: { script: string; campaign: string }) {
  const { toast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(script);
      trackEvent('content_script_copied', { campaign });
      toast('Roteiro copiado!');
    } catch {
      toast('Não foi possível copiar o roteiro.');
    }
  }

  return <Button type="button" size="sm" variant="outline" icon={Copy} onClick={copy}>Copiar roteiro</Button>;
}
