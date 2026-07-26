'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import saasPaymentsArt from '@/assets/saas_payments.png';
import { formatCpf, isValidCpf, onlyDigits } from '@/lib/cpf';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const PENDING_ASAAS_KEY = 'rj_pending_asaas';
const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 12 * 60 * 1000;

export type AsaasCheckoutStage = 'choose' | 'pix' | 'card';

type PayMethod = 'pix' | 'card';

interface AsaasCheckoutProps {
  onApproved: (expiresAt?: string) => void;
  onStageChange?: (stage: AsaasCheckoutStage) => void;
}

function CardBrandMarks({ className }: { className?: string }) {
  return (
    <ul
      className={cn('flex flex-wrap items-center justify-center gap-2', className)}
      aria-label="Bandeiras aceitas no cartão"
    >
      {['Visa', 'Mastercard', 'Elo'].map((brand) => (
        <li
          key={brand}
          className="rounded-md border border-white/20 bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-800"
        >
          {brand}
        </li>
      ))}
    </ul>
  );
}

export function AsaasCheckout({ onApproved, onStageChange }: AsaasCheckoutProps) {
  const { toast } = useToast();
  const cpfFieldId = useId();
  const cpfHintId = useId();
  const methodsLegendId = useId();

  const [mode, setMode] = useState<AsaasCheckoutStage>('choose');
  const [busy, setBusy] = useState(false);
  const [busyMethod, setBusyMethod] = useState<PayMethod | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PayMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cpf, setCpf] = useState('');
  const [cpfTouched, setCpfTouched] = useState(false);
  const [qrPayload, setQrPayload] = useState('');
  const [awaiting, setAwaiting] = useState(false);

  const pollRef = useRef<{ cancelled: boolean; timer?: number }>({ cancelled: false });

  const cpfDigits = onlyDigits(cpf);
  const cpfComplete = cpfDigits.length === 11;
  const cpfValid = useMemo(() => isValidCpf(cpf), [cpf]);

  useEffect(() => {
    onStageChange?.(mode);
  }, [mode, onStageChange]);

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
    setCpfTouched(true);
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
    setSelectedMethod('pix');
    setBusy(true);
    setBusyMethod('pix');
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
      setBusyMethod(null);
    }
  }

  async function startCard() {
    setSelectedMethod('card');
    setBusy(true);
    setBusyMethod('card');
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
      setMode('card');
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
      setBusyMethod(null);
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

  const cpfStatus =
    !cpfTouched && !cpfComplete
      ? null
      : cpfValid
        ? 'valid'
        : cpfComplete
          ? 'invalid'
          : cpfTouched
            ? 'incomplete'
            : null;

  const inputDark = cn(
    'border-white/25 bg-slate-950/60 text-white placeholder:text-slate-400',
    'focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    cpfStatus === 'valid' && 'border-emerald-400/70 pr-11',
    cpfStatus === 'invalid' && 'border-rose-400/70 pr-11',
    cpfStatus === 'incomplete' && 'border-amber-400/60'
  );

  return (
    <div className="mt-6 space-y-4">
      {mode === 'choose' ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={cpfFieldId}
              className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300"
            >
              CPF
            </label>
            <div className="relative mt-2">
              <Input
                id={cpfFieldId}
                value={cpf}
                onChange={(e) => {
                  setCpf(formatCpf(e.target.value));
                  if (error) setError(null);
                }}
                onBlur={() => setCpfTouched(true)}
                placeholder="000.000.000-00"
                inputMode="numeric"
                autoComplete="off"
                required
                maxLength={14}
                aria-invalid={cpfStatus === 'invalid' || cpfStatus === 'incomplete'}
                aria-describedby={cpfHintId}
                className={inputDark}
                disabled={busy}
              />
              {cpfStatus === 'valid' ? (
                <CheckCircle2
                  className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400"
                  aria-hidden
                />
              ) : null}
              {cpfStatus === 'invalid' ? (
                <AlertCircle
                  className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-400"
                  aria-hidden
                />
              ) : null}
            </div>
            <p
              id={cpfHintId}
              className={cn(
                'mt-1.5 text-[11px] leading-4',
                cpfStatus === 'valid' && 'text-emerald-300',
                cpfStatus === 'invalid' && 'text-rose-300',
                cpfStatus === 'incomplete' && 'text-amber-200',
                !cpfStatus && 'text-slate-400'
              )}
              role="status"
            >
              {cpfStatus === 'valid'
                ? 'CPF válido.'
                : cpfStatus === 'invalid'
                  ? 'CPF inválido. Confira os dígitos.'
                  : cpfStatus === 'incomplete'
                    ? 'Digite os 11 números do CPF.'
                    : 'Máscara automática. Informe o CPF do pagador.'}
            </p>
          </div>

          <ul
            className="grid grid-cols-2 gap-2"
            aria-label="Selos de segurança do pagamento"
          >
            <li className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
              <Lock className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-white">SSL / HTTPS</span>
                <span className="block text-[10px] text-slate-300">Conexão criptografada</span>
              </span>
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-white">PCI DSS</span>
                <span className="block text-[10px] text-slate-300">Cartão na Asaas</span>
              </span>
            </li>
          </ul>

          <div role="group" aria-labelledby={methodsLegendId}>
            <p
              id={methodsLegendId}
              className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300"
            >
              Escolha Pix ou Cartão na arte
            </p>

            <div
              className={cn(
                'relative overflow-hidden rounded-2xl border-2 border-white/15 bg-slate-950',
                busy && 'opacity-80'
              )}
            >
              <Image
                src={saasPaymentsArt}
                alt=""
                aria-hidden
                className="h-auto w-full select-none object-cover"
                sizes="(max-width: 1024px) 100vw, 520px"
                priority
              />

              <div
                className="pointer-events-none absolute left-1/2 top-[46%] z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-colors sm:h-10 sm:w-10"
                aria-hidden
                style={{
                  borderColor:
                    selectedMethod === 'pix'
                      ? 'rgba(45,212,191,0.7)'
                      : selectedMethod === 'card'
                        ? 'rgba(167,139,250,0.7)'
                        : 'rgba(252,211,77,0.5)',
                  backgroundColor:
                    selectedMethod === 'pix'
                      ? 'rgba(20,184,166,0.25)'
                      : selectedMethod === 'card'
                        ? 'rgba(139,92,246,0.25)'
                        : 'rgba(2,6,23,0.75)'
                }}
              >
                {selectedMethod ? (
                  <Check
                    className={cn(
                      'h-4 w-4',
                      selectedMethod === 'pix' ? 'text-teal-200' : 'text-violet-200'
                    )}
                  />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-200">
                    ou
                  </span>
                )}
              </div>

              <div className="absolute inset-0 grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => void startPix()}
                  disabled={busy}
                  aria-pressed={selectedMethod === 'pix'}
                  aria-label="Pagar com Pix, aprovação instantânea"
                  className={cn(
                    'group relative border-r border-amber-300/30 outline-none transition',
                    'focus-visible:bg-teal-400/15 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-300',
                    'hover:bg-teal-400/10',
                    selectedMethod === 'pix' && 'bg-teal-400/15 ring-2 ring-inset ring-teal-300',
                    busyMethod === 'pix' && 'bg-teal-400/20'
                  )}
                >
                  <span className="absolute inset-x-2 bottom-2 rounded-xl bg-slate-950/75 px-2 py-2 text-center backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:px-3">
                    {busyMethod === 'pix' ? (
                      <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-teal-100">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Gerando Pix…
                      </span>
                    ) : (
                      <>
                        <span className="block text-base font-black uppercase tracking-wide text-teal-200 sm:text-lg">
                          PIX
                        </span>
                        <span className="mt-0.5 block text-[10px] font-semibold text-slate-100 sm:text-[11px]">
                          {selectedMethod === 'pix' ? 'Selecionado ✓' : 'Aprovação instantânea'}
                        </span>
                      </>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => void startCard()}
                  disabled={busy}
                  aria-pressed={selectedMethod === 'card'}
                  aria-label="Pagar com cartão, crédito ou débito"
                  className={cn(
                    'group relative outline-none transition',
                    'focus-visible:bg-violet-400/15 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300',
                    'hover:bg-violet-400/10',
                    selectedMethod === 'card' && 'bg-violet-400/15 ring-2 ring-inset ring-violet-300',
                    busyMethod === 'card' && 'bg-violet-400/20'
                  )}
                >
                  <span className="absolute inset-x-2 bottom-2 rounded-xl bg-slate-950/75 px-2 py-2 text-center backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:px-3">
                    {busyMethod === 'card' ? (
                      <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-violet-100">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Abrindo Asaas…
                      </span>
                    ) : (
                      <>
                        <span className="block text-base font-black uppercase tracking-wide text-violet-200 sm:text-lg">
                          CARTÃO
                        </span>
                        <span className="mt-0.5 block text-[10px] font-semibold text-slate-100 sm:text-[11px]">
                          {selectedMethod === 'card' ? 'Selecionado ✓' : 'Crédito ou débito'}
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <CardBrandMarks />
              <p className="text-center text-[11px] text-slate-400">
                Cartão: Visa, Mastercard e Elo na página segura da Asaas.
              </p>
            </div>
          </div>

          <div className="sticky bottom-3 z-10 rounded-2xl border border-amber-300/30 bg-slate-950/95 px-4 py-3 shadow-[0_12px_40px_-12px_rgba(2,8,23,0.9)] backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
                  Total hoje
                </p>
                <p className="text-lg font-black text-white">
                  {PLANS.premium.priceLabel}
                  <span className="ml-1 text-xs font-semibold text-slate-300">
                    · 30 dias, avulso
                  </span>
                </p>
              </div>
              <p className="text-[11px] leading-4 text-slate-300">
                Sem renovação automática.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'pix' ? (
        <div className="rounded-2xl border border-teal-400/25 bg-teal-500/5 p-5 text-center">
          <div className="mx-auto w-fit rounded-2xl bg-white p-3">
            <QRCodeSVG value={qrPayload} size={200} level="M" includeMargin />
          </div>
          <p className="mt-4 text-sm text-slate-200">
            Abra o app do seu banco, escolha Pix e escaneie o QR Code, ou use o copia e cola.
          </p>
          <button
            type="button"
            onClick={() => void copyPix()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-teal-300/40 bg-teal-500/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            {copied ? 'Código copiado' : 'Copiar código Pix'}
          </button>
          {awaiting ? (
            <p
              className="mt-4 flex items-center justify-center gap-2 text-xs text-teal-100"
              role="status"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Aguardando a confirmação do pagamento…
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-50"
          role="alert"
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
            setSelectedMethod(null);
          }}
          className="rounded text-xs font-medium text-slate-200 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Escolher outra forma de pagamento
        </button>
      ) : null}
    </div>
  );
}

export { PENDING_ASAAS_KEY };
