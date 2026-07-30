'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import { buildDocumentSharePayload, isShareCancellation } from '@/lib/document-sharing';

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
    let linkCreated = false;
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
      linkCreated = true;
      const payload = buildDocumentSharePayload(input.title, url);
      if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(payload))) {
        try {
          await navigator.share(payload);
          trackEvent('document_share_native_completed', {
            tool_id: input.toolId,
            reused: Boolean(data.reused)
          });
          return;
        } catch (error) {
          if (isShareCancellation(error)) {
            trackEvent('document_share_native_cancelled', { tool_id: input.toolId });
            return;
          }
        }
      }

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
        reason: notSaved ? 'not_saved' : linkCreated ? 'delivery_failed' : 'request_failed'
      });
      toast(notSaved
        ? 'Aguarde o salvamento automático ou clique em Salvar antes de compartilhar.'
        : linkCreated
          ? 'O link foi criado, mas não foi possível compartilhá-lo neste navegador.'
          : 'Não foi possível criar o link. Tente novamente.');
    } finally {
      setSharing(false);
    }
  }

  return { shareDocument, sharing };
}
