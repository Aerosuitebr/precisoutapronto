'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Clock3, Edit3, MapPin, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import type { AgendaEvent, AgendaEventPriority, AgendaEventStatus } from '@/lib/agenda/types';
import { loadAgendaEvents, persistAgendaEvent, removeAgendaEvent } from '@/lib/agenda/storage';
import type { InternationalLocale } from '@/lib/i18n';

const copy = {
  en: {
    title: 'Agenda and appointments',
    subtitle: 'Keep meetings, deliveries and deadlines organized in one secure agenda.',
    back: 'Back to tools',
    privacy: 'Appointments are saved to your account in the Resolva Jato database and stay synchronized across languages.',
    signInTitle: 'Sign in to open your agenda',
    signInText: 'Your appointments are private and linked to your account.',
    signIn: 'Sign in',
    create: 'Appointment details',
    titleField: 'Title',
    client: 'Client or contact',
    date: 'Date',
    start: 'Start time',
    end: 'End time',
    location: 'Location or meeting link',
    priority: 'Priority',
    status: 'Status',
    notes: 'Notes',
    save: 'Save appointment',
    saving: 'Saving...',
    new: 'New appointment',
    upcoming: 'Upcoming appointments',
    empty: 'No appointments yet. Create your first one.',
    today: 'Today',
    overdue: 'Overdue',
    conflict: 'This time overlaps another open appointment.',
    required: 'Enter a title, date and a valid time range.',
    loadError: 'We couldn’t load your appointments.',
    saveError: 'We couldn’t save this appointment.',
    deleteError: 'We couldn’t delete this appointment.',
    priorities: { normal: 'Normal', high: 'Important', critical: 'Urgent' },
    statuses: { confirmed: 'Confirmed', tentative: 'Tentative', done: 'Completed' },
    sample: 'Load example'
  },
  es: {
    title: 'Agenda y compromisos',
    subtitle: 'Organiza reuniones, entregas y plazos en una agenda segura.',
    back: 'Volver a herramientas',
    privacy: 'Los compromisos se guardan en tu cuenta en la base de datos de Resolva Jato y se sincronizan entre idiomas.',
    signInTitle: 'Ingresa para abrir tu agenda',
    signInText: 'Tus compromisos son privados y están vinculados a tu cuenta.',
    signIn: 'Ingresar',
    create: 'Datos del compromiso',
    titleField: 'Título',
    client: 'Cliente o contacto',
    date: 'Fecha',
    start: 'Hora de inicio',
    end: 'Hora de fin',
    location: 'Lugar o enlace de reunión',
    priority: 'Prioridad',
    status: 'Estado',
    notes: 'Observaciones',
    save: 'Guardar compromiso',
    saving: 'Guardando...',
    new: 'Nuevo compromiso',
    upcoming: 'Próximos compromisos',
    empty: 'Todavía no hay compromisos. Crea el primero.',
    today: 'Hoy',
    overdue: 'Atrasado',
    conflict: 'Este horario coincide con otro compromiso abierto.',
    required: 'Ingresa un título, una fecha y un horario válido.',
    loadError: 'No pudimos cargar tus compromisos.',
    saveError: 'No pudimos guardar este compromiso.',
    deleteError: 'No pudimos eliminar este compromiso.',
    priorities: { normal: 'Normal', high: 'Importante', critical: 'Urgente' },
    statuses: { confirmed: 'Confirmado', tentative: 'Por confirmar', done: 'Completado' },
    sample: 'Cargar ejemplo'
  }
} as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}
function emptyEvent(): AgendaEvent {
  const now = new Date().toISOString();
  return {
    id: `agenda_${crypto.randomUUID()}`,
    title: '',
    client: '',
    date: today(),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    notes: '',
    alertMinutes: 30,
    priority: 'normal',
    status: 'confirmed',
    createdAt: now,
    updatedAt: now
  };
}

export function InternationalAgenda({ locale }: { locale: InternationalLocale }) {
  const t = copy[locale];
  const { ready, session } = useAuth();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [draft, setDraft] = useState<AgendaEvent>(emptyEvent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      setLoading(false);
      return;
    }
    loadAgendaEvents()
      .then(setEvents)
      .catch(() => setError(t.loadError))
      .finally(() => setLoading(false));
  }, [ready, session, t.loadError]);

  const sorted = useMemo(
    () => [...events].sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)),
    [events]
  );
  const hasConflict = events.some((event) =>
    event.id !== draft.id && event.date === draft.date && event.status !== 'done' &&
    draft.startTime < event.endTime && event.startTime < draft.endTime
  );

  function update(patch: Partial<AgendaEvent>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function save() {
    if (!draft.title.trim() || !draft.date || draft.endTime <= draft.startTime) {
      setError(t.required);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await persistAgendaEvent({ ...draft, title: draft.title.trim() });
      setEvents((current) => [...current.filter((event) => event.id !== saved.id), saved]);
      setDraft(saved);
    } catch {
      setError(t.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await removeAgendaEvent(id);
      setEvents((current) => current.filter((event) => event.id !== id));
      if (draft.id === id) setDraft(emptyEvent());
    } catch {
      setError(t.deleteError);
    }
  }

  async function toggleDone(event: AgendaEvent) {
    try {
      const saved = await persistAgendaEvent({ ...event, status: event.status === 'done' ? 'confirmed' : 'done' });
      setEvents((current) => current.map((item) => item.id === saved.id ? saved : item));
      if (draft.id === saved.id) setDraft(saved);
    } catch {
      setError(t.saveError);
    }
  }

  function sample() {
    const event = emptyEvent();
    setDraft({
      ...event,
      title: locale === 'en' ? 'Client briefing meeting' : 'Reunión de briefing con cliente',
      client: 'Cliente Premium',
      startTime: '10:00',
      endTime: '11:00',
      location: locale === 'en' ? 'Video call' : 'Videollamada',
      notes: locale === 'en' ? 'Confirm scope, timeline and responsibilities.' : 'Confirmar alcance, plazo y responsables.',
      priority: 'high'
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><Link href={`/${locale}`}><Logo variant="marketing" className="h-12 sm:h-14" /></Link><LocaleSwitcher locale={locale} label={locale === 'en' ? 'Language' : 'Idioma'} paths={{ 'pt-BR': '/ferramentas/agenda', en: '/en/tools/agenda', es: '/es/tools/agenda' }} /></div></header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href={`/${locale}/tools`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <div className="mt-6"><h1 className="rj-display text-3xl font-extrabold sm:text-4xl">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div>
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{t.privacy}</p>

        {!ready || loading ? <div className="mt-6 rounded-2xl border bg-white p-8 text-sm text-slate-600">...</div> : !session ? (
          <section className="mt-6 rounded-[28px] border border-sky-200 bg-white p-8 text-center shadow-sm">
            <CalendarDays className="mx-auto h-10 w-10 text-sky-600" />
            <h2 className="mt-4 text-xl font-extrabold">{t.signInTitle}</h2><p className="mt-2 text-slate-600">{t.signInText}</p>
            <Button asChild className="mt-5"><Link href={`/${locale}/login?next=/${locale}/tools/agenda`}>{t.signIn}</Link></Button>
          </section>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(380px,1.1fr)]">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold">{t.create}</h2><Button size="sm" variant="outline" icon={Sparkles} onClick={sample}>{t.sample}</Button></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={t.titleField} className="sm:col-span-2"><Input value={draft.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <Field label={t.client}><Input value={draft.client} onChange={(e) => update({ client: e.target.value })} /></Field>
                <Field label={t.date}><Input type="date" value={draft.date} onChange={(e) => update({ date: e.target.value })} /></Field>
                <Field label={t.start}><Input type="time" value={draft.startTime} onChange={(e) => update({ startTime: e.target.value })} /></Field>
                <Field label={t.end}><Input type="time" value={draft.endTime} onChange={(e) => update({ endTime: e.target.value })} /></Field>
                <Field label={t.location} className="sm:col-span-2"><Input value={draft.location} onChange={(e) => update({ location: e.target.value })} /></Field>
                <Field label={t.priority}><select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={draft.priority} onChange={(e) => update({ priority: e.target.value as AgendaEventPriority })}>{(Object.keys(t.priorities) as AgendaEventPriority[]).map((value) => <option key={value} value={value}>{t.priorities[value]}</option>)}</select></Field>
                <Field label={t.status}><select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={draft.status} onChange={(e) => update({ status: e.target.value as AgendaEventStatus })}>{(Object.keys(t.statuses) as AgendaEventStatus[]).map((value) => <option key={value} value={value}>{t.statuses[value]}</option>)}</select></Field>
                <Field label={t.notes} className="sm:col-span-2"><Textarea rows={4} value={draft.notes} onChange={(e) => update({ notes: e.target.value })} /></Field>
              </div>
              {hasConflict ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{t.conflict}</p> : null}
              {error ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-2"><Button variant="outline" icon={Plus} onClick={() => { setDraft(emptyEvent()); setError(''); }}>{t.new}</Button><Button variant="success" loading={saving} onClick={save}>{saving ? t.saving : t.save}</Button></div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-extrabold">{t.upcoming}</h2>
              <div className="mt-5 space-y-3">
                {sorted.length ? sorted.map((event) => {
                  const overdue = event.status !== 'done' && `${event.date}T${event.endTime}` < new Date().toISOString().slice(0, 16);
                  return <article key={event.id} className={`rounded-2xl border p-4 ${event.status === 'done' ? 'bg-slate-50 opacity-70' : 'bg-white'}`}>
                    <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className={`font-extrabold ${event.status === 'done' ? 'line-through' : ''}`}>{event.title}</h3>{overdue ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">{t.overdue}</span> : null}</div><p className="mt-1 text-sm text-slate-600">{event.client}</p></div><span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">{t.priorities[event.priority]}</span></div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600"><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{event.date}</span><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{event.startTime}–{event.endTime}</span>{event.location ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</span> : null}</div>
                    <div className="mt-4 flex gap-2"><button type="button" onClick={() => setDraft(event)} className="rounded-lg p-2 text-sky-700 hover:bg-sky-50" aria-label={t.create}><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => toggleDone(event)} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50" aria-label={t.status}><Check className="h-4 w-4" /></button><button type="button" onClick={() => remove(event.id)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50" aria-label={t.deleteError}><Trash2 className="h-4 w-4" /></button></div>
                  </article>;
                }) : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">{t.empty}</p>}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>{children}</label>;
}
