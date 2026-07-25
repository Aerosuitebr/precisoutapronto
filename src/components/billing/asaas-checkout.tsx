'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, CreditCard, Loader2, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatCpf, isValidCpf, onlyDigits } from '@/lib/cpf';
import { cn } from '@/lib/utils';

const PENDING_ASAAS_KEY = 'rj_pending_asaas';
const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 12 * 60 * 1000;

type Mode = 'choose' | 'pix' | 'card';

interface AsaasCheckoutProps {
  onApproved: (expiresAt?: string) => void;
}

export function AsaasCheckout({ onApproved }: AsaasCheckoutProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('choose');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cpf, setCpf] = useState('');
  const [qrPayload, setQrPayload] = useState('');
  const [awaiting, setAwaiting] = useState(false);

  const pollRef = useRef<{ cancelled: boolean; timer?: number }>({ cancelled: false });

  useEffect(() => {
    const poll = pollRef.current;
    return () => {
      poll.cancelled = true;
      if (poll.timer) window.clearTimeout(poll.timer);
    };
  }, []);

  const startPolling = useCallback(
    (paymentId: string) => {
      const poll = pollRef.current;
      poll.cancelled = false;
      setAwaiting(true);
      sessionStorage.setItem(
        PENDING_ASAAS_KEY,
        JSON.stringify({ paymentId, savedAt: Date.now() })
      );
      const startedAt = Date.now();

      const tick = async () => {
        if (poll.cancelled) return;
        try {
          const res = await fetch(
            `/api/billing/confirm-asaas?paymentId=${encodeURIComponent(paymentId)}`,
            { credentials: 'include' }
          );
          const data = (await res.json().catch(() => ({}))) as {
            approved?: boolean;
            failed?: boolean;
            expiresAt?: string;
            error?: string;
          };
          if (!res.ok) throw new Error(data.error || 'Falha ao confirmar pagamento.');

          if (data.approved) {
            poll.cancelled = true;
            setAwaiting(false);
            sessionStorage.removeItem(PENDING_ASAAS_KEY);
            onApproved(data.expiresAt);
            return;
          }
          if (data.failed) {
            poll.cancelled = true;
            setAwaiting(false);
            setError('Pagamento recusado ou estornado. Tente novamente.');
            toast('Pagamento não concluído.', { variant: 'error' });
            return;
          }
        } catch (err) {
          poll.cancelled = true;
          setAwaiting(false);
          const text = err instanceof Error ? err.message : 'Falha na confirmação.';
          setError(text);
          toast(text, { variant: 'error' });
          return;
        }

        if (Date.now() - startedAt >= POLL_MAX_MS) {
          setAwaiting(false);
          setError(
            'Ainda não recebemos a confirmação. O Premium libera automaticamente quando o pagamento cair.'
          );
          return;
        }
        poll.timer = window.setTimeout(() => void tick(), POLL_INTERVAL_MS);
      };

      void tick();
    },
    [onApproved, toast]
  );

  function requireCpf() {
    if (!cpf.trim()) {
      setError('Informe o CPF para continuar com a Asaas.');
      return false;
    }
    if (!isValidCpf(cpf)) {
      setError('CPF inválido.');
      return false;
    }
    return true;
  }

  async function startPix() {
    setBusy(true);
    setError(null);
    try {
      if (!requireCpf()) return;
      const res = await fetch('/api/billing/checkout-asaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method: 'pix', cpf: onlyDigits(cpf) })
      });
      const data = (await res.json().catch(() => ({}))) as {
        paymentId?: string;
        qrCodePayload?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Não foi possível gerar o Pix.');
      if (!data.qrCodePayload || !data.paymentId) throw new Error('Pix sem código de pagamento.');
      setMode('pix');
      setQrPayload(data.qrCodePayload);
      startPolling(data.paymentId);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Falha ao gerar o Pix.';
      setError(text);
      toast(text, { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function startCard() {
    setBusy(true);
    setError(null);
    try {
      if (!requireCpf()) return;
      const res = await fetch('/api/billing/checkout-asaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method: 'card', cpf: onlyDigits(cpf) })
      });
      const data = (await res.json().catch(() => ({}))) as {
        paymentId?: string;
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Não foi possível abrir o pagamento.');
      if (!data.checkoutUrl || !data.paymentId) throw new Error('Checkout Asaas sem URL.');
      sessionStorage.setItem(
        PENDING_ASAAS_KEY,
        JSON.stringify({ paymentId: data.paymentId, savedAt: Date.now() })
      );
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Falha ao abrir o cartão.';
      setError(text);
      toast(text, { variant: 'error' });
      setBusy(false);
    }
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar. Selecione o código manualmente.');
    }
  }

  const inputDark = 'border-white/20 bg-slate-950/50 text-white placeholder:text-slate-500';

  return (
    <div className="mt-6 space-y-4">
      {mode === 'choose' ? (
        <div className="space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            CPF
          </label>
          <Input
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoComplete="off"
            required
            className={inputDark}
            disabled={busy}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => void startPix()}
              disabled={busy}
              className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] text-white transition hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <QrCode className="h-6 w-6 text-sky-300" />
              )}
              <span className="text-sm font-semibold">Pagar com Pix</span>
            </button>
            <button
              type="button"
              onClick={() => void startCard()}
              disabled={busy}
              className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] text-white transition hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <CreditCard className="h-6 w-6 text-sky-300" />
              )}
              <span className="text-sm font-semibold">Cartão</span>
              <span className="text-[11px] font-medium text-slate-400">Crédito ou débito</span>
            </button>
          </div>
          <p className="text-[11px] leading-4 text-slate-500">
            CPF obrigatório para a cobrança. No Pix, o QR aparece aqui. No cartão, o pagamento abre
            na página segura da Asaas (crédito ou débito).
          </p>
        </div>
      ) : null}

      {mode === 'pix' ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-center">
          <div className="mx-auto w-fit rounded-2xl bg-white p-3">
            <QRCodeSVG value={qrPayload} size={200} level="M" includeMargin />
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Abra o app do seu banco, escolha Pix e escaneie o QR Code, ou use o copia e cola.
          </p>
          <button
            type="button"
            onClick={() => void copyPix()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Código copiado' : 'Copiar código Pix'}
          </button>
          {awaiting ? (
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-sky-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Aguardando a confirmação do pagamento…
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          className={cn(
            'rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100'
          )}
        >
          {error}
        </p>
      ) : null}

      {mode !== 'choose' && !awaiting ? (
        <button
          type="button"
          onClick={() => {
            setMode('choose');
            setError(null);
            setQrPayload('');
          }}
          className="text-xs font-medium text-slate-400 underline-offset-4 hover:text-white hover:underline"
        >
          Escolher outra forma de pagamento
        </button>
      ) : null}
    </div>
  );
}

export { PENDING_ASAAS_KEY };
