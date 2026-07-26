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
import { trackEvent } from '@/lib/analytics';
import cardPaymentArt from '@/assets/checkout-card-financial-v2.webp';
import pixPaymentArt from '@/assets/checkout-pix-financial-v2.webp';
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
    trackEvent('begin_checkout', { payment_method: 'pix', provider: 'asaas' });
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
    trackEvent('begin_checkout', { payment_method: 'card', provider: 'asaas' });
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
                  Conexão protegida
                  <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden />
                </span>
                <span className="block text-[10px] leading-tight text-emerald-700">
                  Navegação via HTTPS
                </span>
              </span>
            </li>
            <li className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-3 py-3 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 shadow-[0_2px_10px_-2px_rgba(2,132,199,0.6)]">
                <ShieldCheck className="h-4.5 w-4.5 text-white" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-sky-800">
                  Dados do cartão
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
              Escolha como pagar
            </p>

            <div className={cn('grid gap-3 sm:grid-cols-2', busy && 'opacity-80')}>
              <button
                type="button"
                onClick={() => void startPix()}
                disabled={busy}
                aria-pressed={selectedMethod === 'pix'}
                aria-label="Pagar com Pix, aprovação instantânea"
                className={cn(
                  'group overflow-hidden rounded-2xl border bg-white text-left outline-none transition duration-200',
                  'hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg',
                  'focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                  selectedMethod === 'pix'
                    ? 'border-emerald-500 ring-1 ring-emerald-500'
                    : 'border-slate-200'
                )}
              >
                <span className="relative block aspect-[16/10] overflow-hidden border-b border-slate-100 bg-emerald-50">
                  <Image
                    src={pixPaymentArt}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 640px) 100vw, 260px"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    priority
                  />
                </span>
                <span className="flex min-h-[74px] items-center justify-between gap-3 p-4">
                  <span>
                    <strong className="block text-base font-bold text-slate-950">Pagar com Pix</strong>
                    <span className="mt-1 block text-xs text-slate-500">QR Code · confirmação automática</span>
                  </span>
                  {busyMethod === 'pix' ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-600" aria-hidden />
                  ) : selectedMethod === 'pix' ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <span className="text-lg text-slate-400" aria-hidden>→</span>
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
                  'group overflow-hidden rounded-2xl border bg-white text-left outline-none transition duration-200',
                  'hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg',
                  'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  selectedMethod === 'card'
                    ? 'border-blue-500 ring-1 ring-blue-500'
                    : 'border-slate-200'
                )}
              >
                <span className="relative block aspect-[16/10] overflow-hidden border-b border-slate-100 bg-blue-50">
                  <Image
                    src={cardPaymentArt}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 640px) 100vw, 260px"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    priority
                  />
                </span>
                <span className="flex min-h-[74px] items-center justify-between gap-3 p-4">
                  <span>
                    <strong className="block text-base font-bold text-slate-950">Pagar com cartão</strong>
                    <span className="mt-1 block text-xs text-slate-500">Crédito ou débito · via Asaas</span>
                  </span>
                  {busyMethod === 'card' ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" aria-hidden />
                  ) : selectedMethod === 'card' ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
                  ) : (
                    <span className="text-lg text-slate-400" aria-hidden>→</span>
                  )}
                </span>
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <CardBrandMarks />
              <p className="text-center text-[11px] text-slate-500">
                O pagamento com cartão continua na página segura da Asaas.
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
