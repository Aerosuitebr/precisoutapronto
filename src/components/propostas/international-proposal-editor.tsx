'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Download, FileText, Plus, Sparkles, Trash2 } from 'lucide-react';
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

type Party = { name: string; document: string; email: string; phone: string };
type Item = { id: string; name: string; description: string; quantity: number; unitPrice: number };

const copy = {
  en: {
    title: 'Professional business proposal',
    subtitle: 'Present scope, pricing and terms in an agency-style PDF.',
    back: 'Back to tools',
    brazilNotice: 'Values are shown in Brazilian reais (BRL). CPF/CNPJ fields are optional.',
    proposal: 'Business proposal',
    overview: 'Proposal details',
    parties: 'Company and client',
    services: 'Products and services',
    terms: 'Commercial terms',
    number: 'Proposal number',
    issueDate: 'Issue date',
    validity: 'Valid for (days)',
    introduction: 'Introduction',
    company: 'Your company',
    client: 'Client',
    name: 'Name or business name',
    document: 'CPF/CNPJ (optional)',
    email: 'Email (optional)',
    phone: 'Phone (optional)',
    itemName: 'Product or service',
    description: 'Description',
    quantity: 'Qty.',
    unitPrice: 'Unit price (BRL)',
    addItem: 'Add item',
    remove: 'Remove',
    discount: 'Discount (%)',
    additional: 'Shipping or additional cost (BRL)',
    payment: 'Payment terms',
    delivery: 'Delivery terms',
    notes: 'Notes',
    subtotal: 'Subtotal',
    discountLabel: 'Discount',
    additionalLabel: 'Additional',
    total: 'Total',
    preparedFor: 'Prepared for',
    scope: 'Scope and investment',
    validUntil: 'Validity',
    signature: 'Company representative',
    preview: 'Live preview',
    sample: 'Load example',
    download: 'Download PDF',
    downloading: 'Generating PDF...',
    required: 'Enter your company, the client and at least one valid item.',
    loginRequired: 'Sign in and confirm your email to download the PDF.',
    signIn: 'Sign in',
    exportError: 'We couldn’t generate the PDF. Please try again.',
    defaultIntro: 'We are pleased to present this proposal based on the needs discussed.',
    defaultPayment: '50% upon approval and 50% upon final delivery.',
    defaultDelivery: 'Up to 20 business days after approval and receipt of the required materials.',
    defaultNotes: 'This proposal is subject to availability and confirmation of the terms presented.'
  },
  es: {
    title: 'Propuesta comercial profesional',
    subtitle: 'Presenta alcance, precios y condiciones en un PDF con estilo de agencia.',
    back: 'Volver a herramientas',
    brazilNotice: 'Los valores se muestran en reales brasileños (BRL). Los campos CPF/CNPJ son opcionales.',
    proposal: 'Propuesta comercial',
    overview: 'Datos de la propuesta',
    parties: 'Empresa y cliente',
    services: 'Productos y servicios',
    terms: 'Condiciones comerciales',
    number: 'Número de propuesta',
    issueDate: 'Fecha de emisión',
    validity: 'Validez (días)',
    introduction: 'Introducción',
    company: 'Tu empresa',
    client: 'Cliente',
    name: 'Nombre o razón social',
    document: 'CPF/CNPJ (opcional)',
    email: 'Correo (opcional)',
    phone: 'Teléfono (opcional)',
    itemName: 'Producto o servicio',
    description: 'Descripción',
    quantity: 'Cant.',
    unitPrice: 'Precio unitario (BRL)',
    addItem: 'Agregar ítem',
    remove: 'Eliminar',
    discount: 'Descuento (%)',
    additional: 'Envío o costo adicional (BRL)',
    payment: 'Condiciones de pago',
    delivery: 'Plazo de entrega',
    notes: 'Observaciones',
    subtotal: 'Subtotal',
    discountLabel: 'Descuento',
    additionalLabel: 'Adicional',
    total: 'Total',
    preparedFor: 'Preparada para',
    scope: 'Alcance e inversión',
    validUntil: 'Validez',
    signature: 'Representante de la empresa',
    preview: 'Vista previa',
    sample: 'Cargar ejemplo',
    download: 'Descargar PDF',
    downloading: 'Generando PDF...',
    required: 'Ingresa tu empresa, el cliente y al menos un ítem válido.',
    loginRequired: 'Ingresa y confirma tu correo para descargar el PDF.',
    signIn: 'Ingresar',
    exportError: 'No pudimos generar el PDF. Inténtalo de nuevo.',
    defaultIntro: 'Nos complace presentar esta propuesta basada en las necesidades conversadas.',
    defaultPayment: '50% con la aprobación y 50% con la entrega final.',
    defaultDelivery: 'Hasta 20 días hábiles después de la aprobación y recepción de los materiales necesarios.',
    defaultNotes: 'Esta propuesta está sujeta a disponibilidad y confirmación de las condiciones presentadas.'
  }
} as const;

function newItem(): Item {
  return { id: crypto.randomUUID(), name: '', description: '', quantity: 1, unitPrice: 0 };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatBRL(value: number, locale: InternationalLocale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number.isFinite(value) ? value : 0);
}

export function InternationalProposalEditor({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh, session, usage } = useAuth();
  const [number, setNumber] = useState(`PROP-${new Date().getFullYear()}-001`);
  const [issueDate, setIssueDate] = useState(today());
  const [validity, setValidity] = useState(15);
  const [introduction, setIntroduction] = useState<string>(t.defaultIntro);
  const [company, setCompany] = useState<Party>({ name: '', document: '', email: '', phone: '' });
  const [client, setClient] = useState<Party>({ name: '', document: '', email: '', phone: '' });
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [additional, setAdditional] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState<string>(t.defaultPayment);
  const [deliveryTerms, setDeliveryTerms] = useState<string>(t.defaultDelivery);
  const [notes, setNotes] = useState<string>(t.defaultNotes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice), 0),
    [items]
  );
  const discount = subtotal * Math.min(100, Math.max(0, discountPercent)) / 100;
  const total = subtotal - discount + Math.max(0, additional);
  const validItems = items.filter((item) => item.name.trim() && item.quantity > 0 && item.unitPrice > 0);
  const draftId = `${locale}-draft`;

  useEffect(() => {
    if (!session) return;
    listRemoteDocuments<Record<string, unknown>>('proposal-intl').then((documents) => {
      const saved = documents.find((item) => item.id === draftId);
      if (!saved) return;
      if (typeof saved.number === 'string') setNumber(saved.number);
      if (typeof saved.issueDate === 'string') setIssueDate(saved.issueDate);
      if (typeof saved.validity === 'number') setValidity(saved.validity);
      if (typeof saved.introduction === 'string') setIntroduction(saved.introduction);
      if (saved.company && typeof saved.company === 'object') setCompany(saved.company as Party);
      if (saved.client && typeof saved.client === 'object') setClient(saved.client as Party);
      if (Array.isArray(saved.items)) setItems(saved.items as Item[]);
      if (typeof saved.discountPercent === 'number') setDiscountPercent(saved.discountPercent);
      if (typeof saved.additional === 'number') setAdditional(saved.additional);
      if (typeof saved.paymentTerms === 'string') setPaymentTerms(saved.paymentTerms);
      if (typeof saved.deliveryTerms === 'string') setDeliveryTerms(saved.deliveryTerms);
      if (typeof saved.notes === 'string') setNotes(saved.notes);
    }).catch(() => undefined);
  }, [draftId, session]);

  function updateParty(kind: 'company' | 'client', field: keyof Party, value: string) {
    const setter = kind === 'company' ? setCompany : setClient;
    setter((current) => ({ ...current, [field]: value }));
  }

  function updateItem(id: string, field: keyof Omit<Item, 'id'>, value: string) {
    setItems((current) => current.map((item) => item.id === id
      ? { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value }
      : item));
  }

  function loadSample() {
    setCompany({ name: 'Ana Lima Design', document: '12.345.678/0001-90', email: 'contact@example.com', phone: '+55 11 99999-1010' });
    setClient({ name: 'Mercado Central Ltda.', document: '98.765.432/0001-10', email: 'marina@example.com', phone: '+55 11 3333-4444' });
    setItems([
      {
        id: crypto.randomUUID(),
        name: locale === 'en' ? 'Visual identity design' : 'Diseño de identidad visual',
        description: locale === 'en' ? 'Logo, color palette, typography and a concise brand guide.' : 'Logotipo, paleta de colores, tipografía y guía resumida de marca.',
        quantity: 1,
        unitPrice: 2500
      },
      {
        id: crypto.randomUUID(),
        name: locale === 'en' ? 'Social media kit' : 'Kit para redes sociales',
        description: locale === 'en' ? 'Ten editable templates for posts and stories.' : 'Diez plantillas editables para publicaciones e historias.',
        quantity: 1,
        unitPrice: 800
      }
    ]);
    setDiscountPercent(5);
    setAdditional(0);
    setError('');
  }

  async function downloadPdf() {
    if (!previewRef.current || !company.name.trim() || !client.name.trim() || validItems.length === 0) {
      setError(t.required);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outcome = await performBillableAction(
        { toolId: 'propostas', artifactId: `international-${number}`, action: 'download' },
        async () => {
          await saveRemoteDocument('proposal-intl', {
            id: draftId, locale, number, issueDate, validity, introduction, company, client,
            items, discountPercent, additional, paymentTerms, deliveryTerms, notes,
            updatedAt: new Date().toISOString()
          });
          return exportElementToPdf(previewRef.current!, `proposal-${number}.pdf`, { branded: !usage.unlimited });
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link>
          <LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/gerador-de-proposta-comercial', en: '/en/tools/proposal', es: '/es/tools/proposal' }} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700">
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div>
          <Button variant="outline" icon={Sparkles} onClick={loadSample}>{t.sample}</Button>
        </div>
        <p className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">{t.brazilNotice}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
          <div className="space-y-5">
            <Section title={t.overview}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t.number}><Input value={number} onChange={(e) => setNumber(e.target.value)} /></Field>
                <Field label={t.issueDate}><Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></Field>
                <Field label={t.validity}><Input type="number" min="1" value={validity} onChange={(e) => setValidity(Number(e.target.value))} /></Field>
                <Field label={t.introduction} className="sm:col-span-3"><Textarea rows={3} value={introduction} onChange={(e) => setIntroduction(e.target.value)} /></Field>
              </div>
            </Section>

            <Section title={t.parties}>
              {(['company', 'client'] as const).map((kind) => {
                const party = kind === 'company' ? company : client;
                return (
                  <div key={kind} className="mb-5 last:mb-0">
                    <h3 className="mb-3 font-bold">{kind === 'company' ? t.company : t.client}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(['name', 'document', 'email', 'phone'] as const).map((field) => (
                        <Field key={field} label={t[field]} className={field === 'name' ? 'sm:col-span-2' : ''}>
                          <Input type={field === 'email' ? 'email' : 'text'} value={party[field]} onChange={(e) => updateParty(kind, field, e.target.value)} />
                        </Field>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Section>

            <Section title={t.services}>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between"><strong>#{index + 1}</strong><button type="button" onClick={() => setItems((current) => current.length === 1 ? [newItem()] : current.filter((entry) => entry.id !== item.id))} className="inline-flex items-center gap-1 text-xs font-bold text-rose-600"><Trash2 className="h-3.5 w-3.5" />{t.remove}</button></div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <Field label={t.itemName} className="sm:col-span-3"><Input value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} /></Field>
                      <Field label={t.quantity}><Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} /></Field>
                      <Field label={t.description} className="sm:col-span-3"><Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></Field>
                      <Field label={t.unitPrice}><Input type="number" min="0" step="0.01" value={item.unitPrice || ''} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} /></Field>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4" variant="outline" icon={Plus} onClick={() => setItems((current) => [...current, newItem()])}>{t.addItem}</Button>
            </Section>

            <Section title={t.terms}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.discount}><Input type="number" min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} /></Field>
                <Field label={t.additional}><Input type="number" min="0" step="0.01" value={additional || ''} onChange={(e) => setAdditional(Number(e.target.value))} /></Field>
                <Field label={t.payment}><Textarea rows={3} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} /></Field>
                <Field label={t.delivery}><Textarea rows={3} value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} /></Field>
                <Field label={t.notes} className="sm:col-span-2"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
              </div>
            </Section>

            {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error} {error.includes('login') || error.includes('correo') ? <Link className="underline" href={`/${locale}/login?next=/${locale}/tools/proposal`}>{t.signIn}</Link> : null}</div> : null}
            <Button className="w-full" variant="success" icon={busy ? undefined : Download} loading={busy} onClick={downloadPdf}>{busy ? t.downloading : t.download}</Button>
          </div>

          <section>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-600"><FileText className="h-4 w-4" />{t.preview}</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-inner">
              <div ref={previewRef} className="mx-auto w-[210mm] max-w-none bg-white shadow-lg">
                <DocumentExportShell branded={!usage.unlimited}>
                  <div className="flex min-h-[297mm] flex-col p-[15mm] text-slate-800">
                    <div className="flex items-start justify-between gap-6 border-b-4 border-sky-600 pb-6">
                      <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-600 text-2xl font-extrabold text-white">{(company.name || 'R').charAt(0).toUpperCase()}</div><div><p className="text-xl font-extrabold text-slate-950">{company.name || t.company}</p><p className="text-sm text-slate-500">{company.email}</p></div></div>
                      <div className="text-right"><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">{t.proposal}</p><p className="mt-1 font-bold">{number}</p><p className="text-xs text-slate-500">{issueDate}</p></div>
                    </div>
                    <div className="mt-8 grid grid-cols-[1fr_auto] gap-8">
                      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{t.preparedFor}</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950">{client.name || t.client}</h2>{client.document ? <p className="text-sm text-slate-500">{client.document}</p> : null}</div>
                      <div className="rounded-xl bg-sky-50 px-5 py-4 text-right"><p className="text-xs font-bold uppercase text-sky-700">{t.validUntil}</p><p className="mt-1 font-bold">{validity} {locale === 'en' ? 'days' : 'días'}</p></div>
                    </div>
                    <p className="mt-7 text-sm leading-7 text-slate-600">{introduction}</p>
                    <h3 className="mt-8 text-sm font-extrabold uppercase tracking-[0.14em] text-slate-900">{t.scope}</h3>
                    <table className="mt-3 w-full table-fixed border-collapse text-xs">
                      <thead><tr className="bg-slate-100 text-left uppercase text-slate-600"><th className="w-8 border p-2">#</th><th className="border p-2">{t.description}</th><th className="w-14 border p-2 text-center">{t.quantity}</th><th className="w-24 border p-2 text-right">{t.unitPrice}</th><th className="w-24 border p-2 text-right">{t.total}</th></tr></thead>
                      <tbody>{items.map((item, index) => <tr key={item.id} className="align-top"><td className="border p-2 text-center">{index + 1}</td><td className="border p-2"><strong className="block">{item.name || t.itemName}</strong>{item.description ? <span className="mt-1 block text-[10px] text-slate-500">{item.description}</span> : null}</td><td className="border p-2 text-center">{item.quantity}</td><td className="border p-2 text-right">{formatBRL(item.unitPrice, locale)}</td><td className="border p-2 text-right font-bold">{formatBRL(item.quantity * item.unitPrice, locale)}</td></tr>)}</tbody>
                    </table>
                    <div className="ml-auto mt-5 w-72 overflow-hidden rounded-xl border text-sm">
                      <TotalRow label={t.subtotal} value={formatBRL(subtotal, locale)} />
                      {discount > 0 ? <TotalRow label={`${t.discountLabel} (${discountPercent}%)`} value={`- ${formatBRL(discount, locale)}`} /> : null}
                      {additional > 0 ? <TotalRow label={t.additionalLabel} value={formatBRL(additional, locale)} /> : null}
                      <div className="flex justify-between bg-slate-900 px-4 py-3 font-extrabold text-white"><span>{t.total}</span><span>{formatBRL(total, locale)}</span></div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4 text-xs"><Term title={t.payment} text={paymentTerms} /><Term title={t.delivery} text={deliveryTerms} /></div>
                    {notes ? <p className="mt-5 text-xs leading-5 text-slate-500">{notes}</p> : null}
                    <div className="mt-auto pb-6 pt-16 text-right"><div className="ml-auto w-72 border-t border-slate-500 pt-2 text-center"><p className="font-semibold">{company.name || t.signature}</p><p className="text-xs text-slate-500">{t.signature}</p></div></div>
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-extrabold">{title}</h2>{children}</section>;
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b px-4 py-2"><span>{label}</span><strong>{value}</strong></div>;
}

function Term({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border p-4"><p className="font-bold uppercase tracking-[0.1em] text-sky-700">{title}</p><p className="mt-2 whitespace-pre-wrap leading-5">{text}</p></div>;
}
