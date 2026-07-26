'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  Loader2,
  Lock,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import {
  AsaasCheckout,
  PENDING_ASAAS_KEY,
  type AsaasCheckoutStage
} from '@/components/billing/asaas-checkout';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 12 * 60 * 1000;

type StepStatus = 'idle' | 'active' | 'done' | 'error';
type FlowPhase = 'ready' | 'awaiting' | 'success' | 'failure';

function StepRow({
  index,
  label,
  detail,
  status,
  spinning = false
}: {
  index: number;
  label: string;
  detail: string;
  status: StepStatus;
  spinning?: boolean;
}) {
  return (
    <li
      className={cn(
        'relative flex gap-3 rounded-2xl border px-3 py-3 transition',
        status === 'active' && 'border-sky-200 bg-sky-50 shadow-sm',
        status === 'done' && 'border-emerald-200 bg-emerald-50',
        status === 'error' && 'border-rose-200 bg-rose-50',
        status === 'idle' && 'border-slate-200 bg-slate-50 opacity-70'
      )}
      aria-current={status === 'active' ? 'step' : undefined}
    >
      <span
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
          status === 'done' && 'border-emerald-600 bg-emerald-600 text-white',
          status === 'active' && 'border-sky-600 bg-sky-600 text-white',
          status === 'error' && 'border-rose-300 bg-rose-100 text-rose-700',
          status === 'idle' && 'border-slate-300 bg-white text-slate-500'
        )}
        aria-hidden
      >
        {status === 'done' ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : status === 'error' ? (
          <XCircle className="h-4 w-4" />
        ) : status === 'active' && spinning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          index
        )}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-semibold',
            status === 'active' && 'text-sky-900',
            status === 'done' && 'text-emerald-900',
            status === 'error' && 'text-rose-900',
            status === 'idle' && 'text-slate-500'
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            'mt-0.5 text-xs leading-5',
            status === 'active' && 'text-sky-700',
            status === 'done' && 'text-emerald-700',
            status === 'error' && 'text-rose-700',
            status === 'idle' && 'text-slate-500'
          )}
        >
          {detail}
        </p>
      </div>
    </li>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Por que preciso do CPF?',
    a: 'A Asaas exige CPF do pagador para emitir a cobrança e cumprir regras antifraude.'
  },
  {
    q: 'Há renovação automática?',
    a: 'Não. O Premium é avulso por 30 dias. Depois a conta volta ao plano grátis.'
  },
  {
    q: 'Como cancelar?',
    a: 'Não há assinatura recorrente para cancelar. Ao fim dos 30 dias o Premium expira sozinho.'
  },
  {
    q: 'O cartão fica guardado aqui?',
    a: 'Não. O cartão é informado no checkout hospedado da Asaas. O Resolva Jato não armazena o número.'
  }
] as const;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { session, plan, refresh } = useAuth();

  const rawMethod = searchParams.get('method');
  const billing = searchParams.get('billing') || '';

  const [phase, setPhase] = useState<FlowPhase>('ready');
  const [checkoutStage, setCheckoutStage] = useState<AsaasCheckoutStage>('choose');
  const [message, setMessage] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const returnHandledRef = useRef(false);

  const handleStageChange = useCallback((stage: AsaasCheckoutStage) => {
    setCheckoutStage(stage);
  }, []);

  useEffect(() => {
    if (rawMethod === 'asaas') return;
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('method', 'asaas');
    router.replace(`/checkout?${qs.toString()}`);
  }, [rawMethod, router, searchParams]);

  const steps = useMemo(() => {
    const pick: StepStatus =
      phase === 'success'
        ? 'done'
        : phase === 'failure'
          ? 'error'
          : checkoutStage === 'choose' && phase === 'ready'
            ? 'active'
            : 'done';

    const pay: StepStatus =
      phase === 'success'
        ? 'done'
        : phase === 'failure' && Boolean(billing)
          ? 'error'
          : checkoutStage === 'pix' || checkoutStage === 'card' || phase === 'awaiting'
            ? phase === 'awaiting'
              ? 'done'
              : 'active'
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
          checkoutStage === 'pix'
            ? 'Pix via Asaas'
            : checkoutStage === 'card'
              ? 'Cartão via Asaas'
              : 'Toque em Pix ou Cartão na arte',
        status: pick,
        // Aguardando o clique do usuário não é uma requisição em andamento.
        spinning: false
      },
      {
        label: 'Checkout seguro',
        detail:
          checkoutStage === 'pix'
            ? 'QR Code na tela. Escaneie ou copie o código.'
            : checkoutStage === 'card'
              ? 'Página segura da Asaas (crédito ou débito).'
              : 'Informe o CPF e escolha o método na arte.',
        status: pay,
        // Só gira enquanto o Pix está sendo confirmado em segundo plano.
        spinning: pay === 'active' && checkoutStage === 'pix'
      },
      {
        label: 'Confirmação',
        detail: 'Acompanhamos a aprovação em tempo real.',
        status: confirm,
        // Polling real de confirmação em segundo plano.
        spinning: confirm === 'active'
      },
      {
        label: phase === 'failure' ? 'Não concluído' : 'Premium liberado',
        detail:
          phase === 'success'
            ? 'Documentos sem marca Resolva Jato por 30 dias.'
            : phase === 'failure'
              ? 'Tente novamente com Pix ou cartão.'
              : 'Aguardando confirmação do pagamento.',
        status: done
      }
    ];
  }, [billing, checkoutStage, phase]);

  useEffect(() => {
    if (!session?.user.email || returnHandledRef.current || !billing) return;
    returnHandledRef.current = true;

    if (
      billing === 'asaas-cancel' ||
      billing === 'failure' ||
      billing === 'stripe-cancel' ||
      billing === 'nupay-cancel'
    ) {
      setPhase('failure');
      setMessage('Pagamento cancelado ou não concluído. Tente novamente com Pix ou cartão.');
      toast('Pagamento não concluído.', { variant: 'error' });
      router.replace('/checkout?method=asaas');
      return;
    }

    setPhase('awaiting');
    setMessage('Confirmando seu pagamento…');
    router.replace('/checkout?method=asaas');

    let cancelled = false;
    const startedAt = Date.now();
    let timer: number | undefined;

    const tick = async () => {
      if (cancelled) return;
      try {
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

        if (cancelled) return;
        if (data.approved) {
          sessionStorage.removeItem(PENDING_ASAAS_KEY);
          if (data.expiresAt) setExpiresAt(data.expiresAt);
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
  }, [billing, session?.user.email]);

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
      <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[#f6f8fb]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_65%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-12">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href="/conta"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Voltar sem pagar
            </Link>
            <p className="text-right text-xs font-medium text-slate-500">
              {PLANS.premium.priceLabel}
              {PLANS.premium.period} · avulso
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)]">
            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.24)] sm:p-8">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Checkout seguro
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Resolva Jato Premium
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {PLANS.premium.priceLabel}
                {PLANS.premium.period}, avulso, sem renovação automática. Documentos sem marca nos
                PDFs, WhatsApp e e-mail.
              </p>

              {phase !== 'success' && phase !== 'failure' ? (
                <AsaasCheckout
                  onStageChange={handleStageChange}
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
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      returnHandledRef.current = false;
                      setPhase('ready');
                      setCheckoutStage('choose');
                      setMessage(null);
                      router.replace('/checkout?method=asaas');
                    }}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : null}

              {message ? (
                <p
                  className={cn(
                    'mt-6 rounded-2xl border px-4 py-3 text-sm leading-6',
                    phase === 'success' &&
                      'border-emerald-300 bg-emerald-50 text-emerald-800',
                    phase === 'failure' && 'border-rose-300 bg-rose-50 text-rose-800',
                    (phase === 'awaiting' || phase === 'ready') &&
                      'border-sky-300 bg-sky-50 text-sky-800'
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
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Ir para a conta
                  </Link>
                  <Link
                    href="/ferramentas"
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Abrir ferramentas
                  </Link>
                </div>
              ) : null}
            </section>

            <aside className="flex flex-col rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.18)] sm:p-7 lg:sticky lg:top-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                Acompanhamento
              </div>
              <ol className="mt-5 space-y-3">
                {steps.map((step, index) => (
                  <StepRow key={step.label} index={index + 1} {...step} />
                ))}
              </ol>

              {expiresAt ? (
                <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
                  Vigência Premium até {new Date(expiresAt).toLocaleDateString('pt-BR')}.
                </p>
              ) : null}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Resumo
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  Total hoje: {PLANS.premium.priceLabel}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  30 dias · avulso · sem renovação automática
                </p>
              </div>

              <p className="mt-6 text-xs leading-5 text-slate-500">
                Conexão criptografada. O Resolva Jato não armazena dados do cartão. A Asaas processa
                o pagamento e notifica a liberação do Premium.
              </p>
            </aside>
          </div>

          <section className="mt-6 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <CircleHelp className="h-3.5 w-3.5 text-sky-600" aria-hidden />
              Dúvidas rápidas
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <dt className="text-sm font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-1.5 text-xs leading-5 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
            <ul
              className="mt-6 flex flex-wrap items-center gap-2"
              aria-label="Selos de confiança"
            >
              <li className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                SSL / HTTPS
              </li>
              <li className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                Processado pela Asaas
              </li>
              <li className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                Visa · Mastercard · Elo
              </li>
              <li className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                Pix instantâneo
              </li>
            </ul>
          </section>
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
