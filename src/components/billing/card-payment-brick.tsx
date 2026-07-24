'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { PLANS } from '@/lib/plans';

interface CardFormData {
  token: string;
  payment_method_id: string;
  issuer_id?: string | number;
  installments: number;
  payer: {
    email: string;
    identification?: { type?: string; number?: string };
  };
}

interface CardPaymentResult {
  paymentId: string;
  status: string;
  statusDetail?: string;
}

interface CardPaymentBrickProps {
  payerEmail: string;
  onPaymentCreated: (result: CardPaymentResult) => void;
  onError?: (message: string) => void;
}

let sdkLoadPromise: Promise<void> | null = null;

function loadMercadoPagoSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as unknown as { MercadoPago?: unknown }).MercadoPago) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Não foi possível carregar o Mercado Pago.'));
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

/**
 * Formulário de cartão embutido (Card Payment Brick) — coleta nome do titular,
 * número, validade, CVV e CPF em um único formulário no nosso próprio visual,
 * sem redirecionar para o Checkout Pro. Usado apenas no fluxo "cartão"; Pix e
 * boleto continuam pela preferência de checkout (Checkout Pro).
 */
export function CardPaymentBrick({ payerEmail, onPaymentCreated, onError }: CardPaymentBrickProps) {
  const containerId = useId().replace(/[:]/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const brickControllerRef = useRef<{ unmount: () => void } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey) {
      setStatus('error');
      setErrorMessage('Pagamento por cartão indisponível no momento. Use Pix ou boleto.');
      return undefined;
    }

    async function bootstrap() {
      try {
        await loadMercadoPagoSdk();
        if (cancelled || !publicKey) return;

        const MercadoPagoCtor = (window as unknown as { MercadoPago: new (key: string, opts?: object) => {
          bricks: () => {
            create: (
              type: string,
              containerId: string,
              settings: Record<string, unknown>
            ) => Promise<{ unmount: () => void }>;
          };
        } }).MercadoPago;

        const mp = new MercadoPagoCtor(publicKey, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        const controller = await bricksBuilder.create('cardPayment', containerId, {
          initialization: {
            amount: PLANS.premium.price,
            payer: { email: payerEmail }
          },
          customization: {
            visual: {
              style: { theme: 'default' },
              hideFormTitle: true
            },
            paymentMethods: {
              maxInstallments: 1
            }
          },
          callbacks: {
            onReady: () => {
              if (!cancelled) setStatus('ready');
            },
            onSubmit: (cardFormData: CardFormData) =>
              new Promise<void>((resolve, reject) => {
                setStatus('submitting');
                setErrorMessage('');
                fetch('/api/billing/pay-card', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    token: cardFormData.token,
                    payment_method_id: cardFormData.payment_method_id,
                    issuer_id: cardFormData.issuer_id,
                    installments: cardFormData.installments || 1,
                    payer: {
                      email: cardFormData.payer?.email || payerEmail,
                      identification: cardFormData.payer?.identification
                    }
                  })
                })
                  .then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Falha ao processar o pagamento.');
                    onPaymentCreated({
                      paymentId: data.paymentId,
                      status: data.status,
                      statusDetail: data.statusDetail
                    });
                    resolve();
                  })
                  .catch((error) => {
                    const message = error instanceof Error ? error.message : 'Falha ao processar o pagamento.';
                    setStatus('ready');
                    setErrorMessage(message);
                    onError?.(message);
                    reject(error);
                  });
              }),
            onError: (error: unknown) => {
              console.error('[card-brick]', error);
              if (!cancelled) {
                setStatus('ready');
                setErrorMessage('Verifique os dados do cartão e tente novamente.');
              }
            }
          }
        });

        if (cancelled) {
          controller.unmount();
          return;
        }
        brickControllerRef.current = controller;
        // O Brick já está montado neste ponto (a Promise de create() resolve após a
        // renderização); não depender apenas do callback onReady, que em alguns
        // cenários não dispara, deixando o spinner preso indefinidamente.
        setStatus('ready');
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(
            error instanceof Error ? error.message : 'Não foi possível carregar o formulário de cartão.'
          );
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
      brickControllerRef.current?.unmount();
      brickControllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, payerEmail]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      {status === 'loading' ? (
        <div className="flex items-center gap-2 py-6 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando formulário seguro do Mercado Pago…
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      {errorMessage && status !== 'error' ? (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <div id={containerId} ref={containerRef} className={status === 'error' ? 'hidden' : ''} />

      {status === 'submitting' ? (
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-sky-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Enviando à operadora do cartão…
        </div>
      ) : null}

      <p className="mt-3 flex items-center gap-2 text-[11px] leading-5 text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        Dados do cartão criptografados e processados diretamente pelo Mercado Pago.
      </p>
    </div>
  );
}
