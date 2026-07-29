'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Download, FileText, Scale, Sparkles } from 'lucide-react';
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
import type { InternationalLocale } from '@/lib/i18n';
import { listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';

type Party = { name: string; document: string; address: string; email: string };

const copy = {
  en: {
    title: 'Service agreement',
    subtitle: 'Create an editable service agreement and download a structured PDF.',
    back: 'Back to tools',
    notice: 'General template only. Laws and requirements vary by location and situation. Consider professional legal review before signing.',
    parties: 'Parties',
    client: 'Client',
    provider: 'Service provider',
    name: 'Full name or legal business name',
    document: 'ID or company registration',
    address: 'Full address',
    email: 'Email',
    agreement: 'Agreement details',
    scope: 'Scope of services',
    amount: 'Contract amount and currency',
    payment: 'Payment terms',
    start: 'Start date',
    end: 'End date',
    termination: 'Notice period for termination (days)',
    jurisdiction: 'Governing law / city and country',
    confidentiality: 'Include confidentiality clause',
    intellectualProperty: 'Include intellectual property clause',
    notes: 'Additional terms',
    witnesses: 'Witnesses (optional)',
    witness1: 'Witness 1',
    witness2: 'Witness 2',
    preview: 'Live preview',
    contractTitle: 'Service Agreement',
    preamble: 'This Service Agreement is entered into between',
    and: 'and',
    together: 'collectively referred to as the “Parties”, under the following terms:',
    clause: 'Clause',
    clauses: {
      scope: ['Scope', 'The Service Provider shall perform the following services:'],
      term: ['Term', 'The services shall be provided during the period stated below.'],
      payment: ['Fees and payment', 'The Client shall pay the agreed amount under the following conditions:'],
      duties: ['Responsibilities', 'Each Party shall provide the information and cooperation reasonably required to perform this Agreement.'],
      termination: ['Termination', 'Either Party may terminate this Agreement by written notice, subject to payment for services already performed.'],
      confidentiality: ['Confidentiality', 'The Parties shall keep confidential all non-public information received in connection with this Agreement.'],
      ip: ['Intellectual property', 'Rights to final deliverables transfer only as described in this Agreement and after full payment, unless the Parties agree otherwise in writing.'],
      law: ['Governing law and jurisdiction', 'This Agreement shall be governed and interpreted under the law applicable in the jurisdiction stated below.']
    },
    closing: 'The Parties acknowledge that they have read and agreed to these terms and sign this Agreement in two counterparts.',
    signature: 'Signature',
    sample: 'Load example',
    download: 'Download PDF',
    downloading: 'Generating PDF...',
    required: 'Enter both Parties, the scope, amount, payment terms and governing jurisdiction.',
    loginRequired: 'Sign in and confirm your email to download the PDF.',
    signIn: 'Sign in',
    exportError: 'We couldn’t generate the PDF. Please try again.'
  },
  es: {
    title: 'Contrato de prestación de servicios',
    subtitle: 'Crea un contrato editable de servicios y descarga un PDF estructurado.',
    back: 'Volver a herramientas',
    notice: 'Modelo general orientativo. Las leyes y requisitos varían según el lugar y el caso. Considera una revisión jurídica profesional antes de firmar.',
    parties: 'Partes',
    client: 'Contratante',
    provider: 'Prestador de servicios',
    name: 'Nombre completo o razón social',
    document: 'Documento o registro de empresa',
    address: 'Dirección completa',
    email: 'Correo',
    agreement: 'Datos del contrato',
    scope: 'Objeto y alcance de los servicios',
    amount: 'Valor del contrato y moneda',
    payment: 'Condiciones de pago',
    start: 'Fecha de inicio',
    end: 'Fecha de finalización',
    termination: 'Aviso previo para rescisión (días)',
    jurisdiction: 'Ley aplicable / ciudad y país',
    confidentiality: 'Incluir cláusula de confidencialidad',
    intellectualProperty: 'Incluir cláusula de propiedad intelectual',
    notes: 'Condiciones adicionales',
    witnesses: 'Testigos (opcional)',
    witness1: 'Testigo 1',
    witness2: 'Testigo 2',
    preview: 'Vista previa',
    contractTitle: 'Contrato de Prestación de Servicios',
    preamble: 'Este Contrato de Prestación de Servicios se celebra entre',
    and: 'y',
    together: 'denominados conjuntamente las “Partes”, bajo las siguientes condiciones:',
    clause: 'Cláusula',
    clauses: {
      scope: ['Objeto', 'El Prestador realizará los siguientes servicios:'],
      term: ['Vigencia', 'Los servicios se prestarán durante el período indicado a continuación.'],
      payment: ['Valor y pago', 'El Contratante pagará el valor acordado bajo las siguientes condiciones:'],
      duties: ['Responsabilidades', 'Cada Parte proporcionará la información y colaboración razonablemente necesarias para ejecutar este Contrato.'],
      termination: ['Rescisión', 'Cualquiera de las Partes podrá rescindir este Contrato mediante aviso escrito, con el pago de los servicios ya realizados.'],
      confidentiality: ['Confidencialidad', 'Las Partes mantendrán en reserva toda información no pública recibida en relación con este Contrato.'],
      ip: ['Propiedad intelectual', 'Los derechos sobre los entregables finales se transfieren únicamente según este Contrato y después del pago total, salvo acuerdo escrito diferente.'],
      law: ['Ley aplicable y jurisdicción', 'Este Contrato se regirá e interpretará conforme a la legislación aplicable en la jurisdicción indicada.']
    },
    closing: 'Las Partes declaran haber leído y aceptado estas condiciones y firman el Contrato en dos ejemplares.',
    signature: 'Firma',
    sample: 'Cargar ejemplo',
    download: 'Descargar PDF',
    downloading: 'Generando PDF...',
    required: 'Ingresa ambas Partes, el objeto, el valor, las condiciones de pago y la jurisdicción.',
    loginRequired: 'Ingresa y confirma tu correo para descargar el PDF.',
    signIn: 'Ingresar',
    exportError: 'No pudimos generar el PDF. Inténtalo de nuevo.'
  }
} as const;

const emptyParty = (): Party => ({ name: '', document: '', address: '', email: '' });

export function InternationalServiceContractEditor({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh, session, usage } = useAuth();
  const brandDocuments = useDocumentBranding();
  const [client, setClient] = useState<Party>(emptyParty());
  const [provider, setProvider] = useState<Party>(emptyParty());
  const [scope, setScope] = useState('');
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [terminationDays, setTerminationDays] = useState(15);
  const [jurisdiction, setJurisdiction] = useState('');
  const [confidentiality, setConfidentiality] = useState(true);
  const [intellectualProperty, setIntellectualProperty] = useState(true);
  const [notes, setNotes] = useState('');
  const [witness1, setWitness1] = useState('');
  const [witness2, setWitness2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const draftId = `${locale}-draft`;

  useEffect(() => {
    if (!session) return;
    listRemoteDocuments<Record<string, unknown>>('service-contract-intl').then((documents) => {
      const saved = documents.find((item) => item.id === draftId);
      if (!saved) return;
      if (saved.client && typeof saved.client === 'object') setClient(saved.client as Party);
      if (saved.provider && typeof saved.provider === 'object') setProvider(saved.provider as Party);
      if (typeof saved.scope === 'string') setScope(saved.scope);
      if (typeof saved.amount === 'string') setAmount(saved.amount);
      if (typeof saved.payment === 'string') setPayment(saved.payment);
      if (typeof saved.start === 'string') setStart(saved.start);
      if (typeof saved.end === 'string') setEnd(saved.end);
      if (typeof saved.terminationDays === 'number') setTerminationDays(saved.terminationDays);
      if (typeof saved.jurisdiction === 'string') setJurisdiction(saved.jurisdiction);
      if (typeof saved.confidentiality === 'boolean') setConfidentiality(saved.confidentiality);
      if (typeof saved.intellectualProperty === 'boolean') setIntellectualProperty(saved.intellectualProperty);
      if (typeof saved.notes === 'string') setNotes(saved.notes);
      if (typeof saved.witness1 === 'string') setWitness1(saved.witness1);
      if (typeof saved.witness2 === 'string') setWitness2(saved.witness2);
    }).catch(() => undefined);
  }, [draftId, session]);

  function updateParty(kind: 'client' | 'provider', field: keyof Party, value: string) {
    const setter = kind === 'client' ? setClient : setProvider;
    setter((current) => ({ ...current, [field]: value }));
  }

  function loadSample() {
    setClient({ name: 'Studio Norte Comunicação Ltda.', document: '12.345.678/0001-90', address: 'Goiânia, GO, Brazil', email: 'contact@example.com' });
    setProvider({ name: 'Mariana Alves Costa', document: '123.456.789-00', address: 'Goiânia, GO, Brazil', email: 'mariana@example.com' });
    setScope(locale === 'en'
      ? 'Creation of a complete visual identity, including logo, color palette, typography and a concise brand guide.'
      : 'Creación de una identidad visual completa, incluyendo logotipo, paleta de colores, tipografía y guía resumida de marca.');
    setAmount('BRL 4,800.00');
    setPayment(locale === 'en' ? '50% upon signature and 50% upon final delivery, by Pix.' : '50% con la firma y 50% con la entrega final, mediante Pix.');
    setStart('2026-08-01');
    setEnd('2026-09-30');
    setJurisdiction(locale === 'en' ? 'Goiânia, Goiás, Brazil' : 'Goiânia, Goiás, Brasil');
    setNotes('');
    setError('');
  }

  async function downloadPdf() {
    if (!previewRef.current || !client.name.trim() || !provider.name.trim() || !scope.trim() || !amount.trim() || !payment.trim() || !jurisdiction.trim()) {
      setError(t.required);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outcome = await performBillableAction(
        { toolId: 'contratos', artifactId: `international-${client.name}-${provider.name}`, action: 'download' },
        async () => {
          await saveRemoteDocument('service-contract-intl', {
            id: draftId, locale, client, provider, scope, amount, payment, start, end,
            terminationDays, jurisdiction, confidentiality, intellectualProperty, notes,
            witness1, witness2, updatedAt: new Date().toISOString()
          });
          return exportElementToPdf(previewRef.current!, 'service-agreement.pdf', { branded: brandDocuments });
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

  const clauses: [string, string][] = [
    [t.clauses.scope[0], `${t.clauses.scope[1]}\n${scope || '________________________'}`],
    [t.clauses.term[0], `${t.clauses.term[1]}\n${start || '____'} — ${end || '____'}`],
    [t.clauses.payment[0], `${t.clauses.payment[1]}\n${amount || '____'} · ${payment || '________________________'}`],
    [t.clauses.duties[0], t.clauses.duties[1]],
    [t.clauses.termination[0], `${t.clauses.termination[1]} ${terminationDays} ${locale === 'en' ? 'days’ notice.' : 'días de aviso previo.'}`],
    ...(confidentiality ? [[t.clauses.confidentiality[0], t.clauses.confidentiality[1]] as [string, string]] : []),
    ...(intellectualProperty ? [[t.clauses.ip[0], t.clauses.ip[1]] as [string, string]] : []),
    [t.clauses.law[0], `${t.clauses.law[1]}\n${jurisdiction || '________________________'}`]
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link><LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/gerador-de-contrato', en: '/en/tools/service-contract', es: '/es/tools/service-contract' }} /></div></header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div><Button variant="outline" icon={Sparkles} onClick={loadSample}>{t.sample}</Button></div>
        <p className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><Scale className="mt-0.5 h-4 w-4 shrink-0" />{t.notice}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
          <div className="space-y-5">
            <Section title={t.parties}>
              {(['client', 'provider'] as const).map((kind) => {
                const party = kind === 'client' ? client : provider;
                return <div key={kind} className="mb-5 last:mb-0"><h3 className="mb-3 font-bold">{kind === 'client' ? t.client : t.provider}</h3><div className="grid gap-4 sm:grid-cols-2">{(['name', 'document', 'address', 'email'] as const).map((field) => <Field key={field} label={t[field]} className={field === 'name' || field === 'address' ? 'sm:col-span-2' : ''}><Input type={field === 'email' ? 'email' : 'text'} value={party[field]} onChange={(e) => updateParty(kind, field, e.target.value)} /></Field>)}</div></div>;
              })}
            </Section>
            <Section title={t.agreement}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.scope} className="sm:col-span-2"><Textarea rows={4} value={scope} onChange={(e) => setScope(e.target.value)} /></Field>
                <Field label={t.amount}><Input value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
                <Field label={t.termination}><Input type="number" min="0" value={terminationDays} onChange={(e) => setTerminationDays(Number(e.target.value))} /></Field>
                <Field label={t.payment} className="sm:col-span-2"><Textarea rows={3} value={payment} onChange={(e) => setPayment(e.target.value)} /></Field>
                <Field label={t.start}><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
                <Field label={t.end}><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
                <Field label={t.jurisdiction} className="sm:col-span-2"><Input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} /></Field>
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={confidentiality} onChange={(e) => setConfidentiality(e.target.checked)} />{t.confidentiality}</label>
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={intellectualProperty} onChange={(e) => setIntellectualProperty(e.target.checked)} />{t.intellectualProperty}</label>
                <Field label={t.notes} className="sm:col-span-2"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
              </div>
            </Section>
            <Section title={t.witnesses}><div className="grid gap-4 sm:grid-cols-2"><Field label={t.witness1}><Input value={witness1} onChange={(e) => setWitness1(e.target.value)} /></Field><Field label={t.witness2}><Input value={witness2} onChange={(e) => setWitness2(e.target.value)} /></Field></div></Section>
            {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error} {error.includes('login') || error.includes('correo') ? <Link className="underline" href={`/${locale}/login?next=/${locale}/tools/service-contract`}>{t.signIn}</Link> : null}</div> : null}
            <Button className="w-full" variant="success" icon={busy ? undefined : Download} loading={busy} onClick={downloadPdf}>{busy ? t.downloading : t.download}</Button>
          </div>

          <section>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-600"><FileText className="h-4 w-4" />{t.preview}</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-inner">
              <div ref={previewRef} className="mx-auto w-[210mm] max-w-none bg-white shadow-lg">
                <DocumentExportShell branded={!usage.unlimited}>
                  <article className="min-h-[297mm] p-[18mm] font-serif text-[13px] leading-7 text-slate-800">
                    <div className="mb-8 h-1.5 rounded-full bg-gradient-to-r from-slate-900 to-sky-600" />
                    <h1 className="text-center text-xl font-bold uppercase tracking-wide text-slate-950">{t.contractTitle}</h1>
                    <p className="mt-8 text-justify">{t.preamble} <strong>{describeParty(client, t.client)}</strong>; {t.and} <strong>{describeParty(provider, t.provider)}</strong>, {t.together}</p>
                    <div className="mt-8 space-y-5">{clauses.map(([title, body], index) => <section key={title}><h2 className="font-bold uppercase tracking-wide text-slate-950">{t.clause} {index + 1} · {title}</h2><p className="mt-1 whitespace-pre-wrap text-justify">{body}</p></section>)}</div>
                    {notes ? <p className="mt-6 border-l-2 border-sky-600 pl-4 italic text-slate-600">{notes}</p> : null}
                    <p className="mt-8 text-justify">{t.closing}</p>
                    <p className="mt-8 text-center">{jurisdiction || '________________'}, {end || '____/____/______'}.</p>
                    <div className="mt-16 grid grid-cols-2 gap-10"><Signature name={client.name} label={t.client} /><Signature name={provider.name} label={t.provider} /></div>
                    {witness1 || witness2 ? <div className="mt-14 grid grid-cols-2 gap-10"><Signature name={witness1} label={t.witness1} /><Signature name={witness2} label={t.witness2} /></div> : null}
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

function describeParty(party: Party, fallback: string) {
  return [party.name || fallback, party.document, party.address, party.email].filter(Boolean).join(', ');
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-extrabold">{title}</h2>{children}</section>;
}
function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}
function Signature({ name, label }: { name: string; label: string }) {
  return <div className="text-center"><div className="mb-2 border-t border-slate-700" /><p className="font-bold">{name || '________________________'}</p><p className="text-[11px] uppercase text-slate-500">{label}</p></div>;
}
