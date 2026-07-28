'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, Gavel, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useDocumentBranding } from '@/hooks/use-document-branding';
import { performBillableAction } from '@/lib/billing';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import { listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';
import type { InternationalLocale } from '@/lib/i18n';

type Template = 'authorization' | 'notice' | 'settlement';
const LEGAL_TEMPLATES: Template[] = ['authorization', 'notice', 'settlement'];
type Draft = {
  partyA: string; partyAId: string; partyAAddress: string;
  partyB: string; partyBId: string; partyBAddress: string;
  subject: string; facts: string; terms: string; deadline: string;
  city: string; date: string; witness1: string; witness2: string;
};

const blank = (): Draft => ({
  partyA: '', partyAId: '', partyAAddress: '', partyB: '', partyBId: '', partyBAddress: '',
  subject: '', facts: '', terms: '', deadline: '', city: '', date: '', witness1: '', witness2: ''
});

const copy = {
  en: {
    title: 'Legal document templates', subtitle: 'Prepare a clear editable draft and export it as an A4 PDF.',
    back: 'Back to tools', warning: 'General template only. Laws and validity requirements vary by country and jurisdiction. Have a qualified local professional review it before signing or relying on it.',
    authorization: 'Authorization letter', notice: 'Formal notice', settlement: 'Settlement agreement',
    partyA: 'Grantor / sender / first party', partyB: 'Authorized person / recipient / second party',
    id: 'ID or registration (optional)', address: 'Address (optional)', subject: 'Subject or purpose',
    facts: 'Background and facts', terms: 'Authorization, request or agreed terms', deadline: 'Deadline (optional)',
    city: 'City and country', date: 'Date', witness1: 'Witness 1 (optional)', witness2: 'Witness 2 (optional)',
    sample: 'Load example', preview: 'Document preview', download: 'Download PDF', downloading: 'Generating PDF...',
    required: 'Enter both parties, the subject, terms, city and date.', login: 'Sign in and confirm your email to download the PDF.',
    signIn: 'Sign in', error: 'We could not generate the PDF. Please try again.',
    titles: { authorization: 'AUTHORIZATION LETTER', notice: 'FORMAL NOTICE', settlement: 'SETTLEMENT AGREEMENT' },
    intro: {
      authorization: 'The grantor identified below authorizes the authorized person to act for the purpose and within the limits described in this document.',
      notice: 'The sender identified below formally notifies the recipient regarding the matter described in this document.',
      settlement: 'The parties identified below voluntarily record the following settlement terms.'
    },
    sampleTerms: {
      authorization: 'The authorized person may submit and receive documents related exclusively to the subject above. This authorization does not permit delegation without written consent.',
      notice: 'The recipient is requested to respond and remedy the matter within the stated deadline.',
      settlement: 'The parties agree to perform the obligations described above in good faith. Any amendment must be made in writing and signed by both parties.'
    },
    notes: 'This draft does not replace local legal advice.'
  },
  es: {
    title: 'Modelos de documentos jurídicos', subtitle: 'Prepara un borrador editable y expórtalo como PDF A4.',
    back: 'Volver a herramientas', warning: 'Modelo general. Las leyes y los requisitos de validez cambian según el país y la jurisdicción. Solicita la revisión de un profesional local antes de firmarlo o utilizarlo.',
    authorization: 'Carta de autorización', notice: 'Notificación formal', settlement: 'Acuerdo extrajudicial',
    partyA: 'Otorgante / remitente / primera parte', partyB: 'Autorizado / destinatario / segunda parte',
    id: 'Documento o registro (opcional)', address: 'Dirección (opcional)', subject: 'Asunto o finalidad',
    facts: 'Antecedentes y hechos', terms: 'Autorización, solicitud o términos acordados', deadline: 'Plazo (opcional)',
    city: 'Ciudad y país', date: 'Fecha', witness1: 'Testigo 1 (opcional)', witness2: 'Testigo 2 (opcional)',
    sample: 'Cargar ejemplo', preview: 'Vista previa del documento', download: 'Descargar PDF', downloading: 'Generando PDF...',
    required: 'Ingresa ambas partes, el asunto, los términos, la ciudad y la fecha.', login: 'Ingresa y confirma tu correo para descargar el PDF.',
    signIn: 'Ingresar', error: 'No pudimos generar el PDF. Inténtalo de nuevo.',
    titles: { authorization: 'CARTA DE AUTORIZACIÓN', notice: 'NOTIFICACIÓN FORMAL', settlement: 'ACUERDO EXTRAJUDICIAL' },
    intro: {
      authorization: 'El otorgante identificado a continuación autoriza a la persona indicada a actuar con la finalidad y dentro de los límites descritos en este documento.',
      notice: 'El remitente identificado a continuación notifica formalmente al destinatario sobre el asunto descrito en este documento.',
      settlement: 'Las partes identificadas a continuación registran voluntariamente los siguientes términos del acuerdo.'
    },
    sampleTerms: {
      authorization: 'La persona autorizada podrá presentar y recibir documentos relacionados exclusivamente con el asunto indicado. Esta autorización no permite delegación sin consentimiento escrito.',
      notice: 'Se solicita al destinatario que responda y resuelva el asunto dentro del plazo establecido.',
      settlement: 'Las partes acuerdan cumplir de buena fe las obligaciones descritas. Cualquier modificación deberá constar por escrito y ser firmada por ambas partes.'
    },
    notes: 'Este borrador no sustituye el asesoramiento jurídico local.'
  }
} as const;

export function InternationalLegalDocuments({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh, session, usage } = useAuth();
  const brandDocuments = useDocumentBranding();
  const [template, setTemplate] = useState<Template>('authorization');
  const [draft, setDraft] = useState<Draft>(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const draftId = `${locale}-draft`;

  useEffect(() => {
    if (!session) return;
    listRemoteDocuments<Record<string, unknown>>('legal-documents-intl').then((documents) => {
      const saved = documents.find((item) => item.id === draftId);
      if (!saved) return;
      if (saved.draft && typeof saved.draft === 'object') setDraft({ ...blank(), ...(saved.draft as Draft) });
      if (LEGAL_TEMPLATES.includes(saved.template as Template)) setTemplate(saved.template as Template);
    }).catch(() => undefined);
  }, [draftId, session]);

  const partyLines = useMemo(() => ({
    a: [draft.partyA, draft.partyAId, draft.partyAAddress].filter(Boolean).join(' · '),
    b: [draft.partyB, draft.partyBId, draft.partyBAddress].filter(Boolean).join(' · ')
  }), [draft]);

  function update(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function loadSample() {
    setDraft({
      partyA: 'Ana Mendes', partyAId: 'Passport / ID 123456', partyAAddress: locale === 'en' ? 'São Paulo, Brazil' : 'São Paulo, Brasil',
      partyB: 'Carlos Oliveira', partyBId: 'Passport / ID 987654', partyBAddress: locale === 'en' ? 'Lisbon, Portugal' : 'Lisboa, Portugal',
      subject: locale === 'en' ? 'Collection of academic documents' : 'Retiro de documentos académicos',
      facts: locale === 'en' ? 'The documents are available from the institution named by the grantor.' : 'Los documentos están disponibles en la institución indicada por el otorgante.',
      terms: t.sampleTerms[template], deadline: locale === 'en' ? 'Valid until 31 December 2026' : 'Válido hasta el 31 de diciembre de 2026',
      city: locale === 'en' ? 'São Paulo, Brazil' : 'São Paulo, Brasil', date: '27 July 2026', witness1: '', witness2: ''
    });
    setError('');
  }

  async function downloadPdf() {
    if (!previewRef.current || !draft.partyA.trim() || !draft.partyB.trim() || !draft.subject.trim() || !draft.terms.trim() || !draft.city.trim() || !draft.date.trim()) {
      setError(t.required);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outcome = await performBillableAction(
        { toolId: 'juridicos', artifactId: `international-${locale}`, action: 'download' },
        async () => {
          await saveRemoteDocument('legal-documents-intl', { id: draftId, locale, template, draft, updatedAt: new Date().toISOString() });
          return exportElementToPdf(previewRef.current!, `${template}-${draft.partyA.replace(/\s+/g, '-').toLowerCase()}.pdf`, { branded: brandDocuments });
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
          <LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/documentos-juridicos-online', en: '/en/tools/legal-documents', es: '/es/tools/legal-documents' }} />
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
              {LEGAL_TEMPLATES.map((item) => <button key={item} type="button" onClick={() => setTemplate(item)} className={`rounded-2xl border p-4 text-left text-sm font-bold ${template === item ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50'}`}><Gavel className="mb-2 h-5 w-5" />{t[item]}</button>)}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t.partyA}><Input value={draft.partyA} onChange={(e) => update('partyA', e.target.value)} /></Field>
              <Field label={t.partyB}><Input value={draft.partyB} onChange={(e) => update('partyB', e.target.value)} /></Field>
              <Field label={t.id}><Input value={draft.partyAId} onChange={(e) => update('partyAId', e.target.value)} /></Field>
              <Field label={t.id}><Input value={draft.partyBId} onChange={(e) => update('partyBId', e.target.value)} /></Field>
              <Field label={t.address}><Input value={draft.partyAAddress} onChange={(e) => update('partyAAddress', e.target.value)} /></Field>
              <Field label={t.address}><Input value={draft.partyBAddress} onChange={(e) => update('partyBAddress', e.target.value)} /></Field>
              <Field label={t.subject} wide><Input value={draft.subject} onChange={(e) => update('subject', e.target.value)} /></Field>
              <Field label={t.facts} wide><Textarea rows={4} value={draft.facts} onChange={(e) => update('facts', e.target.value)} /></Field>
              <Field label={t.terms} wide><Textarea rows={6} value={draft.terms} onChange={(e) => update('terms', e.target.value)} /></Field>
              <Field label={t.deadline} wide><Input value={draft.deadline} onChange={(e) => update('deadline', e.target.value)} /></Field>
              <Field label={t.city}><Input value={draft.city} onChange={(e) => update('city', e.target.value)} /></Field>
              <Field label={t.date}><Input value={draft.date} onChange={(e) => update('date', e.target.value)} /></Field>
              <Field label={t.witness1}><Input value={draft.witness1} onChange={(e) => update('witness1', e.target.value)} /></Field>
              <Field label={t.witness2}><Input value={draft.witness2} onChange={(e) => update('witness2', e.target.value)} /></Field>
            </div>
            {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error} {error === t.login ? <Link className="underline" href={`/${locale}/login?next=/${locale}/tools/legal-documents`}>{t.signIn}</Link> : null}</div> : null}
            <Button className="mt-5 w-full" variant="success" icon={busy ? undefined : Download} loading={busy} onClick={downloadPdf}>{busy ? t.downloading : t.download}</Button>
          </section>

          <section>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">{t.preview}</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-inner">
              <div ref={previewRef} className="mx-auto w-[210mm] max-w-none bg-white shadow-lg">
                <DocumentExportShell branded={!usage.unlimited}>
                  <article className="min-h-[297mm] px-[24mm] py-[22mm] font-serif text-[13px] leading-7 text-slate-900">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-slate-900 to-amber-700" />
                    <h2 className="mt-8 text-center text-2xl font-bold tracking-wide">{t.titles[template]}</h2>
                    <p className="mt-8 text-justify">{t.intro[template]}</p>
                    <section className="mt-7 space-y-2"><p><strong>{t.partyA}:</strong> {partyLines.a || '____________________'}</p><p><strong>{t.partyB}:</strong> {partyLines.b || '____________________'}</p></section>
                    <section className="mt-7"><h3 className="font-bold uppercase">{t.subject}</h3><p className="mt-1 whitespace-pre-wrap text-justify">{draft.subject || '____________________'}</p></section>
                    {draft.facts ? <section className="mt-6"><h3 className="font-bold uppercase">{t.facts}</h3><p className="mt-1 whitespace-pre-wrap text-justify">{draft.facts}</p></section> : null}
                    <section className="mt-6"><h3 className="font-bold uppercase">{t.terms}</h3><p className="mt-1 whitespace-pre-wrap text-justify">{draft.terms || '____________________'}</p></section>
                    {draft.deadline ? <p className="mt-6"><strong>{t.deadline}:</strong> {draft.deadline}</p> : null}
                    <p className="mt-10 text-center">{draft.city || t.city}, {draft.date || t.date}.</p>
                    <div className="mt-16 grid grid-cols-2 gap-10 text-center"><Signature name={draft.partyA} label={t.partyA} /><Signature name={draft.partyB} label={t.partyB} /></div>
                    {(draft.witness1 || draft.witness2) ? <div className="mt-12 grid grid-cols-2 gap-10 text-center"><Signature name={draft.witness1} label={t.witness1} /><Signature name={draft.witness2} label={t.witness2} /></div> : null}
                    <p className="mt-12 border-t border-slate-200 pt-4 text-xs italic text-slate-500">{t.notes}</p>
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

function Signature({ name, label }: { name: string; label: string }) {
  return <div className="border-t border-slate-500 pt-2"><strong>{name || '____________________'}</strong><p className="text-xs text-slate-500">{label}</p></div>;
}
