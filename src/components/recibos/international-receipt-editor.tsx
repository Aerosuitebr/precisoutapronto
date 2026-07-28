'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, FileText, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import type { InternationalLocale } from '@/lib/i18n';
import { listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';

const copy = {
  en: {
    title: 'Professional receipt',
    subtitle: 'Fill in the payment details and download a clean, ready-to-send PDF.',
    back: 'Back to tools',
    brazilNotice: 'This receipt uses Brazilian reais (BRL) and Brazilian document fields.',
    payment: 'Payment details',
    parties: 'Receipt parties',
    amount: 'Amount (BRL)',
    reference: 'Payment for',
    method: 'Payment method',
    date: 'Payment date',
    city: 'City',
    number: 'Receipt number',
    receiver: 'Receiver',
    payer: 'Payer',
    name: 'Name or business name',
    document: 'CPF/CNPJ (optional)',
    email: 'Email (optional)',
    phone: 'Phone (optional)',
    notes: 'Notes (optional)',
    preview: 'Live preview',
    receipt: 'Payment receipt',
    receivedFrom: 'I received from',
    theAmount: 'the amount of',
    for: 'for',
    paymentMethod: 'Payment method',
    declaration:
      'For clarity, I sign this receipt and acknowledge full payment of the amount stated above.',
    signature: 'Receiver signature',
    download: 'Download PDF',
    downloading: 'Generating PDF...',
    required: 'Enter a valid amount, payment description, receiver and payer.',
    loginRequired: 'Sign in and confirm your email to download the PDF.',
    signIn: 'Sign in',
    exportError: 'We couldn’t generate the PDF. Please try again.',
    sample: 'Load example',
    sampleReference: 'Brand identity and graphic design services',
    sampleNotes: 'Payment in full for the services described above.',
    paidBy: 'Pix',
    wordsCurrency: ['real', 'reais', 'cent', 'cents']
  },
  es: {
    title: 'Recibo profesional',
    subtitle: 'Completa los datos del pago y descarga un PDF limpio y listo para enviar.',
    back: 'Volver a herramientas',
    brazilNotice: 'Este recibo utiliza reales brasileños (BRL) y campos de identificación de Brasil.',
    payment: 'Datos del pago',
    parties: 'Partes del recibo',
    amount: 'Valor (BRL)',
    reference: 'Concepto del pago',
    method: 'Forma de pago',
    date: 'Fecha del pago',
    city: 'Ciudad',
    number: 'Número del recibo',
    receiver: 'Receptor',
    payer: 'Pagador',
    name: 'Nombre o razón social',
    document: 'CPF/CNPJ (opcional)',
    email: 'Correo (opcional)',
    phone: 'Teléfono (opcional)',
    notes: 'Observaciones (opcional)',
    preview: 'Vista previa',
    receipt: 'Recibo de pago',
    receivedFrom: 'Recibí de',
    theAmount: 'la cantidad de',
    for: 'por concepto de',
    paymentMethod: 'Forma de pago',
    declaration:
      'Para mayor claridad, firmo este recibo y declaro totalmente pagado el valor indicado.',
    signature: 'Firma del receptor',
    download: 'Descargar PDF',
    downloading: 'Generando PDF...',
    required: 'Ingresa un valor válido, el concepto del pago, el receptor y el pagador.',
    loginRequired: 'Ingresa y confirma tu correo para descargar el PDF.',
    signIn: 'Ingresar',
    exportError: 'No pudimos generar el PDF. Inténtalo de nuevo.',
    sample: 'Cargar ejemplo',
    sampleReference: 'Servicios de identidad visual y diseño gráfico',
    sampleNotes: 'Pago total por los servicios descritos anteriormente.',
    paidBy: 'Pix',
    wordsCurrency: ['real', 'reales', 'centavo', 'centavos']
  }
} as const;

const paymentMethods = {
  en: ['Pix', 'Cash', 'Bank transfer', 'Credit card', 'Debit card'],
  es: ['Pix', 'Efectivo', 'Transferencia bancaria', 'Tarjeta de crédito', 'Tarjeta de débito']
} as const;

const units = {
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
  es: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
};

function numberToWords(value: number, locale: InternationalLocale): string {
  const u = units[locale];
  if (value < 20) return u[value];
  if (locale === 'en') {
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (value < 100) return `${tens[Math.floor(value / 10)]}${value % 10 ? `-${u[value % 10]}` : ''}`;
    if (value < 1000) return `${u[Math.floor(value / 100)]} hundred${value % 100 ? ` and ${numberToWords(value % 100, locale)}` : ''}`;
    if (value < 1_000_000) return `${numberToWords(Math.floor(value / 1000), locale)} thousand${value % 1000 ? ` ${numberToWords(value % 1000, locale)}` : ''}`;
    return `${numberToWords(Math.floor(value / 1_000_000), locale)} million${value % 1_000_000 ? ` ${numberToWords(value % 1_000_000, locale)}` : ''}`;
  }
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  if (value < 30) return value === 20 ? 'veinte' : `veinti${u[value - 20]}`;
  if (value < 100) return `${tens[Math.floor(value / 10)]}${value % 10 ? ` y ${u[value % 10]}` : ''}`;
  if (value === 100) return 'cien';
  if (value < 1000) return `${hundreds[Math.floor(value / 100)]}${value % 100 ? ` ${numberToWords(value % 100, locale)}` : ''}`;
  if (value < 1_000_000) {
    const thousands = Math.floor(value / 1000);
    return `${thousands === 1 ? 'mil' : `${numberToWords(thousands, locale)} mil`}${value % 1000 ? ` ${numberToWords(value % 1000, locale)}` : ''}`;
  }
  const millions = Math.floor(value / 1_000_000);
  return `${millions === 1 ? 'un millón' : `${numberToWords(millions, locale)} millones`}${value % 1_000_000 ? ` ${numberToWords(value % 1_000_000, locale)}` : ''}`;
}

function currencyWords(value: number, locale: InternationalLocale) {
  const integer = Math.floor(value);
  const cents = Math.round((value - integer) * 100);
  const labels = copy[locale].wordsCurrency;
  const parts = [`${numberToWords(integer, locale)} ${integer === 1 ? labels[0] : labels[1]}`];
  if (cents) parts.push(`${numberToWords(cents, locale)} ${cents === 1 ? labels[2] : labels[3]}`);
  return parts.join(locale === 'en' ? ' and ' : ' con ');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function InternationalReceiptEditor({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh, session, usage } = useAuth();
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState<string>('Pix');
  const [date, setDate] = useState(today());
  const [city, setCity] = useState('');
  const [number, setNumber] = useState(`${new Date().getFullYear()}-001`);
  const [receiver, setReceiver] = useState({ name: '', document: '', email: '', phone: '' });
  const [payer, setPayer] = useState({ name: '', document: '', email: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const numericAmount = Number(amount);
  const formattedAmount = useMemo(
    () => new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'BRL' }).format(numericAmount || 0),
    [locale, numericAmount]
  );
  const words = numericAmount > 0 ? currencyWords(numericAmount, locale) : '';
  const draftId = `${locale}-draft`;

  useEffect(() => {
    if (!session) return;
    listRemoteDocuments<Record<string, unknown>>('receipt-intl').then((documents) => {
      const saved = documents.find((item) => item.id === draftId);
      if (!saved) return;
      if (typeof saved.amount === 'string') setAmount(saved.amount);
      if (typeof saved.reference === 'string') setReference(saved.reference);
      if (typeof saved.method === 'string') setMethod(saved.method);
      if (typeof saved.date === 'string') setDate(saved.date);
      if (typeof saved.city === 'string') setCity(saved.city);
      if (typeof saved.number === 'string') setNumber(saved.number);
      if (saved.receiver && typeof saved.receiver === 'object') setReceiver(saved.receiver as typeof receiver);
      if (saved.payer && typeof saved.payer === 'object') setPayer(saved.payer as typeof payer);
      if (typeof saved.notes === 'string') setNotes(saved.notes);
    }).catch(() => undefined);
  }, [draftId, session]);

  function loadSample() {
    setAmount('1500');
    setReference(t.sampleReference);
    setMethod('Pix');
    setCity(locale === 'en' ? 'São Paulo' : 'São Paulo');
    setReceiver({ name: 'Ana Lima Design', document: '123.456.789-09', email: 'ana@example.com', phone: '+55 11 99999-1010' });
    setPayer({ name: 'Mercado Central Ltda.', document: '12.345.678/0001-90', email: 'finance@example.com', phone: '+55 11 3333-4444' });
    setNotes(t.sampleNotes);
    setError('');
  }

  async function downloadPdf() {
    if (!previewRef.current || numericAmount <= 0 || !reference.trim() || !receiver.name.trim() || !payer.name.trim()) {
      setError(t.required);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outcome = await performBillableAction(
        { toolId: 'recibos', artifactId: `international-${number}`, action: 'download' },
        async () => {
          await saveRemoteDocument('receipt-intl', {
            id: draftId, locale, amount, reference, method, date, city, number,
            receiver, payer, notes, updatedAt: new Date().toISOString()
          });
          return exportElementToPdf(previewRef.current!, `receipt-${number}.pdf`, { branded: !usage.unlimited });
        }
      );
      if (!outcome.allowed) {
        setError(outcome.reason || t.loginRequired);
        return;
      }
      refresh();
    } catch {
      setError(t.exportError);
    } finally {
      setBusy(false);
    }
  }

  const updateParty = (party: 'receiver' | 'payer', field: string, value: string) => {
    const setter = party === 'receiver' ? setReceiver : setPayer;
    setter((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link>
          <LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/gerador-de-recibo', en: '/en/tools/receipt', es: '/es/tools/receipt' }} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700">
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1>
            <p className="mt-2 text-slate-600">{t.subtitle}</p>
          </div>
          <Button variant="outline" icon={Sparkles} onClick={loadSample}>{t.sample}</Button>
        </div>
        <p className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">{t.brazilNotice}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(500px,1.1fr)]">
          <div className="space-y-5">
            <Section title={t.payment}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.amount}><Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
                <Field label={t.number}><Input value={number} onChange={(e) => setNumber(e.target.value)} /></Field>
                <Field label={t.date}><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
                <Field label={t.city}><Input value={city} onChange={(e) => setCity(e.target.value)} /></Field>
                <Field label={t.method}>
                  <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
                    {paymentMethods[locale].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label={t.reference} className="sm:col-span-2"><Input value={reference} onChange={(e) => setReference(e.target.value)} /></Field>
              </div>
            </Section>

            <Section title={t.parties}>
              {(['receiver', 'payer'] as const).map((party) => {
                const value = party === 'receiver' ? receiver : payer;
                return (
                  <div key={party} className="mb-5 last:mb-0">
                    <h3 className="mb-3 font-bold text-slate-900">{party === 'receiver' ? t.receiver : t.payer}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(['name', 'document', 'email', 'phone'] as const).map((field) => (
                        <Field key={field} label={t[field]} className={field === 'name' ? 'sm:col-span-2' : ''}>
                          <Input type={field === 'email' ? 'email' : 'text'} value={value[field]} onChange={(e) => updateParty(party, field, e.target.value)} />
                        </Field>
                      ))}
                    </div>
                  </div>
                );
              })}
              <Field label={t.notes}><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            </Section>

            {error ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {error} {error.includes('login') || error.includes('correo') ? <Link className="underline" href={`/${locale}/login?next=/${locale}/tools/receipt`}>{t.signIn}</Link> : null}
              </div>
            ) : null}
            <Button className="w-full" variant="success" icon={busy ? undefined : Download} loading={busy} onClick={downloadPdf}>
              {busy ? t.downloading : t.download}
            </Button>
          </div>

          <section>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-600"><FileText className="h-4 w-4" />{t.preview}</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-inner">
              <div ref={previewRef} className="mx-auto w-[210mm] max-w-none bg-white shadow-lg">
                <DocumentExportShell branded={!usage.unlimited}>
                  <div className="flex min-h-[297mm] flex-col p-[16mm] text-slate-800">
                    <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
                      <div className="flex justify-between gap-4">
                        <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">{t.receipt}</p><p className="mt-2 text-3xl font-bold">{formattedAmount}</p></div>
                        <div className="text-right text-sm"><p className="font-semibold">Nº {number || '-'}</p><p className="text-white/75">{date}</p></div>
                      </div>
                    </div>
                    <p className="mt-8 text-[15px] leading-8">
                      {t.receivedFrom} <strong>{payer.name || '________________'}</strong>{payer.document ? ` (${payer.document})` : ''}, {t.theAmount} <strong>{formattedAmount}</strong>{words ? ` (${words})` : ''}, {t.for} <strong>{reference || '________________'}</strong>.
                    </p>
                    <p className="mt-3 text-sm text-slate-600">{t.paymentMethod}: <strong>{method}</strong></p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{t.declaration}</p>
                    {notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{notes}</p> : null}
                    <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                      <PartyCard title={t.receiver} party={receiver} />
                      <PartyCard title={t.payer} party={payer} />
                    </div>
                    <div className="mt-auto pb-8 pt-20 text-center">
                      <div className="mx-auto w-72 border-t border-slate-500 pt-2">
                        <p className="font-semibold">{receiver.name || t.signature}</p>
                        <p className="text-xs text-slate-500">{[city, date].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </DocumentExportShell>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-extrabold">{title}</h2>{children}</section>;
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}

function PartyCard({ title, party }: { title: string; party: { name: string; document: string; email: string; phone: string } }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{title}</p><p className="mt-2 font-semibold">{party.name || '-'}</p>{party.document ? <p>{party.document}</p> : null}{party.email ? <p>{party.email}</p> : null}{party.phone ? <p>{party.phone}</p> : null}</div>;
}
