'use client';

import Image from 'next/image';
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
import { AsaasCheckout, PENDING_ASAAS_KEY } from '@/components/billing/asaas-checkout';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import saasPaymentsArt from '@/assets/saas_payments.png';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 12 * 60 * 1000;

type StepStatus = 'idle' | 'active' | 'done' | 'error';
type FlowPhase = 'ready' | 'awaiting' | 'success' | 'failure';

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

  const rawMethod = searchParams.get('method');
  const billing = searchParams.get('billing') || '';

  const [phase, setPhase] = useState<FlowPhase>('ready');
  const [message, setMessage] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const returnHandledRef = useRef(false);

  // Checkout único: método ausente ou outro provedor → Asaas.
  useEffect(() => {
    if (rawMethod === 'asaas') return;
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('method', 'asaas');
    router.replace(`/checkout?${qs.toString()}`);
  }, [rawMethod, router, searchParams]);

  const steps = useMemo(() => {
    const pick: StepStatus =
      phase === 'ready' ? 'active' : phase === 'failure' && !billing ? 'error' : 'done';
    const pay: StepStatus =
      phase === 'awaiting' || phase === 'success'
        ? 'done'
        : phase === 'failure' && Boolean(billing)
          ? 'error'
          : phase === 'ready'
            ? 'active'
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
        detail: 'Asaas · Pix e cartão (crédito ou débito)',
        status: pick
      },
      {
        label: 'Checkout seguro',
        detail: 'Pix na tela ou cartão na página segura da Asaas.',
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
              ? 'Tente novamente com Pix ou cartão.'
              : 'Aguardando confirmação do pagamento.',
        status: done
      }
    ];
  }, [billing, phase]);

  // Retorno da Asaas (cartão hospedado): acompanhar sucesso/falha
  useEffect(() => {
    if (!session?.user.email || returnHandledRef.current || !billing) return;
    returnHandledRef.current = true;

    if (billing === 'asaas-cancel' || billing === 'failure' || billing === 'stripe-cancel' || billing === 'nupay-cancel') {
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

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
              <Image
                src={saasPaymentsArt}
                alt="Pagamento processado por Asaas: Pix ou cartão (crédito ou débito)"
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 520px"
                priority
              />
            </div>

            {phase !== 'success' && phase !== 'failure' ? (
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
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    returnHandledRef.current = false;
                    setPhase('ready');
                    setMessage(null);
                    router.replace('/checkout?method=asaas');
                  }}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
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
                    'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
                  phase === 'failure' && 'border-rose-400/30 bg-rose-500/10 text-rose-100',
                  (phase === 'awaiting' || phase === 'ready') &&
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
            <ol className="mt-6 space-y-5">
              {steps.map((step) => (
                <StepRow key={step.label} {...step} />
              ))}
            </ol>

            {expiresAt ? (
              <p className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-100">
                Vigência Premium até {new Date(expiresAt).toLocaleDateString('pt-BR')}.
              </p>
            ) : null}

            <p className="mt-8 text-[11px] leading-5 text-slate-500">
              Conexão criptografada. O Resolva Jato não armazena dados do cartão. A Asaas processa o
              pagamento e notifica a liberação do Premium.
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
