'use client';

import { useEffect, useState } from 'react';
import { Gift, MessageCircle, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics';
import { emitClientProductEvent } from '@/lib/events/client-emitter';
import {
  buildViralPdfShareWhatsAppUrl,
  viralHomeUrl
} from '@/lib/viral-loop';

export function ViralPdfShareModal({
  open,
  onClose,
  docLabel,
  showReferral,
  toolKey
}: {
  open: boolean;
  onClose: () => void;
  docLabel: string;
  showReferral?: boolean;
  toolKey: string;
}) {
  const [referral, setReferral] = useState<{ whatsappUrl: string } | null>(null);

  function createAnother() {
    emitClientProductEvent({ eventName: 'continuity.duplicated', toolKey, properties: { mode: 'context_preserved', surface: 'pdf_complete' } });
    trackEvent('document_duplicated', { tool_name: toolKey, mode: 'context_preserved' });
    onClose();
    const form = document.querySelector('main form');
    const target = form || document.querySelector('main input, main textarea, main select');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (target instanceof HTMLElement) window.setTimeout(() => target.focus(), 350);
  }

  useEffect(() => {
    if (!open || !showReferral) return;
    let active = true;
    fetch('/api/referral/me')
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data?.whatsappUrl) {
          setReferral({ whatsappUrl: data.whatsappUrl });
          trackEvent('post_result_referral_viewed', { result_type: 'pdf' });
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [open, showReferral]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="PDF pronto. Espalhe o link"
      description={`Seu ${docLabel} já baixou. Um toque no WhatsApp ajuda o Precisou, Tá Pronto a crescer.`}
      size="md"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="outline" onClick={createAnother}>
            <RotateCcw className="h-4 w-4" />
            Criar outro igual
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
            <a
              href={buildViralPdfShareWhatsAppUrl(docLabel)}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
            >
              <MessageCircle className="h-4 w-4" />
              Mandar no WhatsApp
            </a>
          </Button>
        </div>
      }
    >
      <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
        <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <span>
          O PDF gratuito leva a identificação Precisou, Tá Pronto no rodapé. Quem receber pode criar o
          dele em{' '}
          <a
            className="font-semibold text-sky-700 underline-offset-2 hover:underline"
            href={viralHomeUrl('pdf_modal')}
            target="_blank"
            rel="noreferrer"
          >
            precisoutapronto.com.br
          </a>
          . Remova a marca por R$ 30,00 por 30 dias na sua conta.
        </span>
      </p>
      {showReferral && referral ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <Gift className="h-4 w-4" />
            Você já gerou mais de um documento
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900/80">
            Ganhe 7 dias Premium já no primeiro amigo ativo — e ele também recebe 7 dias.
          </p>
          <Button asChild size="sm" className="mt-3 bg-amber-400 text-slate-950 hover:bg-amber-300">
            <a
              href={referral.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('post_result_referral_clicked', { result_type: 'pdf', channel: 'whatsapp' })}
            >
              <MessageCircle className="h-4 w-4" />
              Convidar um amigo
            </a>
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}

export function useViralPdfShare() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [docLabel, setDocLabel] = useState('documento');
  const [toolKey, setToolKey] = useState('documentos');
  const [showReferral, setShowReferral] = useState(false);

  function afterPdfExport(label = 'documento', sourceToolKey = 'documentos') {
    try {
      const key = 'precisoutapronto_generated_document_count';
      const count = Math.max(0, Number(window.localStorage.getItem(key)) || 0) + 1;
      window.localStorage.setItem(key, String(count));
      setShowReferral(count >= 2);
    } catch {
      setShowReferral(false);
    }
    setDocLabel(label);
    setToolKey(sourceToolKey);
    setOpen(true);
    toast('PDF baixado. Compartilhe e divulgue o Precisou, Tá Pronto!');
  }

  return {
    afterPdfExport,
    viralShareOpen: open,
    viralShareLabel: docLabel,
    viralShareToolKey: toolKey,
    viralShareReferral: showReferral,
    closeViralShare: () => setOpen(false)
  };
}
