'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Loader2,
  QrCode,
  ShieldCheck,
  Wallet,
  XCircle,
  type LucideIcon
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/billing';
import { cn } from '@/lib/utils';

export interface PendingPaymentInfo {
  status: 'success' | 'pending' | 'failure';
  paymentId: string;
  merchantOrderId: string;
  mpStatus: string;
  email: string;
}

interface PaymentConfirmResult {
  approved: boolean;
  status?: string;
  statusDetail?: string;
  error?: string;
  expiresAt?: string;
  paymentMethod?: string;
  paymentType?: string;
  boletoUrl?: string;
}

interface PaymentStatusModalProps {
  payment: PendingPaymentInfo;
  onResolved: (result: { approved: boolean; message: string; expiresAt?: string }) => void;
  onClose: () => void;
}

type Phase = 'checking' | 'waiting' | 'success' | 'error';
type MethodKind = 'unknown' | 'pix' | 'card' | 'boleto' | 'other';

const REJECTED_STATUSES = new Set(['rejected', 'cancelled', 'refunded', 'charged_back']);

function resolveMethodKind(paymentType?: string, paymentMethod?: string): MethodKind {
  const type = (paymentType || '').toLowerCase();
  const method = (paymentMethod || '').toLowerCase();
  if (method === 'pix' || type === 'bank_transfer') return 'pix';
  if (type === 'ticket' || method.includes('bol')) return 'boleto';
  if (type === 'credit_card' || type === 'debit_card') return 'card';
  if (type) return 'other';
  return 'unknown';
}

interface MethodConfig {
  icon: LucideIcon;
  waitingTitle: string;
  waitingSubtitle: string;
  steps: [string, string, string];
  pollIntervalMs: number;
  longWaitAttempts: number;
  longWaitMessage: string;
  showTimer: boolean;
}

const METHOD_CONFIG: Record<MethodKind, MethodConfig> = {
  unknown: {
    icon: Wallet,
    waitingTitle: 'Confirmando seu pagamento',
    waitingSubtitle:
      'Estamos verificando o retorno do Mercado Pago. Assim que a forma de pagamento for identificada, mostramos os próximos passos aqui.',
    steps: ['Retorno recebido do Mercado Pago', 'Identificando a forma de pagamento', 'Liberando o Premium'],
    pollIntervalMs: 4000,
    longWaitAttempts: 15,
    longWaitMessage:
      'Está levando mais tempo que o normal para identificar o pagamento. Pode deixar esta janela aberta — vamos continuar tentando.',
    showTimer: true
  },
  pix: {
    icon: QrCode,
    waitingTitle: 'Aguardando confirmação do Pix',
    waitingSubtitle:
      'Recebemos sua solicitação no Mercado Pago. Assim que o Pix for aprovado, o Premium libera automaticamente aqui — não é preciso fazer nada.',
    steps: ['Pix enviado ao Mercado Pago', 'Confirmando o pagamento', 'Liberando o Premium'],
    pollIntervalMs: 4000,
    longWaitAttempts: 15,
    longWaitMessage:
      'Pix costuma aprovar em segundos, mas alguns bancos levam alguns minutos a mais em horários de pico. Pode deixar esta janela aberta — vamos continuar verificando automaticamente.',
    showTimer: true
  },
  card: {
    icon: CreditCard,
    waitingTitle: 'Confirmando com a operadora do cartão',
    waitingSubtitle:
      'Isso costuma ser instantâneo. Assim que a operadora aprovar, o Premium libera automaticamente aqui.',
    steps: ['Cartão enviado à operadora', 'Análise antifraude e aprovação', 'Liberando o Premium'],
    pollIntervalMs: 3000,
    longWaitAttempts: 10,
    longWaitMessage:
      'Alguns cartões passam por uma análise antifraude adicional e podem levar alguns minutos. Pode deixar esta janela aberta que avisamos assim que aprovar.',
    showTimer: true
  },
  boleto: {
    icon: FileText,
    waitingTitle: 'Boleto gerado — aguardando compensação',
    waitingSubtitle:
      'Assim que o banco confirmar o pagamento (normalmente em até 2 dias úteis), o Premium libera automaticamente e avisamos por e-mail. Você não precisa ficar nesta tela.',
    steps: ['Boleto gerado', 'Aguardando compensação bancária', 'Liberando o Premium'],
    pollIntervalMs: 20000,
    longWaitAttempts: 1,
    longWaitMessage:
      'Boletos levam até 2 dias úteis para compensar após o pagamento. Você pode fechar esta janela com tranquilidade — avisamos por e-mail assim que aprovar.',
    showTimer: false
  },
  other: {
    icon: Wallet,
    waitingTitle: 'Aguardando confirmação do pagamento',
    waitingSubtitle:
      'Recebemos sua solicitação no Mercado Pago. Assim que o pagamento for aprovado, o Premium libera automaticamente aqui.',
    steps: ['Pagamento enviado ao Mercado Pago', 'Confirmando o pagamento', 'Liberando o Premium'],
    pollIntervalMs: 4000,
    longWaitAttempts: 15,
    longWaitMessage:
      'Está levando um pouco mais que o normal. Pode deixar esta janela aberta — vamos continuar verificando automaticamente.',
    showTimer: true
  }
};

export function PaymentStatusModal({ payment, onResolved, onClose }: PaymentStatusModalProps) {
  const isFailureEntry = payment.status === 'failure';

  const [phase, setPhase] = useState<Phase>(isFailureEntry ? 'error' : 'checking');
  const [methodKind, setMethodKind] = useState<MethodKind>('unknown');
  const [boletoUrl, setBoletoUrl] = useState<string | undefined>(undefined);
  const [errorText, setErrorText] = useState<string>(
    isFailureEntry
      ? 'O pagamento não foi concluído no Mercado Pago. Nenhum valor foi cobrado — você pode tentar novamente quando quiser.'
      : ''
  );
  const [attempt, setAttempt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [closing, setClosing] = useState(false);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const attemptRef = useRef(0);

  const config = METHOD_CONFIG[methodKind];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const stopTimers = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
  }, []);

  const checkOnce = useCallback(async (): Promise<'approved' | 'rejected' | 'pending'> => {
    const qs = new URLSearchParams({ email: payment.email });
    if (payment.paymentId) qs.set('payment_id', payment.paymentId);
    if (payment.merchantOrderId) qs.set('merchant_order_id', payment.merchantOrderId);

    const response = await fetch(`/api/billing/confirm?${qs.toString()}`, { credentials: 'include' });
    const data = (await response.json()) as PaymentConfirmResult;
    if (!response.ok) throw new Error(data.error || 'Não foi possível confirmar o pagamento.');

    const kind = resolveMethodKind(data.paymentType, data.paymentMethod);
    if (mountedRef.current) {
      setMethodKind((prev) => (kind !== 'unknown' ? kind : prev));
      if (data.boletoUrl) setBoletoUrl(data.boletoUrl);
    }

    if (data.approved) {
      if (mountedRef.current) setExpiresAt(data.expiresAt);
      return 'approved';
    }

    const status = (data.status || payment.mpStatus || '').toLowerCase();
    if (REJECTED_STATUSES.has(status)) return 'rejected';
    return 'pending';
  }, [payment.email, payment.merchantOrderId, payment.mpStatus, payment.paymentId]);

  const runPollLoop = useCallback(
    (isFirst: boolean, intervalMs: number) => {
      void (async () => {
        if (!mountedRef.current) return;
        setPhase((prev) => (prev === 'success' || prev === 'error' ? prev : 'checking'));

        try {
          const result = await checkOnce();
          if (!mountedRef.current) return;

          if (result === 'approved') {
            setPhase('success');
            stopTimers();
            return;
          }

          if (result === 'rejected') {
            setErrorText(
              'O Mercado Pago não aprovou este pagamento. Nenhuma cobrança de Premium foi feita — tente novamente.'
            );
            setPhase('error');
            stopTimers();
            return;
          }

          if (!isFirst) {
            attemptRef.current += 1;
            setAttempt(attemptRef.current);
          }
          setPhase('waiting');
          pollTimer.current = setTimeout(() => runPollLoop(false, intervalMs), intervalMs);
        } catch (error) {
          if (!mountedRef.current) return;
          setErrorText(error instanceof Error ? error.message : 'Falha ao confirmar pagamento.');
          setPhase('error');
          stopTimers();
        }
      })();
    },
    [checkOnce, stopTimers]
  );

  useEffect(() => {
    mountedRef.current = true;
    if (isFailureEntry) return undefined;

    tickTimer.current = setInterval(() => setElapsed((value) => value + 1), 1000);
    runPollLoop(true, METHOD_CONFIG.unknown.pollIntervalMs);

    return () => {
      mountedRef.current = false;
      stopTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Uma vez identificada a forma de pagamento, o próximo ciclo de verificação usa o
  // intervalo adequado a ela (ex.: boleto verifica bem mais devagar que Pix/cartão).
  useEffect(() => {
    if (methodKind === 'unknown' || phase !== 'waiting') return;
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = setTimeout(() => runPollLoop(false, config.pollIntervalMs), config.pollIntervalMs);
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methodKind]);

  useEffect(() => {
    if (phase !== 'success') return;
    const timer = setTimeout(() => handleFinish(true), 2400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handleFinish(approved: boolean) {
    setClosing(true);
    setTimeout(() => {
      onResolved({
        approved,
        message: approved
          ? 'Pagamento aprovado! Premium liberado por 30 dias com uso ilimitado.'
          : errorText || 'Pagamento não concluído. Você pode tentar de novo.',
        expiresAt
      });
    }, 180);
  }

  function handleManualCheck() {
    stopTimers();
    attemptRef.current = 0;
    setAttempt(0);
    setElapsed(0);
    tickTimer.current = setInterval(() => setElapsed((value) => value + 1), 1000);
    runPollLoop(true, config.pollIntervalMs);
  }

  const isLongWait = attempt >= config.longWaitAttempts && phase === 'waiting';
  const stepDoneIndex = phase === 'success' ? 3 : phase === 'checking' && attempt === 0 ? 1 : phase === 'error' ? 0 : 2;
  const Icon = config.icon;

  const title = phase === 'success' ? 'Pagamento aprovado!' : phase === 'error' ? 'Pagamento não concluído' : config.waitingTitle;

  const subtitle = phase === 'success'
    ? `Premium liberado com uso ilimitado${expiresAt ? ` até ${formatDate(expiresAt)}` : ' por 30 dias'}.`
    : phase === 'error'
      ? errorText
      : config.waitingSubtitle;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-200',
        closing ? 'opacity-0' : 'opacity-100'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-status-title"
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />

      <div
        className={cn(
          'relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-white/10',
          'bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-[0_40px_120px_rgba(2,8,23,0.6)]',
          phase === 'error' ? 'rj-pix-shake' : ''
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 45% at 25% 0%, rgba(56,189,248,0.32), transparent 55%), radial-gradient(ellipse 60% 35% at 90% 100%, rgba(52,211,153,0.16), transparent 50%)'
          }}
        />
        <div className="pointer-events-none absolute inset-0 rj-hud-grid opacity-40" />

        <div className="relative px-6 py-9 sm:px-9 sm:py-10">
          <div className="flex items-center justify-between">
            <Logo variant="hero" />
            {phase !== 'success' && phase !== 'error' && config.showTimer ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-200">
                <Clock className="h-3 w-3" />
                {elapsed}s
              </span>
            ) : null}
          </div>

          <div className="mt-9 flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              {phase === 'success' ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
                  <span className="rj-pix-check-pop grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_40px_rgba(16,185,129,0.45)]">
                    <CheckCircle2 className="h-11 w-11 text-white" strokeWidth={2.2} />
                  </span>
                  {['0%', '20%', '40%', '60%', '80%'].map((left, i) => (
                    <span
                      key={left}
                      className="rj-pix-confetti absolute top-1/2 h-2 w-2 rounded-sm"
                      style={{
                        left,
                        backgroundColor: ['#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa'][i],
                        animationDelay: `${i * 90}ms`
                      }}
                    />
                  ))}
                </>
              ) : phase === 'error' ? (
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-[0_10px_40px_rgba(244,63,94,0.4)]">
                  <XCircle className="h-11 w-11 text-white" strokeWidth={2.2} />
                </span>
              ) : (
                <>
                  <span className="rj-pix-ring absolute inset-0 rounded-full border-2 border-sky-300/60" />
                  <span className="rj-pix-ring rj-pix-ring-delay absolute inset-0 rounded-full border-2 border-sky-300/60" />
                  <span className="rj-pix-ring rj-pix-ring-delay-2 absolute inset-0 rounded-full border-2 border-sky-300/60" />
                  <span className="rj-pix-core-pulse grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-[0_10px_40px_rgba(56,189,248,0.4)]">
                    <Icon className="h-10 w-10 text-white" strokeWidth={2} />
                  </span>
                </>
              )}
            </div>

            <h2 id="payment-status-title" className="rj-display mt-7 text-2xl font-extrabold tracking-tight sm:text-[26px]">
              {title}
            </h2>

            <p className="mt-2.5 max-w-sm text-sm leading-6 text-slate-300">{subtitle}</p>

            {phase !== 'error' ? (
              <ul className="mt-8 w-full space-y-3 text-left">
                {config.steps.map((label, index) => {
                  const done = index < stepDoneIndex || phase === 'success';
                  const active = !done && index === stepDoneIndex;
                  return (
                    <li
                      key={label}
                      className="rj-pix-step-in flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5"
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      <span
                        className={cn(
                          'grid h-6 w-6 shrink-0 place-items-center rounded-full',
                          done
                            ? 'bg-emerald-400/90 text-emerald-950'
                            : active
                              ? 'bg-sky-400/20 text-sky-300'
                              : 'bg-white/10 text-slate-500'
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : active ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={3} />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          done ? 'text-white' : active ? 'text-sky-100' : 'text-slate-500'
                        )}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {isLongWait ? (
              <div className="mt-6 w-full rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-left text-xs leading-5 text-amber-100">
                {config.longWaitMessage}
              </div>
            ) : null}

            <div className="mt-8 flex w-full flex-col gap-2.5">
              {phase === 'success' ? (
                <Button className="h-12 w-full bg-white text-slate-950 hover:bg-sky-50" onClick={() => handleFinish(true)}>
                  Continuar
                </Button>
              ) : phase === 'error' ? (
                <>
                  <Button className="h-12 w-full bg-white text-slate-950 hover:bg-sky-50" onClick={() => handleFinish(false)}>
                    Tentar novamente
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      setClosing(true);
                      setTimeout(onClose, 180);
                    }}
                  >
                    Fechar
                  </Button>
                </>
              ) : (
                <>
                  {methodKind === 'boleto' && boletoUrl ? (
                    <Button asChild className="h-12 w-full bg-white text-slate-950 hover:bg-sky-50">
                      <a href={boletoUrl} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                        Baixar boleto novamente
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    className="h-11 w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={handleManualCheck}
                    disabled={phase === 'checking'}
                  >
                    <Loader2 className={cn('h-4 w-4', phase === 'checking' ? 'animate-spin' : 'hidden')} />
                    Verificar agora
                  </Button>
                  {methodKind === 'boleto' ? (
                    <Button
                      variant="ghost"
                      className="h-11 w-full text-white hover:bg-white/10 hover:text-white"
                      onClick={() => {
                        setClosing(true);
                        setTimeout(onClose, 180);
                      }}
                    >
                      Fechar e continuar depois
                    </Button>
                  ) : null}
                </>
              )}
            </div>

            <p className="mt-6 flex items-center gap-2 text-[11px] leading-5 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              Pagamento processado com segurança pelo Mercado Pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
