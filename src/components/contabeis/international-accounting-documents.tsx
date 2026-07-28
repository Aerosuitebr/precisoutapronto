'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Calculator, Download, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import { listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';
import type { InternationalLocale } from '@/lib/i18n';

type Template = 'services' | 'handover' | 'management-letter';
const TEMPLATES: Template[] = ['services', 'handover', 'management-letter'];
type Draft = {
  client: string; clientTaxId: string; clientAddress: string;
  professional: string; professionalId: string; professionalAddress: string;
  scope: string; period: string; amount: string; currency: string; payment: string;
  responsibilities: string; city: string; date: string; notes: string;
};
const blank = (): Draft => ({
  client: '', clientTaxId: '', clientAddress: '', professional: '', professionalId: '', professionalAddress: '',
  scope: '', period: '', amount: '', currency: 'USD', payment: '', responsibilities: '', city: '', date: '', notes: ''
});

const copy = {
  en: {
    title: 'Accounting documents', subtitle: 'Prepare administrative records for clients and accounting professionals.',
    back: 'Back to tools', warning: 'General administrative template. Tax, accounting and signature requirements vary by country. Review local rules before use.',
    services: 'Accounting services', handover: 'Document handover', 'management-letter': 'Management responsibility',
    client: 'Client or company', taxId: 'Tax ID or registration', clientAddress: 'Client address',
    professional: 'Professional or firm', professionalId: 'Professional registration (optional)', professionalAddress: 'Professional address',
    scope: 'Services, documents or information covered', period: 'Period', amount: 'Amount (optional)', currency: 'Currency',
    payment: 'Payment terms (optional)', responsibilities: 'Responsibilities and confirmations', city: 'City and country',
    date: 'Date', notes: 'Additional notes', sample: 'Load example', preview: 'Document preview',
    download: 'Download PDF', downloading: 'Generating PDF...', required: 'Enter both parties, scope, period, city and date.',
    login: 'Sign in and confirm your email to download the PDF.', signIn: 'Sign in', error: 'We could not generate the PDF. Please try again.',
    titles: { services: 'ACCOUNTING SERVICES AGREEMENT', handover: 'DOCUMENT HANDOVER RECORD', 'management-letter': 'MANAGEMENT RESPONSIBILITY LETTER' },
    intro: {
      services: 'The parties record the accounting services described below, subject to the terms and responsibilities stated in this document.',
      handover: 'The parties confirm the delivery and receipt of the documents listed below.',
      'management-letter': 'Management confirms that the information supplied for the period below is complete and accurate to the best of its knowledge.'
    },
    defaults: {
      services: 'The professional will perform the listed services using information supplied by the client. The client remains responsible for timely, complete and accurate records.',
      handover: 'The recipient confirms receipt of the listed items in the condition described. Any discrepancy should be reported in writing.',
      'management-letter': 'Management is responsible for the records, supporting documents and representations supplied to the accounting professional.'
    },
    note: 'This document does not replace country-specific tax or accounting advice.'
  },
  es: {
    title: 'Documentos contables', subtitle: 'Prepara registros administrativos para clientes y profesionales contables.',
    back: 'Volver a herramientas', warning: 'Modelo administrativo general. Los requisitos fiscales, contables y de firma cambian según el país. Revisa las normas locales antes de utilizarlo.',
    services: 'Servicios contables', handover: 'Entrega de documentos', 'management-letter': 'Responsabilidad de la administración',
    client: 'Cliente o empresa', taxId: 'Identificación fiscal o registro', clientAddress: 'Dirección del cliente',
    professional: 'Profesional o firma', professionalId: 'Registro profesional (opcional)', professionalAddress: 'Dirección del profesional',
    scope: 'Servicios, documentos o información incluidos', period: 'Período', amount: 'Importe (opcional)', currency: 'Moneda',
    payment: 'Condiciones de pago (opcional)', responsibilities: 'Responsabilidades y confirmaciones', city: 'Ciudad y país',
    date: 'Fecha', notes: 'Notas adicionales', sample: 'Cargar ejemplo', preview: 'Vista previa del documento',
    download: 'Descargar PDF', downloading: 'Generando PDF...', required: 'Ingresa ambas partes, alcance, período, ciudad y fecha.',
    login: 'Ingresa y confirma tu correo para descargar el PDF.', signIn: 'Ingresar', error: 'No pudimos generar el PDF. Inténtalo de nuevo.',
    titles: { services: 'CONTRATO DE SERVICIOS CONTABLES', handover: 'ACTA DE ENTREGA DE DOCUMENTOS', 'management-letter': 'CARTA DE RESPONSABILIDAD DE LA ADMINISTRACIÓN' },
    intro: {
      services: 'Las partes registran los servicios contables descritos a continuación, sujetos a las condiciones y responsabilidades de este documento.',
      handover: 'Las partes confirman la entrega y recepción de los documentos indicados a continuación.',
      'management-letter': 'La administración confirma que la información suministrada para el período indicado es completa y exacta según su leal saber y entender.'
    },
    defaults: {
      services: 'El profesional realizará los servicios indicados con la información suministrada por el cliente. El cliente es responsable de entregar registros completos, exactos y oportunos.',
      handover: 'El receptor confirma la recepción de los elementos indicados en el estado descrito. Cualquier diferencia deberá informarse por escrito.',
      'management-letter': 'La administración es responsable de los registros, documentos de respaldo y manifestaciones suministrados al profesional contable.'
    },
    note: 'Este documento no sustituye el asesoramiento fiscal o contable específico de cada país.'
  }
} as const;

export function InternationalAccountingDocuments({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh, session, usage } = useAuth();
  const [template, setTemplate] = useState<Template>('services');
  const [draft, setDraft] = useState<Draft>(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const draftId = `${locale}-draft`;

  useEffect(() => {
    if (!session) return;
    listRemoteDocuments<Record<string, unknown>>('accounting-documents-intl').then((documents) => {
      const saved = documents.find((item) => item.id === draftId);
      if (!saved) return;
      if (saved.draft && typeof saved.draft === 'object') setDraft({ ...blank(), ...(saved.draft as Draft) });
      if (TEMPLATES.includes(saved.template as Template)) setTemplate(saved.template as Template);
    }).catch(() => undefined);
  }, [draftId, session]);

  function update(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function loadSample() {
    setDraft({
      client: 'Northwind Studio Ltd.', clientTaxId: 'Tax ID 123-456-789', clientAddress: locale === 'en' ? 'Toronto, Canada' : 'Toronto, Canadá',
      professional: 'Global Ledger Partners', professionalId: 'Professional Reg. 45210', professionalAddress: locale === 'en' ? 'Toronto, Canada' : 'Toronto, Canadá',
      scope: template === 'handover'
        ? (locale === 'en' ? '12 sales invoices, 8 supplier invoices and bank statements.' : '12 facturas de venta, 8 facturas de proveedores y extractos bancarios.')
        : (locale === 'en' ? 'Monthly bookkeeping, reconciliation and management reports.' : 'Contabilidad mensual, conciliación e informes de gestión.'),
      period: locale === 'en' ? 'July 2026' : 'Julio de 2026', amount: '850.00', currency: 'USD',
      payment: locale === 'en' ? 'Due by the 10th day of each month.' : 'Pago hasta el día 10 de cada mes.',
      responsibilities: t.defaults[template], city: locale === 'en' ? 'Toronto, Canada' : 'Toronto, Canadá',
      date: '27 July 2026', notes: ''
    });
    setError('');
  }

  async function downloadPdf() {
    if (!previewRef.current || !draft.client.trim() || !draft.professional.trim() || !draft.scope.trim() || !draft.period.trim() || !draft.city.trim() || !draft.date.trim()) {
      setError(t.required);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outcome = await performBillableAction(
        { toolId: 'contabeis', artifactId: `international-${locale}`, action: 'download' },
        async () => {
          await saveRemoteDocument('accounting-documents-intl', { id: draftId, locale, template, draft, updatedAt: new Date().toISOString() });
          return exportElementToPdf(previewRef.current!, `${template}-${draft.client.replace(/\s+/g, '-').toLowerCase()}.pdf`, { branded: !usage.unlimited });
        }
      );
      if (!outcome.allowed) {
        setError(outcome.reason || t.login);
        return;
      }
      refresh();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link>
          <LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/documentos-contabeis-online', en: '/en/tools/accounting-documents', es: '/es/tools/accounting-documents' }} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div>
          <Button variant="outline" icon={Sparkles} onClick={loadSample}>{t.sample}</Button>
        </div>
        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">{t.warning}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(500px,1.18fr)]">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              {TEMPLATES.map((item) => <button key={item} type="button" onClick={() => setTemplate(item)} className={`rounded-2xl border p-4 text-left text-sm font-bold ${template === item ? 'border-cyan-600 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-slate-50'}`}><Calculator className="mb-2 h-5 w-5" />{t[item]}</button>)}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t.client}><Input value={draft.client} onChange={(e) => update('client', e.target.value)} /></Field>
              <Field label={t.professional}><Input value={draft.professional} onChange={(e) => update('professional', e.target.value)} /></Field>
              <Field label={t.taxId}><Input value={draft.clientTaxId} onChange={(e) => update('clientTaxId', e.target.value)} /></Field>
              <Field label={t.professionalId}><Input value={draft.professionalId} onChange={(e) => update('professionalId', e.target.value)} /></Field>
              <Field label={t.clientAddress}><Input value={draft.clientAddress} onChange={(e) => update('clientAddress', e.target.value)} /></Field>
              <Field label={t.professionalAddress}><Input value={draft.professionalAddress} onChange={(e) => update('professionalAddress', e.target.value)} /></Field>
              <Field label={t.scope} wide><Textarea rows={4} value={draft.scope} onChange={(e) => update('scope', e.target.value)} /></Field>
              <Field label={t.period}><Input value={draft.period} onChange={(e) => update('period', e.target.value)} /></Field>
              <Field label={t.currency}><Input value={draft.currency} onChange={(e) => update('currency', e.target.value)} /></Field>
              <Field label={t.amount}><Input value={draft.amount} onChange={(e) => update('amount', e.target.value)} /></Field>
              <Field label={t.payment}><Input value={draft.payment} onChange={(e) => update('payment', e.target.value)} /></Field>
              <Field label={t.responsibilities} wide><Textarea rows={5} value={draft.responsibilities} onChange={(e) => update('responsibilities', e.target.value)} /></Field>
              <Field label={t.city}><Input value={draft.city} onChange={(e) => update('city', e.target.value)} /></Field>
              <Field label={t.date}><Input value={draft.date} onChange={(e) => update('date', e.target.value)} /></Field>
              <Field label={t.notes} wide><Textarea rows={3} value={draft.notes} onChange={(e) => update('notes', e.target.value)} /></Field>
            </div>
            {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error} {error === t.login ? <Link className="underline" href={`/${locale}/login?next=/${locale}/tools/accounting-documents`}>{t.signIn}</Link> : null}</div> : null}
            <Button className="mt-5 w-full" variant="success" icon={busy ? undefined : Download} loading={busy} onClick={downloadPdf}>{busy ? t.downloading : t.download}</Button>
          </section>
          <section>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">{t.preview}</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-inner">
              <div ref={previewRef} className="mx-auto w-[210mm] max-w-none bg-white shadow-lg">
                <DocumentExportShell branded={!usage.unlimited}>
                  <article className="min-h-[297mm] px-[24mm] py-[22mm] font-sans text-[13px] leading-7 text-slate-900">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-slate-900 to-cyan-600" />
                    <h2 className="mt-8 text-center text-2xl font-bold tracking-wide">{t.titles[template]}</h2>
                    <p className="mt-8 text-justify">{t.intro[template]}</p>
                    <div className="mt-7 grid grid-cols-2 gap-6 rounded-xl bg-slate-50 p-5"><Party name={draft.client} id={draft.clientTaxId} address={draft.clientAddress} label={t.client} /><Party name={draft.professional} id={draft.professionalId} address={draft.professionalAddress} label={t.professional} /></div>
                    <Section title={t.scope}>{draft.scope}</Section><Section title={t.period}>{draft.period}</Section>
                    {draft.amount ? <Section title={t.amount}>{draft.currency} {draft.amount}{draft.payment ? ` · ${draft.payment}` : ''}</Section> : null}
                    <Section title={t.responsibilities}>{draft.responsibilities || t.defaults[template]}</Section>
                    {draft.notes ? <Section title={t.notes}>{draft.notes}</Section> : null}
                    <p className="mt-10 text-center">{draft.city || t.city}, {draft.date || t.date}.</p>
                    <div className="mt-16 grid grid-cols-2 gap-10 text-center"><Signature name={draft.client} label={t.client} /><Signature name={draft.professional} label={t.professional} /></div>
                    <p className="mt-12 border-t border-slate-200 pt-4 text-xs italic text-slate-500">{t.note}</p>
                  </article>
                </DocumentExportShell>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? 'block sm:col-span-2' : 'block'}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}
function Party({ name, id, address, label }: { name: string; id: string; address: string; label: string }) {
  return <div><strong className="text-xs uppercase text-cyan-800">{label}</strong><p className="font-bold">{name || '________________'}</p>{id ? <p>{id}</p> : null}{address ? <p>{address}</p> : null}</div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-7"><h3 className="font-bold uppercase text-cyan-900">{title}</h3><p className="mt-1 whitespace-pre-wrap text-justify">{children || '________________'}</p></section>;
}
function Signature({ name, label }: { name: string; label: string }) {
  return <div className="border-t border-slate-500 pt-2"><strong>{name || '________________'}</strong><p className="text-xs text-slate-500">{label}</p></div>;
}
