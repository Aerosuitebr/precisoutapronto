'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { ViralInviteShareRow } from '@/components/marketing/viral-recruit-cta';
import { emitClientProductEvent } from '@/lib/events/client-emitter';
import { formatCurrency } from '@/lib/formatters';
import { orcamentoPixBrCode } from '@/lib/orcamentos/public-map';
import type { OrcamentoPublic } from '@/lib/orcamentos/types';

export function OrcamentoPublicPixPay({ orcamento }: { orcamento: OrcamentoPublic }) {
  const [copied, setCopied] = useState(false);
  const pixCode = useMemo(
    () =>
      orcamentoPixBrCode({
        pixKey: orcamento.pixKey,
        pixKeyType: orcamento.pixKeyType,
        pixMerchantName: orcamento.pixMerchantName,
        pixMerchantCity: orcamento.pixMerchantCity,
        total: orcamento.total,
        profissionalNome: orcamento.profissionalNome,
        id: orcamento.id
      }),
    [orcamento]
  );

  if (orcamento.status !== 'approved') return null;
  if (!pixCode) return null;

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      emitClientProductEvent({
        eventName: 'growth.recipient_action',
        toolKey: 'orcamentos',
        properties: { action: 'pix_copied', surface: 'public_quote' }
      });
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mt-4 rounded-[28px] border border-emerald-200 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
        <QrCode className="h-4 w-4 text-emerald-700" />
        Pagar via Pix
      </p>
      <p className="mt-1.5 text-sm leading-6 text-slate-600">
        {formatCurrency(orcamento.total)} para {orcamento.pixMerchantName || orcamento.profissionalNome}.
        Abra o app do banco, escaneie o QR ou cole o código.
      </p>
      <div className="mt-4 flex justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <QRCodeSVG value={pixCode} size={180} level="M" />
      </div>
      <Button type="button" className="mt-4 h-12 w-full bg-emerald-600 hover:bg-emerald-500" onClick={copyPix}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Código Pix copiado' : 'Copiar código Pix'}
      </Button>
      {copied ? <ViralInviteShareRow className="mt-4" toolKey="orcamentos-pix" /> : null}
    </section>
  );
}
