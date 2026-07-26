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
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm"
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
    let redirecting = false;
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
      redirecting = true;
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Falha ao abrir o cartão.';
      setError(text);
      toast(text, { variant: 'error' });
    } finally {
      // Mantém o botão "carregando" apenas enquanto o navegador de fato
      // redireciona para a Asaas; em qualquer outro caso (erro ou CPF
      // faltando) o busy precisa voltar, senão o campo de CPF fica
      // travado como desabilitado para sempre.
      if (!redirecting) {
        setBusy(false);
        setBusyMethod(null);
      }
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

  const inputLight = cn(
    'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm',
    'focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    cpfStatus === 'valid' && 'border-emerald-500 pr-11',
    cpfStatus === 'invalid' && 'border-rose-500 pr-11',
    cpfStatus === 'incomplete' && 'border-amber-500'
  );

  return (
    <div className="mt-6 space-y-4">
      {mode === 'choose' ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={cpfFieldId}
              className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500"
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
                className={inputLight}
                disabled={busy}
              />
              {cpfStatus === 'valid' ? (
                <CheckCircle2
                  className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500"
                  aria-hidden
                />
              ) : null}
              {cpfStatus === 'invalid' ? (
                <AlertCircle
                  className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-500"
                  aria-hidden
                />
              ) : null}
            </div>
            <p
              id={cpfHintId}
              className={cn(
                'mt-1.5 text-[11px] leading-4',
                cpfStatus === 'valid' && 'text-emerald-600',
                cpfStatus === 'invalid' && 'text-rose-600',
                cpfStatus === 'incomplete' && 'text-amber-600',
                !cpfStatus && 'text-slate-500'
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
            className="grid grid-cols-2 gap-2.5"
            aria-label="Selos de segurança do pagamento"
          >
            <li className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-3 py-3 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 shadow-[0_2px_10px_-2px_rgba(5,150,105,0.6)]">
                <Lock className="h-4.5 w-4.5 text-white" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">
                  Site seguro
                  <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden />
                </span>
                <span className="block text-[10px] leading-tight text-emerald-700">
                  Criptografia SSL 256 bits
                </span>
              </span>
            </li>
            <li className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-3 py-3 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 shadow-[0_2px_10px_-2px_rgba(2,132,199,0.6)]">
                <ShieldCheck className="h-4.5 w-4.5 text-white" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-sky-800">
                  Ambiente PCI DSS
                  <CheckCircle2 className="h-3 w-3 text-sky-600" aria-hidden />
                </span>
                <span className="block text-[10px] leading-tight text-sky-700">
                  Cartão processado pela Asaas
                </span>
              </span>
            </li>
          </ul>

          <div role="group" aria-labelledby={methodsLegendId}>
            <p
              id={methodsLegendId}
              className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500"
            >
              Escolha Pix ou Cartão na arte
            </p>

            <div
              className={cn(
                'relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50',
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
                        : 'rgba(255,255,255,0.9)'
                }}
              >
                {selectedMethod ? (
                  <Check
                    className={cn(
                      'h-4 w-4',
                      selectedMethod === 'pix' ? 'text-teal-600' : 'text-violet-600'
                    )}
                  />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600">
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
                    'group relative border-r border-slate-200 outline-none transition',
                    'focus-visible:bg-teal-500/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500',
                    'hover:bg-teal-500/5',
                    selectedMethod === 'pix' && 'bg-teal-500/10 ring-2 ring-inset ring-teal-500',
                    busyMethod === 'pix' && 'bg-teal-500/15'
                  )}
                >
                  <span className="absolute inset-x-2 bottom-2 rounded-xl border border-slate-200 bg-white/90 px-2 py-2 text-center shadow-sm backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:px-3">
                    {busyMethod === 'pix' ? (
                      <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-teal-700">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Gerando Pix…
                      </span>
                    ) : (
                      <>
                        <span className="block text-base font-black uppercase tracking-wide text-teal-700 sm:text-lg">
                          PIX
                        </span>
                        <span className="mt-0.5 block text-[10px] font-semibold text-slate-600 sm:text-[11px]">
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
                    'focus-visible:bg-violet-500/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500',
                    'hover:bg-violet-500/5',
                    selectedMethod === 'card' && 'bg-violet-500/10 ring-2 ring-inset ring-violet-500',
                    busyMethod === 'card' && 'bg-violet-500/15'
                  )}
                >
                  <span className="absolute inset-x-2 bottom-2 rounded-xl border border-slate-200 bg-white/90 px-2 py-2 text-center shadow-sm backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:px-3">
                    {busyMethod === 'card' ? (
                      <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-violet-700">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Abrindo Asaas…
                      </span>
                    ) : (
                      <>
                        <span className="block text-base font-black uppercase tracking-wide text-violet-700 sm:text-lg">
                          CARTÃO
                        </span>
                        <span className="mt-0.5 block text-[10px] font-semibold text-slate-600 sm:text-[11px]">
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
              <p className="text-center text-[11px] text-slate-500">
                Cartão: Visa, Mastercard e Elo na página segura da Asaas.
              </p>
            </div>
          </div>

          <div className="sticky bottom-3 z-10 rounded-2xl border border-amber-300 bg-white px-4 py-3 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600">
                  Total hoje
                </p>
                <p className="text-lg font-black text-slate-900">
                  {PLANS.premium.priceLabel}
                  <span className="ml-1 text-xs font-semibold text-slate-500">
                    · 30 dias, avulso
                  </span>
                </p>
              </div>
              <p className="text-[11px] leading-4 text-slate-500">
                Sem renovação automática.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'pix' ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 text-center">
          <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <QRCodeSVG value={qrPayload} size={200} level="M" includeMargin />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Abra o app do seu banco, escolha Pix e escaneie o QR Code, ou use o copia e cola.
          </p>
          <button
            type="button"
            onClick={() => void copyPix()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-white" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            {copied ? 'Código copiado' : 'Copiar código Pix'}
          </button>
          {awaiting ? (
            <p
              className="mt-4 flex items-center justify-center gap-2 text-xs text-teal-700"
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
          className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800"
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
          className="rounded text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Escolher outra forma de pagamento
        </button>
      ) : null}
    </div>
  );
}

export { PENDING_ASAAS_KEY };
