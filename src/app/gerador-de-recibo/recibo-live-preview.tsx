'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import {
  LiveToolPreviewLayout,
  livePreviewFieldClass
} from '@/components/marketing/tool-landing/live-tool-preview-layout';
import { ReciboPreview } from '@/components/recibos/recibo-preview';
import { useToast } from '@/components/ui/toast';
import { useDocumentBranding } from '@/hooks/use-document-branding';
import { performBillableAction } from '@/lib/billing';
import { setLandingAttribution, trackEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/formatters';
import { createEmptyReceipt } from '@/lib/recibos/defaults';
import { RECEIPT_PAYMENT_LABELS, parseReceiptMoney, receiptPaymentBreakdown, type ReceiptPaymentKind } from '@/lib/recibos/payment-breakdown';
import type { ReceiptTemplateId } from '@/lib/recibos/types';

const TEMPLATES: { id: ReceiptTemplateId; name: string }[] = [
  { id: 'profissional', name: 'Profissional' },
  { id: 'moderno', name: 'Moderno' },
  { id: 'compacto', name: 'Compacto' }
];

export function ReciboLivePreview() {
  const [baseReceipt, setBaseReceipt] = useState<ReturnType<typeof createEmptyReceipt> | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [payerName, setPayerName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState('');
  const [kind, setKind] = useState<ReceiptPaymentKind>('integral');
  const [totalInput, setTotalInput] = useState('');
  const [previousInput, setPreviousInput] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [templateId, setTemplateId] = useState<ReceiptTemplateId>('profissional');
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const brandDocuments = useDocumentBranding();
  const { toast } = useToast();

  useEffect(() => {
    const empty = createEmptyReceipt();
    setBaseReceipt(empty);
    const now = new Date();
    setDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setLandingAttribution('/gerador-de-recibo', true);
    const requested = new URLSearchParams(window.location.search).get('tipo');
    if (requested && Object.prototype.hasOwnProperty.call(RECEIPT_PAYMENT_LABELS, requested)) setKind(requested as ReceiptPaymentKind);
  }, []);

  const amount = parseReceiptMoney(amountInput);
  const breakdown = receiptPaymentBreakdown(kind, parseReceiptMoney(totalInput), parseReceiptMoney(previousInput), amount);

  const previewData = useMemo(() => {
    if (!baseReceipt) return null;
    return {
      ...baseReceipt,
      templateId,
      amount: Number.isFinite(amount) ? amount : 0,
      amountInput,
      reference: reference.trim(),
      date,
      notes: breakdown.error ? '' : breakdown.notes,
      receiver: { ...baseReceipt.receiver, name: receiverName.trim() },
      payer: { ...baseReceipt.payer, name: payerName.trim() }
    };
  }, [baseReceipt, receiverName, payerName, amount, amountInput, reference, date, breakdown.error, breakdown.notes, templateId]);

  const checklist = [
    { label: 'Quem recebe', done: receiverName.trim().length > 2 },
    { label: 'Quem paga', done: payerName.trim().length > 2 },
    { label: 'Pagamento', done: !breakdown.error },
    { label: 'Serviço e data', done: Boolean(reference.trim() && date) }
  ];
  const completedCount = checklist.filter((item) => item.done).length;

  async function handleDownloadPdf() {
    if (exporting || !exportRef.current || !previewData) return;
    const validation = !receiverName.trim() || !payerName.trim() || !reference.trim() || !date
      ? 'Preencha quem recebe, quem paga, o serviço e a data do pagamento.'
      : breakdown.error || (!confirmed ? 'Confirme que recebeu este pagamento antes de emitir o recibo.' : '');
    setError(validation);
    if (validation) return;
    setExporting(true);
    try {
      const outcome = await performBillableAction(
        { toolId: 'recibos', artifactId: previewData.id, action: 'download' },
        async () => {
          const { exportElementToPdf } = await import('@/lib/curriculo/pdf');
          await exportElementToPdf(exportRef.current!, 'recibo.pdf', { branded: brandDocuments });
        }
      );
      if (!outcome.allowed) {
        toast(outcome.reason || 'Não foi possível gerar o PDF.');
        return;
      }
      trackEvent('receipt_pdf_download_completed', { tool_path: '/gerador-de-recibo', template_id: templateId, payment_kind: kind });
      trackEvent('document_completed', { tool_name: 'recibos', output: 'pdf', payment_kind: kind });
      toast('PDF baixado. Conta só se quiser histórico ou tirar a marca.');
    } catch {
      toast('Não foi possível gerar o PDF. Tente de novo.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
    <LiveToolPreviewLayout
      form={
        <>
          <div><h3 className="text-xl font-extrabold text-slate-950">Recebeu um Pix? Registre o que foi pago.</h3><p className="mt-2 text-sm text-slate-600">Entrada, parcela ou saldo: o PDF mostra o recebimento e o que ainda falta pagar. Sem cadastro.</p></div>
          <div><label htmlFor="rec-kind" className="mb-1 block text-sm font-semibold">O que você recebeu?</label><select id="rec-kind" className={livePreviewFieldClass} value={kind} onChange={event => { setKind(event.target.value as ReceiptPaymentKind); setConfirmed(false); trackEvent('receipt_payment_kind_selected', { payment_kind: event.target.value }); }}>{Object.entries(RECEIPT_PAYMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div aria-live="polite">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Seu progresso</span>
              <span className="text-xs font-bold text-sky-700">
                {completedCount}/{checklist.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-600 transition-all"
                style={{ width: `${(completedCount / checklist.length) * 100}%` }}
              />
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full ${
                      item.done ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white'
                    }`}
                    aria-hidden
                  >
                    {item.done && <Check className="h-2.5 w-2.5" />}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="rec-receiver">
              Quem recebe
            </label>
            <input
              id="rec-receiver"
              value={receiverName}
              onChange={(event) => setReceiverName(event.target.value)}
              placeholder="Ex: Ana Lima Design"
              className={livePreviewFieldClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="rec-payer">
              Quem paga
            </label>
            <input
              id="rec-payer"
              value={payerName}
              onChange={(event) => setPayerName(event.target.value)}
              placeholder="Ex: Mercado Central Ltda"
              className={livePreviewFieldClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="rec-valor">
              Valor recebido neste Pix
            </label>
            <input
              id="rec-valor"
              value={amountInput}
              onChange={(event) => { setAmountInput(event.target.value); setConfirmed(false); }}
              placeholder="Ex: R$ 1.500,00"
              inputMode="decimal"
              aria-describedby="rec-valor-dica"
              className={livePreviewFieldClass}
            />
            <p id="rec-valor-dica" className="mt-1 text-xs font-medium text-slate-500">
              O valor por extenso é gerado automaticamente.
            </p>
          </div>

          {kind !== 'integral' ? <div className="space-y-4 rounded-xl bg-emerald-50 p-4">
            <div><label htmlFor="rec-total" className="mb-1 block text-sm font-semibold">Total combinado pelo serviço</label><input id="rec-total" inputMode="decimal" className={livePreviewFieldClass} value={totalInput} onChange={event => setTotalInput(event.target.value)} placeholder="Ex.: 490,00" /></div>
            {kind !== 'entrada' ? <div><label htmlFor="rec-previous" className="mb-1 block text-sm font-semibold">Já recebido antes deste Pix</label><input id="rec-previous" inputMode="decimal" className={livePreviewFieldClass} value={previousInput} onChange={event => setPreviousInput(event.target.value)} placeholder="Ex.: 150,00" /><p className="mt-1 text-xs">Some os pagamentos anteriores. Não inclua o Pix deste recibo.</p></div> : null}
            <p role="status" className="text-sm font-bold">{breakdown.error || `Saldo a receber: ${formatCurrency(breakdown.remaining)}`}</p>
          </div> : null}
          <div><label htmlFor="rec-reference" className="mb-1 block text-sm font-semibold">Serviço e referência do orçamento</label><textarea id="rec-reference" maxLength={500} className={livePreviewFieldClass} value={reference} onChange={event => setReference(event.target.value)} placeholder="Ex.: instalação de tomadas, orçamento 018" /></div>
          <div><label htmlFor="rec-date" className="mb-1 block text-sm font-semibold">Data do pagamento</label><input id="rec-date" type="date" className={livePreviewFieldClass} value={date} onChange={event => setDate(event.target.value)} /></div>
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-800">Modelo</span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  aria-pressed={templateId === template.id}
                  className={`rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    templateId === template.id
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />Conferi o recebimento deste Pix na minha conta.</label>
          <p className="text-xs text-slate-600">Você informa os pagamentos. Não consultamos seu banco nem geramos comprovantes bancários.</p>
          {error ? <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p> : null}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={exporting || !previewData}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {exporting ? 'Gerando PDF...' : 'Baixar PDF agora'}
          </button>
          <Link href="/ferramentas/recibos" className="block text-center text-sm font-semibold text-sky-700 hover:underline">
            Abrir gerador completo
          </Link>
          <p className="text-center text-xs font-medium text-slate-500">
            Use grátis no navegador. Conta só se quiser histórico ou tirar a marca.
          </p>
        </>
      }
      preview={previewData ? <ReciboPreview data={previewData} /> : <p className="p-6">Preparando recibo…</p>}
    />
    {previewData ? <div className="pointer-events-none fixed -left-[10000px] top-0 w-[794px]" aria-hidden>
      <div ref={exportRef} className="bg-white p-8">
        <DocumentExportShell branded={brandDocuments}>
          <ReciboPreview data={previewData} />
        </DocumentExportShell>
      </div>
    </div> : null}
    </>
  );
}
