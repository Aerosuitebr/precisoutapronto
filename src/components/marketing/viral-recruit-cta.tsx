'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CopyPlus, Gift, MessageCircle, QrCode, ReceiptText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  buildViralInviteWhatsAppUrl,
  viralOrcamentoPublicPath,
  viralOrcamentoToolPath
} from '@/lib/viral-loop';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { emitClientProductEvent } from '@/lib/events/client-emitter';

type RecruitProps = {
  className?: string;
  sourceDocumentId?: string;
  sourceOccupation?: string;
};

function trackRecruitClick(placement: string, sourceDocumentId?: string, sourceOccupation?: string) {
  trackEvent('quote_recipient_recruit_click', {
    placement,
    source_document: sourceDocumentId,
    source_occupation: sourceOccupation
  });
  if (sourceDocumentId) {
    void fetch(`/api/orcamentos/${encodeURIComponent(sourceDocumentId)}/recruit-click`, {
      method: 'POST',
      keepalive: true
    }).catch(() => undefined);
  }
}

/** CTA para quem recebeu o orçamento: recruta o próximo profissional. */
export function ViralRecruitCard({ className, sourceDocumentId, sourceOccupation }: RecruitProps) {
  const attribution = { sourceDocumentId, sourceOccupation };
  return (
    <section
      className={cn(
        'rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-400 text-slate-950">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-900">Você também é autônomo?</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            Crie orçamentos profissionais como este de graça. Cliente aprova e paga no Pix.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-11 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
              <Link
                href={viralOrcamentoPublicPath(attribution)}
                onClick={() => trackRecruitClick('card', sourceDocumentId, sourceOccupation)}
              >
                Criar meu orçamento grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link
                href={viralOrcamentoToolPath(attribution)}
                onClick={() => trackRecruitClick('card_existing', sourceDocumentId, sourceOccupation)}
              >
                Já tenho conta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ViralRecruitSticky({ sourceDocumentId, sourceOccupation }: RecruitProps = {}) {
  const attribution = { sourceDocumentId, sourceOccupation };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-200 bg-slate-950 p-4 text-white">
      <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
        <p className="flex-1 text-center text-xs leading-5 text-slate-300 sm:text-left">
          Você também é autônomo? Crie orçamentos como este de graça.
        </p>
        <Button asChild className="h-11 shrink-0 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
          <Link
            href={viralOrcamentoPublicPath(attribution)}
            onClick={() => trackRecruitClick('sticky', sourceDocumentId, sourceOccupation)}
          >
            Quero cobrar assim
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function trackApprovedNextAction(action: string, targetTool: string) {
  trackEvent('quote_recipient_next_action', { action, target_tool: targetTool });
  emitClientProductEvent({
    eventName: 'growth.recipient_action',
    toolKey: 'orcamentos',
    properties: { action, target_tool: targetTool, surface: 'approved_quote' }
  });
}

/** Próximos passos contextuais exibidos somente depois da aprovação. */
export function ApprovedQuoteNextActions({ className, sourceDocumentId, sourceOccupation }: RecruitProps) {
  const attribution = { sourceDocumentId, sourceOccupation };
  const receiptHref = '/gerador-de-recibo?utm_source=approved_quote&utm_medium=recipient_cta&utm_campaign=quote_to_receipt';
  const pixHref = '/gerador-de-qr-code-pix?utm_source=approved_quote&utm_medium=recipient_cta&utm_campaign=quote_to_pix';

  return (
    <section className={cn('rounded-[28px] border border-emerald-200 bg-white p-5 shadow-sm', className)}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Orçamento aprovado · próximo passo</p>
      <h2 className="mt-2 text-xl font-extrabold text-slate-950">Use este mesmo fluxo no seu trabalho</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">O modelo é copiado sem nomes, valores ou dados privados. Você recebe uma base segura para editar.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Link
          href={viralOrcamentoPublicPath(attribution)}
          onClick={() => {
            trackRecruitClick('approved_duplicate', sourceDocumentId, sourceOccupation);
            trackApprovedNextAction('duplicate_safe_template', 'orcamentos');
          }}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-400 hover:bg-amber-100"
        >
          <CopyPlus className="h-5 w-5 text-amber-700" />
          <strong className="mt-3 block text-sm text-slate-950">Criar orçamento como este</strong>
          <span className="mt-1 block text-xs leading-5 text-slate-600">Duplique a estrutura segura e troque só o necessário.</span>
        </Link>
        <Link href={pixHref} onClick={() => trackApprovedNextAction('create_pix', 'pix')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50">
          <QrCode className="h-5 w-5 text-emerald-700" />
          <strong className="mt-3 block text-sm text-slate-950">Criar cobrança Pix</strong>
          <span className="mt-1 block text-xs leading-5 text-slate-600">Gere QR Code e Pix Copia e Cola para sua próxima cobrança.</span>
        </Link>
        <Link href={receiptHref} onClick={() => trackApprovedNextAction('create_receipt', 'recibos')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50">
          <ReceiptText className="h-5 w-5 text-sky-700" />
          <strong className="mt-3 block text-sm text-slate-950">Gerar recibo</strong>
          <span className="mt-1 block text-xs leading-5 text-slate-600">Comprove um pagamento com um recibo pronto para PDF.</span>
        </Link>
      </div>
    </section>
  );
}

/** Pack de indicação após gerar link (profissional → colegas). */
const claimedPostValueOffers = new Set<string>();

export function ViralInviteShareRow({ className, toolKey = 'orcamento' }: { className?: string; toolKey?: string }) {
  const [referralWhatsappUrl, setReferralWhatsappUrl] = useState('');
  const [visible] = useState(() => {
    if (claimedPostValueOffers.has(toolKey)) return false;
    claimedPostValueOffers.add(toolKey);
    return true;
  });

  useEffect(() => {
    if (!visible) return;
    trackEvent('post_result_referral_viewed', { result_type: toolKey, moment: 'first_value' });
    void fetch('/api/referral/me', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setReferralWhatsappUrl(data?.whatsappUrl || ''))
      .catch(() => undefined);
  }, [toolKey, visible]);

  if (!visible) return null;

  const whatsappUrl = referralWhatsappUrl || buildViralInviteWhatsAppUrl();

  return (
    <div className={cn('rounded-xl border border-amber-200 bg-amber-50 p-3', className)}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-800"><Gift className="h-3.5 w-3.5" />Indique e ganhe</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">
        Mande para um colega que também resolve isso no WhatsApp.{referralWhatsappUrl ? ' Você ganha 7 dias Premium já no primeiro amigo ativo — e ele também ganha 7 dias.' : ''}
      </p>
      <Button asChild variant="outline" className="mt-3 h-10 w-full border-emerald-200 bg-white">
        <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent('referral_invite_shared', { channel: referralWhatsappUrl ? 'post_value_whatsapp' : 'post_value_generic', tool_name: toolKey })}>
          <MessageCircle className="h-4 w-4 text-emerald-700" />
          Compartilhar no WhatsApp
        </a>
      </Button>
    </div>
  );
}
