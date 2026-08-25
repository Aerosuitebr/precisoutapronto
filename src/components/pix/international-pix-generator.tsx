'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Check, Copy, MessageCircle, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { InternationalLocale } from '@/lib/i18n';
import { buildPixBrCode } from '@/lib/pix/brcode';
import type { PixKeyType } from '@/lib/pix/types';

const copy = {
  en: {
    title: 'Pix QR code generator',
    subtitle: 'Create a Pix copy-and-paste code, QR code and payment message in seconds.',
    back: 'Back to tools',
    notice: 'Pix is Brazil’s instant payment system. The payer needs access to a financial institution that supports Pix.',
    privacy: 'Your Pix key and payment details stay in this browser and are not saved by Precisou, Tá Pronto.',
    details: 'Payment details',
    keyType: 'Pix key type',
    key: 'Pix key',
    merchant: 'Receiver name',
    city: 'Receiver city',
    amount: 'Amount (BRL, optional)',
    description: 'Payment description (optional)',
    txid: 'Transaction ID (optional)',
    keyTypes: { cpf: 'CPF', cnpj: 'CNPJ', email: 'Email', phone: 'Phone', random: 'Random key' },
    example: 'Load example',
    result: 'Pix ready to pay',
    resultHelp: 'Scan the QR code in a banking app or copy the payment code.',
    empty: 'Complete the Pix key, receiver name and city to generate the payment.',
    copyCode: 'Copy Pix code',
    copied: 'Copied',
    copyMessage: 'Copy payment message',
    whatsapp: 'Send on WhatsApp',
    invalid: 'Check the Pix data. We couldn’t generate a valid payment code.',
    messageHello: 'Hello! Here are the Pix payment details for',
    messageAmount: 'Amount',
    messageReference: 'Reference',
    messageCode: 'Pix copy-and-paste code'
  },
  es: {
    title: 'Generador de código QR Pix',
    subtitle: 'Crea un código Pix para copiar y pegar, un QR y un mensaje de cobro en segundos.',
    back: 'Volver a herramientas',
    notice: 'Pix es el sistema de pagos instantáneos de Brasil. El pagador necesita acceso a una institución financiera compatible con Pix.',
    privacy: 'Tu clave Pix y los datos del cobro permanecen en este navegador y Precisou, Tá Pronto no los guarda.',
    details: 'Datos del cobro',
    keyType: 'Tipo de clave Pix',
    key: 'Clave Pix',
    merchant: 'Nombre del receptor',
    city: 'Ciudad del receptor',
    amount: 'Valor (BRL, opcional)',
    description: 'Concepto del cobro (opcional)',
    txid: 'ID de transacción (opcional)',
    keyTypes: { cpf: 'CPF', cnpj: 'CNPJ', email: 'Correo', phone: 'Teléfono', random: 'Clave aleatoria' },
    example: 'Cargar ejemplo',
    result: 'Pix listo para pagar',
    resultHelp: 'Escanea el QR desde una aplicación bancaria o copia el código de pago.',
    empty: 'Completa la clave Pix, el nombre y la ciudad del receptor para generar el cobro.',
    copyCode: 'Copiar código Pix',
    copied: 'Copiado',
    copyMessage: 'Copiar mensaje de cobro',
    whatsapp: 'Enviar por WhatsApp',
    invalid: 'Revisa los datos Pix. No pudimos generar un código de pago válido.',
    messageHello: '¡Hola! Estos son los datos del cobro Pix para',
    messageAmount: 'Valor',
    messageReference: 'Concepto',
    messageCode: 'Código Pix para copiar y pegar'
  }
} as const;

function formatBRL(value: number, locale: InternationalLocale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function InternationalPixGenerator({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const [keyType, setKeyType] = useState<PixKeyType>('email');
  const [key, setKey] = useState('');
  const [merchant, setMerchant] = useState('');
  const [city, setCity] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [txid, setTxid] = useState('');
  const [copied, setCopied] = useState<'code' | 'message' | null>(null);

  const code = useMemo(() => {
    if (!key.trim() || !merchant.trim() || !city.trim()) return '';
    try {
      return buildPixBrCode({
        key,
        keyType,
        merchantName: merchant,
        merchantCity: city,
        amount: amount > 0 ? amount : undefined,
        description,
        txid: txid || '***'
      });
    } catch {
      return '';
    }
  }, [amount, city, description, key, keyType, merchant, txid]);

  const message = useMemo(() => {
    if (!code) return '';
    return [
      `${t.messageHello} ${merchant}.`,
      amount > 0 ? `${t.messageAmount}: ${formatBRL(amount, locale)}` : null,
      description ? `${t.messageReference}: ${description}` : null,
      '',
      `${t.messageCode}:`,
      code
    ].filter((line) => line !== null).join('\n');
  }, [amount, code, description, locale, merchant, t]);

  function loadExample() {
    setKeyType('email');
    setKey('payments@example.com');
    setMerchant('Ana Lima Design');
    setCity('Sao Paulo');
    setAmount(150);
    setDescription(locale === 'en' ? 'Design services' : 'Servicios de diseño');
    setTxid('');
  }

  async function copyToClipboard(value: string, kind: 'code' | 'message') {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link><LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/ferramentas/pix', en: '/en/tools/pix', es: '/es/tools/pix' }} /></div></header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="precisoutapronto-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div><Button variant="outline" icon={Sparkles} onClick={loadExample}>{t.example}</Button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">{t.notice}</p><p className="flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{t.privacy}</p></div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-extrabold">{t.details}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.keyType}>
                <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={keyType} onChange={(event) => setKeyType(event.target.value as PixKeyType)}>
                  {(Object.keys(t.keyTypes) as PixKeyType[]).map((type) => <option key={type} value={type}>{t.keyTypes[type]}</option>)}
                </select>
              </Field>
              <Field label={t.key}><Input value={key} onChange={(event) => setKey(event.target.value)} /></Field>
              <Field label={t.merchant}><Input value={merchant} maxLength={25} onChange={(event) => setMerchant(event.target.value)} /></Field>
              <Field label={t.city}><Input value={city} maxLength={15} onChange={(event) => setCity(event.target.value)} /></Field>
              <Field label={t.amount}><Input type="number" min="0" step="0.01" value={amount || ''} onChange={(event) => setAmount(Number(event.target.value))} /></Field>
              <Field label={t.txid}><Input value={txid} maxLength={25} onChange={(event) => setTxid(event.target.value)} /></Field>
              <Field label={t.description} className="sm:col-span-2"><Textarea rows={3} value={description} maxLength={72} onChange={(event) => setDescription(event.target.value)} /></Field>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><QrCode className="h-5 w-5" /></span><h2 className="text-xl font-extrabold">{t.result}</h2></div>
            {code ? (
              <>
                <div className="mx-auto mt-6 w-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><QRCodeSVG value={code} size={220} level="M" includeMargin /></div>
                {amount > 0 ? <p className="mt-5 text-center text-3xl font-extrabold text-emerald-700">{formatBRL(amount, locale)}</p> : null}
                <p className="mt-2 text-center text-sm leading-6 text-slate-600">{t.resultHelp}</p>
                <Textarea className="mt-5 font-mono text-xs" rows={5} readOnly value={code} />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" icon={copied === 'code' ? Check : Copy} onClick={() => copyToClipboard(code, 'code')}>{copied === 'code' ? t.copied : t.copyCode}</Button>
                  <Button variant="outline" icon={copied === 'message' ? Check : Copy} onClick={() => copyToClipboard(message, 'message')}>{copied === 'message' ? t.copied : t.copyMessage}</Button>
                </div>
                <Button asChild className="mt-3 w-full" variant="success" icon={MessageCircle}><a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">{t.whatsapp}</a></Button>
              </>
            ) : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><QrCode className="mx-auto h-10 w-10 text-slate-400" /><p className="mt-3 text-sm leading-6 text-slate-600">{t.empty}</p></div>}
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}
