'use client';

import { useState } from 'react';
import { CheckCircle2, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OrcamentoPublicPixPay } from '@/components/orcamentos/orcamento-public-pix-pay';
import type { InternationalLocale } from '@/lib/i18n';
import type { OrcamentoPublic } from '@/lib/orcamentos/types';

const copy = {
  en: {
    digital: 'Digital quote',
    prepared: 'Prepared for',
    total: 'Total',
    validity: 'Valid for',
    items: 'Items',
    notes: 'Notes',
    pending: 'Waiting for your response',
    approved: 'Quote approved',
    changes: 'Changes requested',
    approve: 'Approve quote',
    request: 'Request changes',
    feedback: 'Describe what you would like to change',
    sendRequest: 'Send change request',
    cancel: 'Cancel',
    successApprove: 'Approval registered. Let the professional know on WhatsApp.',
    successChange: 'Your change request was registered. Let the professional know on WhatsApp.',
    whatsapp: 'Open WhatsApp',
    error: 'We couldn’t register your response. Please try again.'
  },
  es: {
    digital: 'Presupuesto digital',
    prepared: 'Preparado para',
    total: 'Total',
    validity: 'Válido por',
    items: 'Ítems',
    notes: 'Observaciones',
    pending: 'Esperando tu respuesta',
    approved: 'Presupuesto aprobado',
    changes: 'Cambios solicitados',
    approve: 'Aprobar presupuesto',
    request: 'Solicitar cambios',
    feedback: 'Describe qué te gustaría cambiar',
    sendRequest: 'Enviar solicitud de cambio',
    cancel: 'Cancelar',
    successApprove: 'Aprobación registrada. Avisa al profesional por WhatsApp.',
    successChange: 'Tu solicitud fue registrada. Avisa al profesional por WhatsApp.',
    whatsapp: 'Abrir WhatsApp',
    error: 'No pudimos registrar tu respuesta. Inténtalo de nuevo.'
  }
} as const;

function formatBRL(value: number, locale: InternationalLocale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function InternationalQuotePublicView({
  locale,
  initial
}: {
  locale: InternationalLocale;
  initial: OrcamentoPublic;
}) {
  const t = copy[locale];
  const [quote, setQuote] = useState(initial);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function respond(status: 'approved' | 'declined') {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/orcamentos/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          feedbackCliente: status === 'declined' ? feedback : null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error();
      const { notifications: _notifications, ...updated } = data;
      setQuote(updated as OrcamentoPublic);
      setShowFeedback(false);
      setSuccess(status === 'approved' ? t.successApprove : t.successChange);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  const phone = quote.profissionalWhatsapp.replace(/\D+/g, '');
  const phoneWithCountry = phone.length >= 10 && !phone.startsWith('55') ? `55${phone}` : phone;
  const whatsappText =
    quote.status === 'approved'
      ? locale === 'en'
        ? `Hello ${quote.profissionalNome}, this is ${quote.clienteNome}. I approved the quote for ${formatBRL(quote.total, locale)}.`
        : `Hola ${quote.profissionalNome}, soy ${quote.clienteNome}. Aprobé el presupuesto de ${formatBRL(quote.total, locale)}.`
      : locale === 'en'
        ? `Hello ${quote.profissionalNome}, this is ${quote.clienteNome}. I requested changes to the quote: ${quote.feedbackCliente || feedback}.`
        : `Hola ${quote.profissionalNome}, soy ${quote.clienteNome}. Solicité cambios en el presupuesto: ${quote.feedbackCliente || feedback}.`;
  const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(whatsappText)}`;

  const statusLabel =
    quote.status === 'approved' ? t.approved : quote.status === 'declined' ? t.changes : t.pending;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_55%,#f8fafc_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-lg space-y-4">
        <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{t.digital}</p>
          <h1 className="rj-display mt-2 text-2xl font-extrabold">{quote.profissionalNome}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t.prepared} <strong>{quote.clienteNome}</strong>
          </p>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.total}</p>
            <p className="mt-1 text-3xl font-black text-emerald-700">{formatBRL(quote.total, locale)}</p>
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {statusLabel}
            </span>
          </div>
          {quote.validade ? <p className="mt-3 text-xs text-slate-500">{t.validity}: {quote.validade}</p> : null}
        </header>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-bold">{t.items}</h2>
          <ul className="divide-y divide-slate-100">
            {quote.itens.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold">{item.nome}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.quantidade} × {formatBRL(item.valorUnitario, locale)}
                  </p>
                </div>
                <p className="font-bold">{formatBRL(item.quantidade * item.valorUnitario, locale)}</p>
              </li>
            ))}
          </ul>
          {quote.observacoes ? (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.notes}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{quote.observacoes}</p>
            </div>
          ) : null}
        </section>

        {quote.status === 'pending' ? (
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            {showFeedback ? (
              <div className="space-y-3">
                <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t.feedback} rows={4} />
                <Button className="w-full" variant="outline" disabled={!feedback.trim() || busy} onClick={() => void respond('declined')}>
                  {t.sendRequest}
                </Button>
                <Button className="w-full" variant="ghost" onClick={() => setShowFeedback(false)}>{t.cancel}</Button>
              </div>
            ) : (
              <div className="grid gap-3">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500" loading={busy} onClick={() => void respond('approved')}>
                  <ThumbsUp className="h-4 w-4" />
                  {t.approve}
                </Button>
                <Button size="lg" variant="outline" onClick={() => setShowFeedback(true)}>
                  <ThumbsDown className="h-4 w-4" />
                  {t.request}
                </Button>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold leading-6 text-emerald-950">{success || statusLabel}</p>
            <Button asChild className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500">
              <a href={whatsappUrl}>
                <MessageCircle className="h-4 w-4" />
                {t.whatsapp}
              </a>
            </Button>
          </section>
        )}
        <OrcamentoPublicPixPay orcamento={quote} />
        {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      </div>
    </main>
  );
}
