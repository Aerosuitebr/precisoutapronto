'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, CreditCard, Loader2, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatCpf, isValidCpf, onlyDigits } from '@/lib/cpf';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 12 * 60 * 1000;

const ZOOP_TOKEN_ENDPOINT = 'https://api.zoop.ws';

type Mode = 'choose' | 'pix' | 'card';

interface ZoopCheckoutProps {
  onApproved: (expiresAt?: string) => void;
}

/** Tokeniza o cartão direto na Zoop (PCI fora do nosso backend). */
async function tokenizeCard(input: {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvc: string;
}) {
  const marketplaceId = (process.env.NEXT_PUBLIC_ZOOP_MARKETPLACE_ID || '').trim();
  const publishableKey = (process.env.NEXT_PUBLIC_ZOOP_PUBLISHABLE_KEY || '').trim();
  if (!marketplaceId || !publishableKey) {
    throw new Error('Tokenização Zoop indisponível: configure as chaves públicas.');
  }

  const response = await fetch(
    `${ZOOP_TOKEN_ENDPOINT}/v1/marketplaces/${marketplaceId}/cards/tokens`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${publishableKey}:`)}`
      },
      body: JSON.stringify({
        holder_name: input.holder,
        card_number: onlyDigits(input.number),
        expiration_month: input.month,
        expiration_year: input.year,
        security_code: input.cvc
      })
    }
  );

  const data = (await response.json().catch(() => ({}))) as {
    id?: string;
    error?: { message?: string };
  };
  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || 'Não foi possível validar o cartão.');
  }
  return data.id;
}

export function ZoopCheckout({ onApproved }: ZoopCheckoutProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('choose');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Pix
  const [qrEmv, setQrEmv] = useState('');
  const [awaiting, setAwaiting] = useState(false);

  // Cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardMonth, setCardMonth] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cpf, setCpf] = useState('');

  const pollRef = useRef<{ cancelled: boolean; timer?: number }>({ cancelled: false });

  useEffect(() => {
    const poll = pollRef.current;
    return () => {
      poll.cancelled = true;
      if (poll.timer) window.clearTimeout(poll.timer);
    };
  }, []);

  const startPolling = useCallback(
    (transactionId: string) => {
      const poll = pollRef.current;
      poll.cancelled = false;
      setAwaiting(true);
      const startedAt = Date.now();

      const tick = async () => {
        if (poll.cancelled) return;
        try {
          const res = await fetch(
            `/api/billing/confirm-zoop?transactionId=${encodeURIComponent(transactionId)}`,
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
            onApproved(data.expiresAt);
            return;
          }
          if (data.failed) {
            poll.cancelled = true;
            setAwaiting(false);
            setError('Pagamento recusado ou cancelado. Tente novamente.');
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

  async function startPix() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout-zoop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method: 'pix' })
      });
      const data = (await res.json().catch(() => ({}))) as {
        transactionId?: string;
        qrCodeEmv?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Não foi possível gerar o Pix.');
      if (!data.qrCodeEmv || !data.transactionId) throw new Error('Pix sem código de pagamento.');
      setMode('pix');
      setQrEmv(data.qrCodeEmv);
      startPolling(data.transactionId);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Falha ao gerar o Pix.';
      setError(text);
      toast(text, { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function payCard() {
    setError(null);
    if (onlyDigits(cardNumber).length < 13) return setError('Número do cartão inválido.');
    if (!cardHolder.trim()) return setError('Informe o nome impresso no cartão.');
    if (cardMonth.length !== 2 || cardYear.length !== 4) return setError('Validade inválida (MM/AAAA).');
    if (cardCvc.length < 3) return setError('CVC inválido.');
    if (cpf && !isValidCpf(cpf)) return setError('CPF inválido.');

    setBusy(true);
    try {
      const token = await tokenizeCard({
        number: cardNumber,
        holder: cardHolder,
        month: cardMonth,
        year: cardYear,
        cvc: cardCvc
      });
      const res = await fetch('/api/billing/checkout-zoop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method: 'card', cardToken: token, cpf: onlyDigits(cpf) })
      });
      const data = (await res.json().catch(() => ({}))) as {
        transactionId?: string;
        status?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Pagamento recusado.');
      if (!data.transactionId) throw new Error('Transação sem identificador.');
      startPolling(data.transactionId);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Falha ao processar o cartão.';
      setError(text);
      toast(text, { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(qrEmv);
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
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => void startPix()}
            disabled={busy}
            className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] text-white transition hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <QrCode className="h-6 w-6 text-sky-300" />}
            <span className="text-sm font-semibold">Pagar com Pix</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('card')}
            disabled={busy}
            className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] text-white transition hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:opacity-60"
          >
            <CreditCard className="h-6 w-6 text-sky-300" />
            <span className="text-sm font-semibold">Cartão de crédito</span>
          </button>
        </div>
      ) : null}

      {mode === 'pix' ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-center">
          <div className="mx-auto w-fit rounded-2xl bg-white p-3">
            <QRCodeSVG value={qrEmv} size={200} level="M" includeMargin />
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

      {mode === 'card' ? (
        <div className="space-y-3">
          <Input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
            placeholder="Número do cartão"
            inputMode="numeric"
            autoComplete="cc-number"
            className={inputDark}
            disabled={busy || awaiting}
          />
          <Input
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            placeholder="Nome impresso no cartão"
            autoComplete="cc-name"
            className={inputDark}
            disabled={busy || awaiting}
          />
          <div className="grid grid-cols-3 gap-2.5">
            <Input
              value={cardMonth}
              onChange={(e) => setCardMonth(onlyDigits(e.target.value).slice(0, 2))}
              placeholder="MM"
              inputMode="numeric"
              autoComplete="cc-exp-month"
              className={inputDark}
              disabled={busy || awaiting}
            />
            <Input
              value={cardYear}
              onChange={(e) => setCardYear(onlyDigits(e.target.value).slice(0, 4))}
              placeholder="AAAA"
              inputMode="numeric"
              autoComplete="cc-exp-year"
              className={inputDark}
              disabled={busy || awaiting}
            />
            <Input
              value={cardCvc}
              onChange={(e) => setCardCvc(onlyDigits(e.target.value).slice(0, 4))}
              placeholder="CVC"
              inputMode="numeric"
              autoComplete="cc-csc"
              className={inputDark}
              disabled={busy || awaiting}
            />
          </div>
          <Input
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="CPF do titular (opcional)"
            inputMode="numeric"
            className={inputDark}
            disabled={busy || awaiting}
          />
          <button
            type="button"
            onClick={() => void payCard()}
            disabled={busy || awaiting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-50 disabled:opacity-60"
          >
            {busy || awaiting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {awaiting ? 'Confirmando…' : 'Processando…'}
              </>
            ) : (
              'Pagar no cartão'
            )}
          </button>
          <p className="text-[11px] leading-4 text-slate-500">
            Os dados do cartão são enviados criptografados direto para a Zoop. O Precisou, Tá Pronto não
            armazena o número do cartão.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {mode !== 'choose' && !awaiting ? (
        <button
          type="button"
          onClick={() => {
            setMode('choose');
            setError(null);
            setQrEmv('');
          }}
          className="text-xs font-medium text-slate-400 underline-offset-4 hover:text-white hover:underline"
        >
          Escolher outra forma de pagamento
        </button>
      ) : null}
    </div>
  );
}
