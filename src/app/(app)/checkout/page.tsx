'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import {
  AsaasLogo,
  MercadoPagoLogo,
  NuPayLogo,
  PixLogo,
  StripeLogo,
  type PaymentMethodId
} from '@/components/billing/payment-provider-logos';
import { AsaasCheckout, PENDING_ASAAS_KEY } from '@/components/billing/asaas-checkout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { formatCpf, isValidCpf } from '@/lib/cpf';
import { getMpDeviceSessionId } from '@/lib/mp-device-session';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const PENDING_MP_KEY = 'rj_pending_mp_payment';
const PENDING_NUPAY_KEY = 'rj_pending_nupay';
const PENDING_STRIPE_KEY = 'rj_pending_stripe';
const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 12 * 60 * 1000;

type StepStatus = 'idle' | 'active' | 'done' | 'error';
type FlowPhase = 'ready' | 'redirecting' | 'awaiting' | 'success' | 'failure';

function firstValidParam(searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value && value !== 'null' && value !== 'undefined') return value;
  }
  return '';
}

function normalizeMethod(raw: string | null): PaymentMethodId {
  if (
    raw === 'stripe' ||
    raw === 'nupay' ||
    raw === 'pix' ||
    raw === 'mercadopago' ||
    raw === 'asaas'
  ) {
    return raw;
  }
  return 'mercadopago';
}

function MethodMark({ method }: { method: PaymentMethodId }) {
  if (method === 'stripe') {
    return (
      <span className="relative block h-12 w-[8.25rem] shrink-0 overflow-hidden rounded-xl shadow-sm">
        <StripeLogo fill />
      </span>
    );
  }

  return (
    <span className="flex h-12 w-[8.25rem] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white px-2 shadow-sm">
      {method === 'nupay' ? (
        <NuPayLogo className="h-7 max-w-[7rem]" />
      ) : method === 'pix' ? (
        <PixLogo className="h-8 max-w-[7.5rem]" />
      ) : method === 'asaas' ? (
        <AsaasLogo className="text-xl" />
      ) : (
        <MercadoPagoLogo className="h-8 max-w-[7.5rem]" />
      )}
    </span>
  );
}

function StepRow({
  label,
  detail,
  status
}: {
  label: string;
  detail: string;
  status: StepStatus;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
          status === 'done' && 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300',
          status === 'active' && 'border-sky-400/50 bg-sky-500/15 text-sky-200',
          status === 'error' && 'border-rose-400/50 bg-rose-500/15 text-rose-200',
          status === 'idle' && 'border-white/15 bg-white/5 text-slate-500'
        )}
        aria-hidden
      >
        {status === 'done' ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : status === 'error' ? (
          <XCircle className="h-3.5 w-3.5" />
        ) : status === 'active' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          '·'
        )}
      </span>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-400">{detail}</p>
      </div>
    </li>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { session, plan, refresh } = useAuth();

  const method = normalizeMethod(searchParams.get('method'));
  const billing = searchParams.get('billing') || '';

  const [phase, setPhase] = useState<FlowPhase>('ready');
  const [message, setMessage] = useState<string | null>(null);
  const [cpf, setCpf] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const startedRef = useRef(false);
  const returnHandledRef = useRef(false);

  const steps = useMemo(() => {
    const pick: StepStatus =
      phase === 'ready' ? 'active' : phase === 'failure' && !billing ? 'error' : 'done';
    const pay: StepStatus =
      phase === 'redirecting'
        ? 'active'
        : phase === 'awaiting' || phase === 'success'
          ? 'done'
          : phase === 'failure' && Boolean(billing)
            ? 'error'
            : 'idle';
    const confirm: StepStatus =
      phase === 'awaiting'
        ? 'active'
        : phase === 'success'
          ? 'done'
          : phase === 'failure' && Boolean(billing)
            ? 'error'
            : 'idle';
    const done: StepStatus =
      phase === 'success' ? 'done' : phase === 'failure' && Boolean(billing) ? 'error' : 'idle';

    return [
      {
        label: 'Método selecionado',
        detail:
          method === 'stripe'
            ? 'Stripe · cartão internacional'
            : method === 'nupay'
              ? 'NuPay · conta Nubank'
              : method === 'pix'
                ? 'Pix via Mercado Pago'
                : method === 'asaas'
                  ? 'Asaas · Pix e cartão'
                  : 'Mercado Pago · Pix, boleto e cartão',
        status: pick
      },
      {
        label: 'Checkout seguro',
        detail:
          method === 'asaas'
            ? 'Pix na tela ou cartão na página segura da Asaas.'
            : 'Redirecionamento ao provedor certificado (PCI).',
        status: pay
      },
      {
        label: 'Confirmação',
        detail: 'Acompanhamos a aprovação em tempo real.',
        status: confirm
      },
      {
        label: phase === 'failure' ? 'Não concluído' : 'Premium liberado',
        detail:
          phase === 'success'
            ? 'Documentos sem marca Resolva Jato por 30 dias.'
            : phase === 'failure'
              ? 'Você pode tentar novamente com outro método.'
              : 'Aguardando confirmação do pagamento.',
        status: done
      }
    ];
  }, [billing, method, phase]);

  async function startMercadoPago() {
    if (!session?.user.email) throw new Error('Faça login para continuar.');
    // Device ID é crítico: sem ele o MP marca cartão como cc_rejected_high_risk.
    const deviceSessionId = await getMpDeviceSessionId(5000);
    if (!deviceSessionId) {
      console.warn('[checkout/mp] MP_DEVICE_SESSION_ID ausente: antifraude sem fingerprint');
    }
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: session.user.email, deviceSessionId })
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      checkoutUrl?: string;
    };
    if (!response.ok) throw new Error(data.error || 'Não foi possível abrir o Mercado Pago.');
    if (!data.checkoutUrl) throw new Error('Checkout criado sem URL de pagamento.');
    window.location.assign(data.checkoutUrl);
  }

  async function startStripe() {
    const response = await fetch('/api/billing/checkout-stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({})
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      sessionId?: string;
      checkoutUrl?: string;
    };
    if (!response.ok) throw new Error(data.error || 'Não foi possível abrir a Stripe.');
    if (!data.checkoutUrl) throw new Error('Checkout Stripe sem URL.');
    if (data.sessionId) {
      sessionStorage.setItem(
        PENDING_STRIPE_KEY,
        JSON.stringify({ sessionId: data.sessionId, savedAt: Date.now() })
      );
    }
    window.location.assign(data.checkoutUrl);
  }

  async function startNuPay(cpfDigits: string) {
    const response = await fetch('/api/billing/checkout-nupay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cpf: cpfDigits })
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      sessionId?: string;
      reference?: string;
      checkoutUrl?: string;
    };
    if (!response.ok) throw new Error(data.error || 'Não foi possível abrir o NuPay.');
    if (!data.checkoutUrl) throw new Error('NuPay sem URL de pagamento.');
    if (data.sessionId) {
      sessionStorage.setItem(
        PENDING_NUPAY_KEY,
        JSON.stringify({
          sessionId: data.sessionId,
          reference: data.reference || '',
          savedAt: Date.now()
        })
      );
    }
    window.location.assign(data.checkoutUrl);
  }

  async function beginCheckout() {
    setPhase('redirecting');
    setMessage('Abrindo ambiente seguro do provedor…');
    try {
      if (method === 'stripe') await startStripe();
      else if (method === 'nupay') {
        if (!isValidCpf(cpf)) {
          setPhase('ready');
          setMessage('Informe um CPF válido da conta Nubank para continuar.');
          toast('CPF inválido para NuPay.', { variant: 'error' });
          return;
        }
        await startNuPay(cpf);
      } else await startMercadoPago();
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Falha ao iniciar o pagamento.';
      setPhase('failure');
      setMessage(text);
      toast(text, { variant: 'error' });
    }
  }

  // Auto-inicia Stripe / Mercado Pago / Pix. NuPay espera CPF.
  useEffect(() => {
    if (!session?.user.email || startedRef.current || billing) return;
    if (plan.id === 'premium') return;
    // NuPay pede CPF e Asaas é inline/hospedada: não auto-iniciam.
    if (method === 'nupay' || method === 'asaas') return;
    startedRef.current = true;
    void beginCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.email, method, billing, plan.id]);

  // Retorno do provedor: acompanhar sucesso/falha
  useEffect(() => {
    if (!session?.user.email || returnHandledRef.current || !billing) return;
    returnHandledRef.current = true;

    const nupayState = (firstValidParam(searchParams, ['state']) || '').toLowerCase();
    if (
      billing === 'failure' ||
      billing === 'stripe-cancel' ||
      billing === 'nupay-cancel' ||
      billing === 'asaas-cancel' ||
      nupayState === 'canceled' ||
      nupayState === 'cancelled'
    ) {
      setPhase('failure');
      setMessage('Pagamento cancelado ou não concluído. Escolha outro método se preferir.');
      toast('Pagamento não concluído.', { variant: 'error' });
      router.replace(`/checkout?method=${method}`);
      return;
    }

    setPhase('awaiting');
    setMessage('Confirmando seu pagamento…');

    const paymentId = firstValidParam(searchParams, ['payment_id', 'collection_id']);
    const merchantOrderId = firstValidParam(searchParams, ['merchant_order_id']);
    const stripeSessionId = firstValidParam(searchParams, ['session_id']);
    const nupaySessionId = firstValidParam(searchParams, ['sessionId', 'session_id']);
    const nupayReference = firstValidParam(searchParams, ['reference']);

    if (paymentId || merchantOrderId) {
      sessionStorage.setItem(
        PENDING_MP_KEY,
        JSON.stringify({ paymentId, merchantOrderId, savedAt: Date.now() })
      );
    }
    if (stripeSessionId && method === 'stripe') {
      sessionStorage.setItem(
        PENDING_STRIPE_KEY,
        JSON.stringify({ sessionId: stripeSessionId, savedAt: Date.now() })
      );
    }
    if ((nupaySessionId || nupayReference) && method === 'nupay') {
      sessionStorage.setItem(
        PENDING_NUPAY_KEY,
        JSON.stringify({
          sessionId: nupaySessionId,
          reference: nupayReference,
          savedAt: Date.now()
        })
      );
    }

    router.replace(`/checkout?method=${method}`);

    let cancelled = false;
    const startedAt = Date.now();
    let timer: number | undefined;

    const tick = async () => {
      if (cancelled) return;
      try {
        let approved = false;
        let nextExpires: string | undefined;

        if (billing.startsWith('stripe') || method === 'stripe') {
          const stored = (() => {
            try {
              return JSON.parse(sessionStorage.getItem(PENDING_STRIPE_KEY) || '{}') as {
                sessionId?: string;
              };
            } catch {
              return {};
            }
          })();
          const sid = stripeSessionId || stored.sessionId || '';
          if (!sid) throw new Error('Sessão Stripe não encontrada.');
          const res = await fetch(`/api/billing/confirm-stripe?session_id=${encodeURIComponent(sid)}`, {
            credentials: 'include'
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Falha ao confirmar Stripe.');
          approved = Boolean(data.approved);
          nextExpires = data.expiresAt;
        } else if (billing.startsWith('asaas') || method === 'asaas') {
          const stored = (() => {
            try {
              return JSON.parse(sessionStorage.getItem(PENDING_ASAAS_KEY) || '{}') as {
                paymentId?: string;
              };
            } catch {
              return {};
            }
          })();
          const pid = stored.paymentId || '';
          if (!pid) throw new Error('Cobrança Asaas não encontrada.');
          const res = await fetch(
            `/api/billing/confirm-asaas?paymentId=${encodeURIComponent(pid)}`,
            { credentials: 'include' }
          );
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Falha ao confirmar Asaas.');
          approved = Boolean(data.approved);
          nextExpires = data.expiresAt;
        } else if (billing.startsWith('nupay') || method === 'nupay') {
          const stored = (() => {
            try {
              return JSON.parse(sessionStorage.getItem(PENDING_NUPAY_KEY) || '{}') as {
                sessionId?: string;
                reference?: string;
              };
            } catch {
              return {};
            }
          })();
          const qs = new URLSearchParams();
          const sid = nupaySessionId || stored.sessionId || '';
          const ref = nupayReference || stored.reference || '';
          if (sid) qs.set('sessionId', sid);
          if (ref) qs.set('reference', ref);
          if (nupayState) qs.set('state', nupayState);
          const res = await fetch(`/api/billing/confirm-nupay?${qs.toString()}`, {
            credentials: 'include'
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            approved?: boolean;
            expiresAt?: string;
            paymentUrl?: string;
            status?: string;
          };
          if (!res.ok) throw new Error(data.error || 'Falha ao confirmar NuPay.');
          if (data.paymentUrl && typeof data.paymentUrl === 'string') {
            window.location.assign(data.paymentUrl);
            return;
          }
          approved = Boolean(data.approved);
          nextExpires = data.expiresAt;
        } else {
          const stored = (() => {
            try {
              return JSON.parse(sessionStorage.getItem(PENDING_MP_KEY) || '{}') as {
                paymentId?: string;
                merchantOrderId?: string;
              };
            } catch {
              return {};
            }
          })();
          const qs = new URLSearchParams({ email: session.user.email });
          const pid = paymentId || stored.paymentId || '';
          const mid = merchantOrderId || stored.merchantOrderId || '';
          if (pid) qs.set('payment_id', pid);
          if (mid) qs.set('merchant_order_id', mid);
          const res = await fetch(`/api/billing/confirm?${qs.toString()}`, {
            credentials: 'include'
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Falha ao confirmar pagamento.');
          approved = Boolean(data.approved);
          nextExpires = data.expiresAt;
        }

        if (cancelled) return;
        if (approved) {
          sessionStorage.removeItem(PENDING_MP_KEY);
          sessionStorage.removeItem(PENDING_NUPAY_KEY);
          sessionStorage.removeItem(PENDING_STRIPE_KEY);
          sessionStorage.removeItem(PENDING_ASAAS_KEY);
          if (nextExpires) setExpiresAt(nextExpires);
          await refresh();
          setPhase('success');
          setMessage('Pagamento aprovado. Premium ativo por 30 dias.');
          toast('Premium ativado: documentos limpos, sem marca.');
          return;
        }

        setMessage('Aguardando aprovação do provedor…');
      } catch (error) {
        if (cancelled) return;
        const text = error instanceof Error ? error.message : 'Falha na confirmação.';
        setPhase('failure');
        setMessage(text);
        toast(text, { variant: 'error' });
        return;
      }

      if (Date.now() - startedAt >= POLL_MAX_MS) {
        setPhase('awaiting');
        setMessage(
          'Ainda não encontramos a aprovação. O Premium libera automaticamente quando o pagamento for confirmado. Atualize em alguns minutos.'
        );
        return;
      }
      timer = window.setTimeout(() => {
        void tick();
      }, POLL_INTERVAL_MS);
    };

    void tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billing, session?.user.email, method]);

  if (plan.id === 'premium' && phase !== 'success' && !billing) {
    return (
      <AuthGate
      title="Checkout seguro"
      description="Conclua o Premium com acompanhamento do pagamento."
      enforceUsageLimit={false}
      requireEmailVerified={false}
    >
        <div className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">Premium já ativo</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sua conta já tem documentos sem marca Resolva Jato.
            </p>
            <Link
              href="/conta"
              className="mt-6 inline-flex text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
            >
              Voltar para a conta
            </Link>
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate
      title="Checkout seguro"
      description="Conclua o Premium com acompanhamento do pagamento."
      enforceUsageLimit={false}
      requireEmailVerified={false}
    >
      <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.18),_transparent_55%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)]"
        />
        <div className="relative mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_-40px_rgba(14,165,233,0.55)] backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">
              <Lock className="h-3.5 w-3.5" />
              Checkout seguro
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Resolva Jato Premium
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {PLANS.premium.priceLabel}
              {PLANS.premium.period}, avulso, sem renovação automática. Documentos sem marca nos
              PDFs, WhatsApp e e-mail.
            </p>

            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <MethodMark method={method} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Provedor
                </p>
                <p className="truncate text-sm text-white">
                  {method === 'stripe'
                    ? 'Stripe'
                    : method === 'nupay'
                      ? 'NuPay'
                      : method === 'pix'
                        ? 'Pix'
                        : method === 'asaas'
                          ? 'Asaas'
                          : 'Mercado Pago'}
                </p>
              </div>
            </div>

            {method === 'nupay' && phase === 'ready' ? (
              <div className="mt-6 space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  CPF da conta Nubank
                </label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  autoComplete="off"
                  className="border-white/20 bg-slate-950/50 text-white placeholder:text-slate-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void beginCheckout();
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label="Continuar com NuPay"
                  onClick={() => void beginCheckout()}
                  className="group flex h-14 w-full items-center justify-center rounded-2xl border border-white/15 bg-white px-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-16px_rgba(130,10,209,0.55)]"
                >
                  <NuPayLogo className="h-8 max-w-[8rem] transition group-hover:scale-105" />
                </button>
              </div>
            ) : null}

            {method === 'asaas' && phase !== 'success' && phase !== 'failure' ? (
              <AsaasCheckout
                onApproved={(expires) => {
                  if (expires) setExpiresAt(expires);
                  void refresh();
                  setPhase('success');
                  setMessage('Pagamento aprovado. Premium ativo por 30 dias.');
                  toast('Premium ativado: documentos limpos, sem marca.');
                }}
              />
            ) : null}

            {phase === 'failure' ? (
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {(
                  [
                    ['mercadopago', MercadoPagoLogo, false],
                    ['pix', PixLogo, false],
                    ['asaas', AsaasLogo, false],
                    ['stripe', StripeLogo, true],
                    ['nupay', NuPayLogo, false]
                  ] as const
                ).map(([id, Logo, cover]) => (
                  <Link
                    key={id}
                    href={`/checkout?method=${id}`}
                    aria-label={`Tentar com ${id}`}
                    onClick={() => {
                      startedRef.current = false;
                      returnHandledRef.current = false;
                      setPhase('ready');
                      setMessage(null);
                    }}
                    className={cn(
                      'relative flex h-14 items-center justify-center overflow-hidden rounded-2xl border transition hover:-translate-y-0.5',
                      cover
                        ? 'border-transparent'
                        : 'border-white/15 bg-white'
                    )}
                  >
                    {cover ? (
                      <Logo fill />
                    ) : (
                      <Logo className="h-8 max-w-[7.5rem]" />
                    )}
                  </Link>
                ))}
              </div>
            ) : null}

            {message ? (
              <p
                className={cn(
                  'mt-6 rounded-2xl border px-4 py-3 text-sm leading-6',
                  phase === 'success' &&
                    'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
                  phase === 'failure' && 'border-rose-400/30 bg-rose-500/10 text-rose-100',
                  (phase === 'redirecting' || phase === 'awaiting' || phase === 'ready') &&
                    'border-sky-400/25 bg-sky-500/10 text-sky-100'
                )}
                role="status"
              >
                {message}
              </p>
            ) : null}

            {phase === 'success' ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/conta"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
                >
                  Ir para a conta
                </Link>
                <Link
                  href="/ferramentas"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Abrir ferramentas
                </Link>
              </div>
            ) : null}
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
              Acompanhamento
            </div>
            <ol className="mt-6 space-y-5">{steps.map((step) => (
              <StepRow key={step.label} {...step} />
            ))}</ol>

            {expiresAt ? (
              <p className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-100">
                Vigência Premium até {new Date(expiresAt).toLocaleDateString('pt-BR')}.
              </p>
            ) : null}

            <p className="mt-8 text-[11px] leading-5 text-slate-500">
              Conexão criptografada. O Resolva Jato não armazena dados do cartão. O provedor
              processa o pagamento e notifica a liberação do Premium.
            </p>
            <Link
              href="/conta"
              className="mt-4 inline-flex text-xs font-medium text-slate-400 underline-offset-4 hover:text-white hover:underline"
            >
              Voltar sem pagar
            </Link>
          </aside>
        </div>
      </div>
    </AuthGate>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
