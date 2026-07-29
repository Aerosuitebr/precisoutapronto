'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Download, Sparkles } from 'lucide-react';
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

type Template = 'cover' | 'title-page';
type CoverData = {
  institution: string;
  course: string;
  author: string;
  title: string;
  subtitle: string;
  discipline: string;
  advisor: string;
  nature: string;
  city: string;
  year: string;
};

const emptyData = (): CoverData => ({
  institution: '', course: '', author: '', title: '', subtitle: '', discipline: '', advisor: '',
  nature: '', city: '', year: String(new Date().getFullYear())
});

const copy = {
  en: {
    title: 'Academic cover page', subtitle: 'Create a clean school or university cover and export it as an A4 PDF.',
    back: 'Back to tools', warning: 'ABNT is a Brazilian academic standard. Confirm the exact formatting rules required by your institution.',
    cover: 'University cover', titlePage: 'Title page', institution: 'Institution', course: 'Course or program',
    author: 'Author or student', workTitle: 'Work title', workSubtitle: 'Subtitle (optional)', discipline: 'Course subject (optional)',
    advisor: 'Professor or advisor', nature: 'Purpose of the work', city: 'City', year: 'Year', sample: 'Load example',
    preview: 'A4 live preview', download: 'Download PDF', downloading: 'Generating PDF...',
    required: 'Enter the institution, author, work title, city and year.', login: 'Sign in and confirm your email to download the PDF.',
    error: 'We could not generate the PDF. Please try again.', signIn: 'Sign in',
    natureSample: 'Academic work submitted as a partial requirement for course assessment.',
    placeholders: { institution: 'Federal University...', course: 'Business Administration', author: 'Full name', title: 'Main title', city: 'São Paulo' }
  },
  es: {
    title: 'Portada académica', subtitle: 'Crea una portada escolar o universitaria y expórtala como PDF A4.',
    back: 'Volver a herramientas', warning: 'ABNT es una norma académica brasileña. Confirma el formato exacto exigido por tu institución.',
    cover: 'Portada universitaria', titlePage: 'Página de título', institution: 'Institución', course: 'Carrera o programa',
    author: 'Autor o estudiante', workTitle: 'Título del trabajo', workSubtitle: 'Subtítulo (opcional)', discipline: 'Asignatura (opcional)',
    advisor: 'Profesor u orientador', nature: 'Finalidad del trabajo', city: 'Ciudad', year: 'Año', sample: 'Cargar ejemplo',
    preview: 'Vista previa A4', download: 'Descargar PDF', downloading: 'Generando PDF...',
    required: 'Ingresa la institución, el autor, el título, la ciudad y el año.', login: 'Ingresa y confirma tu correo para descargar el PDF.',
    error: 'No pudimos generar el PDF. Inténtalo de nuevo.', signIn: 'Ingresar',
    natureSample: 'Trabajo académico presentado como requisito parcial para la evaluación de la asignatura.',
    placeholders: { institution: 'Universidad Federal...', course: 'Administración de Empresas', author: 'Nombre completo', title: 'Título principal', city: 'São Paulo' }
  }
} as const;

export function InternationalAcademicCover({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const previewRef = useRef<HTMLDivElement>(null);
  const { refresh, session, usage } = useAuth();
  const brandDocuments = useDocumentBranding();
  const [template, setTemplate] = useState<Template>('cover');
  const [data, setData] = useState<CoverData>(emptyData);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const draftId = `${locale}-draft`;

  useEffect(() => {
    if (!session) return;
    listRemoteDocuments<Record<string, unknown>>('academic-cover-intl').then((documents) => {
      const saved = documents.find((item) => item.id === draftId);
      if (!saved) return;
      if (saved.data && typeof saved.data === 'object') setData({ ...emptyData(), ...(saved.data as CoverData) });
      if (saved.template === 'cover' || saved.template === 'title-page') setTemplate(saved.template);
    }).catch(() => undefined);
  }, [draftId, session]);

  function update(field: keyof CoverData, value: string) {
    setData((current) => ({ ...current, [field]: value }));
  }

  function loadSample() {
    setData({
      institution: locale === 'en' ? 'Federal University of Goiás' : 'Universidad Federal de Goiás',
      course: locale === 'en' ? 'Business Administration' : 'Administración de Empresas',
      author: 'Ana Clara Mendes',
      title: locale === 'en' ? 'Strategic planning in small businesses' : 'Planificación estratégica en pequeñas empresas',
      subtitle: locale === 'en' ? 'A case study in local commerce' : 'Un estudio de caso en el comercio local',
      discipline: locale === 'en' ? 'Project Management' : 'Gestión de Proyectos',
      advisor: locale === 'en' ? 'Professor Marcos Oliveira' : 'Profesor Marcos Oliveira',
      nature: t.natureSample, city: 'Goiânia', year: String(new Date().getFullYear())
    });
    setError('');
  }

  async function downloadPdf() {
    if (!previewRef.current || !data.institution.trim() || !data.author.trim() || !data.title.trim() || !data.city.trim() || !data.year.trim()) {
      setError(t.required);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const outcome = await performBillableAction(
        { toolId: 'trabalhos', artifactId: `international-${locale}`, action: 'download' },
        async () => {
          await saveRemoteDocument('academic-cover-intl', { id: draftId, locale, template, data, updatedAt: new Date().toISOString() });
          return exportElementToPdf(previewRef.current!, `academic-cover-${data.author.replace(/\s+/g, '-').toLowerCase()}.pdf`, { branded: brandDocuments });
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

  const fields: Array<[keyof CoverData, string, string]> = [
    ['institution', t.institution, t.placeholders.institution], ['course', t.course, t.placeholders.course],
    ['author', t.author, t.placeholders.author], ['title', t.workTitle, t.placeholders.title],
    ['subtitle', t.workSubtitle, ''], ['discipline', t.discipline, ''], ['advisor', t.advisor, ''],
    ['city', t.city, t.placeholders.city], ['year', t.year, String(new Date().getFullYear())]
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link>
          <LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/ferramentas/trabalhos', en: '/en/tools/academic-cover', es: '/es/tools/academic-cover' }} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div>
          <Button variant="outline" icon={Sparkles} onClick={loadSample}>{t.sample}</Button>
        </div>
        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{t.warning}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(500px,1.18fr)]">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {(['cover', 'title-page'] as Template[]).map((item) => (
                <button key={item} type="button" onClick={() => setTemplate(item)} className={`rounded-2xl border p-4 text-left text-sm font-bold ${template === item ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-200 bg-slate-50'}`}>
                  <BookOpen className="mb-2 h-5 w-5" />{item === 'cover' ? t.cover : t.titlePage}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {fields.map(([field, label, placeholder]) => <Field key={field} label={label} wide={field === 'institution' || field === 'author' || field === 'title' || field === 'subtitle'}><Input value={data[field]} placeholder={placeholder} onChange={(e) => update(field, e.target.value)} /></Field>)}
              {template === 'title-page' ? <Field label={t.nature} wide><Textarea rows={4} value={data.nature} onChange={(e) => update('nature', e.target.value)} /></Field> : null}
            </div>
            {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error} {error === t.login ? <Link className="underline" href={`/${locale}/login?next=/${locale}/tools/academic-cover`}>{t.signIn}</Link> : null}</div> : null}
            <Button className="mt-5 w-full" variant="success" icon={busy ? undefined : Download} loading={busy} onClick={downloadPdf}>{busy ? t.downloading : t.download}</Button>
          </section>

          <section>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">{t.preview}</p>
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200 p-3 shadow-inner">
              <div ref={previewRef} className="mx-auto w-[210mm] max-w-none bg-white shadow-lg">
                <DocumentExportShell branded={!usage.unlimited}>
                  <article className="flex min-h-[297mm] flex-col px-[25mm] py-[25mm] text-center font-serif text-[12px] leading-relaxed text-slate-950">
                    <header><p className="text-sm font-bold uppercase tracking-[0.08em]">{data.institution || t.institution}</p>{data.course ? <p className="mt-2 text-xs uppercase">{data.course}</p> : null}</header>
                    <p className="mt-24 text-sm font-semibold uppercase tracking-[0.06em]">{data.author || t.author}</p>
                    <div className="mt-24"><h2 className="text-xl font-bold uppercase leading-snug tracking-[0.04em]">{data.title || t.workTitle}</h2>{data.subtitle ? <p className="mt-3 text-sm italic">{data.subtitle}</p> : null}</div>
                    {template === 'title-page' ? <div className="ml-auto mt-16 max-w-[58%] text-left text-[11px] leading-6"><p>{data.nature || t.natureSample}</p>{data.advisor ? <p className="mt-3">{t.advisor}: <strong>{data.advisor}</strong></p> : null}{data.discipline ? <p>{t.discipline}: <strong>{data.discipline}</strong></p> : null}</div> : null}
                    <footer className="mt-auto pb-2"><p className="text-sm font-semibold">{data.city || t.city}</p><p className="text-sm font-semibold">{data.year}</p></footer>
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
