'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';

interface ShareDocumentInput {
  toolId: string;
  artifactId: string;
  title: string;
}

interface ShareResponse {
  url?: string;
  reused?: boolean;
  error?: string;
}

export function useDocumentShare() {
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);

  async function shareDocument(input: ShareDocumentInput) {
    if (sharing) return;
    setSharing(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, expiresInDays: 30 })
      });
      const data = await response.json() as ShareResponse;
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Não foi possível criar o link.');
      }

      const url = new URL(data.url, window.location.origin).toString();
      await navigator.clipboard.writeText(url);
      trackEvent('document_share_link_copied', {
        tool_id: input.toolId,
        reused: Boolean(data.reused)
      });
      toast('Link público copiado. Ele ficará ativo por 30 dias.');
    } catch (error) {
      const notSaved = error instanceof Error && error.message === 'Document not found.';
      trackEvent('document_share_link_failed', {
        tool_id: input.toolId,
        reason: notSaved ? 'not_saved' : 'request_failed'
      });
      toast(notSaved
        ? 'Aguarde o salvamento automático ou clique em Salvar antes de compartilhar.'
        : 'Não foi possível criar o link. Tente novamente.');
    } finally {
      setSharing(false);
    }
  }

  return { shareDocument, sharing };
}
