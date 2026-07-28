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
import { useDocumentBranding } from '@/hooks/use-document-branding';
import { performBillableAction } from '@/lib/billing';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import type { InternationalLocale } from '@/lib/i18n';
import { listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';

type Experience = { id: string; company: string; role: string; location: string; start: string; end: string; description: string };
type Education = { id: string; institution: string; course: string; period: string; details: string };
type Language = { id: string; name: string; level: string };

const copy = {
  en: {
    title: 'Professional résumé',
    subtitle: 'Build a clear, international-ready résumé and download it as a PDF.',
    back: 'Back to tools',
    guidance: 'International format: no photo, age, marital status or Brazilian ID numbers.',
    personal: 'Personal details',
    name: 'Full name',
    headline: 'Professional headline',
    email: 'Email',
    phone: 'Phone',
    location: 'City and country',
    website: 'LinkedIn or portfolio',
    summary: 'Professional summary',
    experience: 'Work experience',
    company: 'Company',
    role: 'Role',
    start: 'Start',
    end: 'End or Present',
    description: 'Achievements and responsibilities',
    education: 'Education',
    institution: 'Institution',
    course: 'Degree or program',
    period: 'Period',
    details: 'Details (optional)',
    skills: 'Skills',
    skillsHelp: 'Separate skills with commas',
    languages: 'Languages',
    language: 'Language',
    level: 'Level',
    add: 'Add',
    remove: 'Remove',
    preview: 'Live preview',
    profile: 'Profile',
    present: 'Present',
    sample: 'Load example',
    download: 'Download PDF',
    downloading: 'Generating PDF...',
    required: 'Enter your name, professional headline, email and at least one experience or education entry.',
    loginRequired: 'Sign in and confirm your email to download the PDF.',
    signIn: 'Sign in',
    exportError: 'We couldn’t generate the PDF. Please try again.',
    sampleSummary: 'Digital marketing professional focused on growth, content strategy and measurable customer acquisition.',
    skillsSample: 'Content strategy, SEO, Google Analytics, Paid media, Copywriting'
  },
  es: {
    title: 'Currículum profesional',
    subtitle: 'Crea un currículum claro, preparado para oportunidades internacionales, y descárgalo en PDF.',
    back: 'Volver a herramientas',
    guidance: 'Formato internacional: sin foto, edad, estado civil ni documentos de identidad brasileños.',
    personal: 'Datos personales',
    name: 'Nombre completo',
    headline: 'Título profesional',
    email: 'Correo',
    phone: 'Teléfono',
    location: 'Ciudad y país',
    website: 'LinkedIn o portafolio',
    summary: 'Perfil profesional',
    experience: 'Experiencia laboral',
    company: 'Empresa',
    role: 'Cargo',
    start: 'Inicio',
    end: 'Fin o Actualidad',
    description: 'Logros y responsabilidades',
    education: 'Formación académica',
    institution: 'Institución',
    course: 'Título o programa',
    period: 'Período',
    details: 'Detalles (opcional)',
    skills: 'Competencias',
    skillsHelp: 'Separa las competencias con comas',
    languages: 'Idiomas',
    language: 'Idioma',
    level: 'Nivel',
    add: 'Agregar',
    remove: 'Eliminar',
    preview: 'Vista previa',
    profile: 'Perfil',
    present: 'Actualidad',
    sample: 'Cargar ejemplo',
    download: 'Descargar PDF',
    downloading: 'Generando PDF...',
    required: 'Ingresa tu nombre, título profesional, correo y al menos una experiencia o formación.',
    loginRequired: 'Ingresa y confirma tu correo para descargar el PDF.',
    signIn: 'Ingresar',
    exportError: 'No pudimos generar el PDF. Inténtalo de nuevo.',
    sampleSummary: 'Profesional de marketing digital enfocada en crecimiento, estrategia de contenidos y adquisición medible de clientes.',
    skillsSample: 'Estrategia de contenidos, SEO, Google Analytics, Medios pagos, Redacción'
  }
} as const;

const emptyExperience = (): Experience => ({ id: crypto.randomUUID(), company: '', role: '', location: '', start: '', end: '', description: '' });
const emptyEducation = (): Education => ({ id: crypto.randomUUID(), institution: '', course: '', period: '', details: '' });
const emptyLanguage = (): Language => ({ id: crypto.randomUUID(), name: '', level: '' });

export function InternationalResumeEditor({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh, session, usage } = useAuth();
  const brandDocuments = useDocumentBranding();
  const [personal, setPersonal] = useState({ name: '', headline: '', email: '', phone: '', location: '', website: '', summary: '' });
  const [experiences, setExperiences] = useState<Experience[]>([emptyExperience()]);
  const [education, setEducation] = useState<Education[]>([emptyEducation()]);
  const [skillsText, setSkillsText] = useState('');
  const [languages, setLanguages] = useState<Language[]>([emptyLanguage()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const skills = useMemo(() => skillsText.split(',').map((item) => item.trim()).filter(Boolean), [skillsText]);
  const draftId = `${locale}-draft`;

  useEffect(() => {
    if (!session) return;
    listRemoteDocuments<Record<string, unknown>>('resume-intl').then((documents) => {
      const saved = documents.find((item) => item.id === draftId);
      if (!saved) return;
      if (saved.personal && typeof saved.personal === 'object') setPersonal(saved.personal as typeof personal);
      if (Array.isArray(saved.experiences)) setExperiences(saved.experiences as Experience[]);
      if (Array.isArray(saved.education)) setEducation(saved.education as Education[]);
      if (typeof saved.skillsText === 'string') setSkillsText(saved.skillsText);
      if (Array.isArray(saved.languages)) setLanguages(saved.languages as Language[]);
    }).catch(() => undefined);
  }, [draftId, session]);

  function updateList<T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string, field: keyof T, value: string) {
    setter((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function loadSample() {
    setPersonal({
      name: 'Ana Paula Mendes',
      headline: locale === 'en' ? 'Digital Marketing Analyst' : 'Analista de Marketing Digital',
      email: 'ana.mendes@example.com',
      phone: '+55 11 98888-7777',
      location: locale === 'en' ? 'São Paulo, Brazil' : 'São Paulo, Brasil',
      website: 'linkedin.com/in/anamendes',
      summary: t.sampleSummary
    });
    setExperiences([{
      id: crypto.randomUUID(),
      company: 'Norte Digital',
      role: locale === 'en' ? 'Digital Marketing Analyst' : 'Analista de Marketing Digital',
      location: locale === 'en' ? 'São Paulo, Brazil' : 'São Paulo, Brasil',
      start: '2022',
      end: t.present,
      description: locale === 'en'
        ? 'Increased qualified organic traffic by 42%. Led content planning and performance reporting across paid and organic channels.'
        : 'Aumentó el tráfico orgánico cualificado un 42%. Lideró la planificación de contenidos y los informes de rendimiento.'
    }]);
    setEducation([{
      id: crypto.randomUUID(),
      institution: 'Universidade Anhembi Morumbi',
      course: locale === 'en' ? 'Bachelor’s degree in Marketing' : 'Licenciatura en Marketing',
      period: '2018 – 2021',
      details: ''
    }]);
    setSkillsText(t.skillsSample);
    setLanguages([
      { id: crypto.randomUUID(), name: locale === 'en' ? 'Portuguese' : 'Portugués', level: locale === 'en' ? 'Native' : 'Nativo' },
      { id: crypto.randomUUID(), name: locale === 'en' ? 'English' : 'Inglés', level: locale === 'en' ? 'Advanced' : 'Avanzado' }
    ]);
    setError('');
  }

  async function downloadPdf() {
    const hasHistory = experiences.some((item) => item.company.trim() && item.role.trim()) || education.some((item) => item.institution.trim() && item.course.trim());
    if (!previewRef.current || !personal.name.trim() || !personal.headline.trim() || !personal.email.trim() || !hasHistory) {
      setError(t.required);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outcome = await performBillableAction(
        { toolId: 'curriculo', artifactId: `international-${personal.email}`, action: 'download' },
        async () => {
          await saveRemoteDocument('resume-intl', {
            id: draftId, locale, personal, experiences, education, skillsText, languages,
            updatedAt: new Date().toISOString()
          });
          return exportElementToPdf(previewRef.current!, `resume-${personal.name.replace(/\s+/g, '-').toLowerCase()}.pdf`, { branded: brandDocuments });
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
          <LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/gerador-de-curriculo', en: '/en/tools/resume', es: '/es/tools/resume' }} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div>
          <Button variant="outline" icon={Sparkles} onClick={loadSample}>{t.sample}</Button>
        </div>
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{t.guidance}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,1.08fr)]">
          <div className="space-y-5">
            <Section title={t.personal}>
              <div className="grid gap-4 sm:grid-cols-2">
                {(Object.keys(personal) as (keyof typeof personal)[]).map((field) => (
                  <Field key={field} label={t[field]} className={field === 'summary' ? 'sm:col-span-2' : ''}>
                    {field === 'summary'
                      ? <Textarea rows={4} value={personal[field]} onChange={(e) => setPersonal((current) => ({ ...current, [field]: e.target.value }))} />
                      : <Input type={field === 'email' ? 'email' : 'text'} value={personal[field]} onChange={(e) => setPersonal((current) => ({ ...current, [field]: e.target.value }))} />}
                  </Field>
                ))}
              </div>
            </Section>

            <RepeatSection title={t.experience} addLabel={t.add} onAdd={() => setExperiences((current) => [...current, emptyExperience()])}>
              {experiences.map((item, index) => (
                <Card key={item.id} index={index} remove={t.remove} onRemove={() => setExperiences((current) => current.length === 1 ? [emptyExperience()] : current.filter((entry) => entry.id !== item.id))}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(['company', 'role', 'location', 'start', 'end', 'description'] as const).map((field) => <Field key={field} label={t[field]} className={field === 'description' ? 'sm:col-span-2' : ''}>{field === 'description' ? <Textarea rows={3} value={item[field]} onChange={(e) => updateList(setExperiences, item.id, field, e.target.value)} /> : <Input value={item[field]} onChange={(e) => updateList(setExperiences, item.id, field, e.target.value)} />}</Field>)}
                  </div>
                </Card>
              ))}
            </RepeatSection>

            <RepeatSection title={t.education} addLabel={t.add} onAdd={() => setEducation((current) => [...current, emptyEducation()])}>
              {education.map((item, index) => (
                <Card key={item.id} index={index} remove={t.remove} onRemove={() => setEducation((current) => current.length === 1 ? [emptyEducation()] : current.filter((entry) => entry.id !== item.id))}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(['institution', 'course', 'period', 'details'] as const).map((field) => <Field key={field} label={t[field]}><Input value={item[field]} onChange={(e) => updateList(setEducation, item.id, field, e.target.value)} /></Field>)}
                  </div>
                </Card>
              ))}
            </RepeatSection>

            <Section title={t.skills}><Field label={t.skillsHelp}><Textarea rows={3} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} /></Field></Section>

            <RepeatSection title={t.languages} addLabel={t.add} onAdd={() => setLanguages((current) => [...current, emptyLanguage()])}>
              {languages.map((item, index) => <Card key={item.id} index={index} remove={t.remove} onRemove={() => setLanguages((current) => current.length === 1 ? [emptyLanguage()] : current.filter((entry) => entry.id !== item.id))}><div className="grid gap-3 sm:grid-cols-2"><Field label={t.language}><Input value={item.name} onChange={(e) => updateList(setLanguages, item.id, 'name', e.target.value)} /></Field><Field label={t.level}><Input value={item.level} onChange={(e) => updateList(setLanguages, item.id, 'level', e.target.value)} /></Field></div></Card>)}
            </RepeatSection>

            {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error} {error.includes('login') || error.includes('correo') ? <Link className="underline" href={`/${locale}/login?next=/${locale}/tools/resume`}>{t.signIn}</Link> : null}</div> : null}
            <Button className="w-full" variant="success" icon={busy ? undefined : Download} loading={busy} onClick={downloadPdf}>{busy ? t.downloading : t.download}</Button>
          </div>

          <section>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-600"><FileText className="h-4 w-4" />{t.preview}</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-inner">
              <div ref={previewRef} className="mx-auto w-[210mm] max-w-none bg-white shadow-lg">
                <DocumentExportShell branded={!usage.unlimited}>
                  <div className="min-h-[297mm] p-[15mm] text-slate-800">
                    <header className="border-b-4 border-sky-600 pb-6">
                      <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">{personal.name || t.name}</h1>
                      <p className="mt-2 text-xl font-semibold text-sky-700">{personal.headline || t.headline}</p>
                      <p className="mt-3 text-sm text-slate-600">{[personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join('  •  ')}</p>
                    </header>
                    {personal.summary ? <ResumeSection title={t.profile}><p className="text-sm leading-6">{personal.summary}</p></ResumeSection> : null}
                    {experiences.some((item) => item.company || item.role) ? <ResumeSection title={t.experience}>{experiences.filter((item) => item.company || item.role).map((item) => <div key={item.id} className="mb-5 last:mb-0"><div className="flex justify-between gap-4"><div><h3 className="font-extrabold text-slate-950">{item.role}</h3><p className="font-semibold text-sky-700">{item.company}{item.location ? ` · ${item.location}` : ''}</p></div><p className="shrink-0 text-xs font-semibold text-slate-500">{[item.start, item.end].filter(Boolean).join(' – ')}</p></div>{item.description ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description}</p> : null}</div>)}</ResumeSection> : null}
                    {education.some((item) => item.institution || item.course) ? <ResumeSection title={t.education}>{education.filter((item) => item.institution || item.course).map((item) => <div key={item.id} className="mb-4 last:mb-0"><div className="flex justify-between gap-4"><div><h3 className="font-extrabold">{item.course}</h3><p className="text-sm font-semibold text-sky-700">{item.institution}</p></div><p className="text-xs font-semibold text-slate-500">{item.period}</p></div>{item.details ? <p className="mt-1 text-sm text-slate-600">{item.details}</p> : null}</div>)}</ResumeSection> : null}
                    <div className="grid grid-cols-2 gap-8">
                      {skills.length ? <ResumeSection title={t.skills}><div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">{skill}</span>)}</div></ResumeSection> : null}
                      {languages.some((item) => item.name) ? <ResumeSection title={t.languages}><ul className="space-y-2 text-sm">{languages.filter((item) => item.name).map((item) => <li key={item.id}><strong>{item.name}</strong>{item.level ? ` — ${item.level}` : ''}</li>)}</ul></ResumeSection> : null}
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-extrabold">{title}</h2>{children}</section>;
}
function RepeatSection({ title, addLabel, onAdd, children }: { title: string; addLabel: string; onAdd: () => void; children: ReactNode }) {
  return <Section title={title}><div className="space-y-4">{children}</div><Button className="mt-4" variant="outline" icon={Plus} onClick={onAdd}>{addLabel}</Button></Section>;
}
function Card({ index, remove, onRemove, children }: { index: number; remove: string; onRemove: () => void; children: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex justify-between"><strong>#{index + 1}</strong><button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-bold text-rose-600"><Trash2 className="h-3.5 w-3.5" />{remove}</button></div>{children}</div>;
}
function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}
function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-7"><h2 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">{title}</h2>{children}</section>;
}
