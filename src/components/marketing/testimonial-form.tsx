'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TESTIMONIAL_CONSENT_VERSION } from '@/lib/testimonials/contracts';

export function TestimonialForm() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, consent: form.get('consent') === 'on', consentVersion: TESTIMONIAL_CONSENT_VERSION }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (response.status === 401) { setStatus('Entre na sua conta e volte para enviar.'); return; }
    if (!response.ok) { setStatus(data.error || 'Não foi possível enviar.'); return; }
    event.currentTarget.reset(); setStatus('Relato recebido. Ele ficará pendente até a revisão da equipe.');
  }
  return <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="grid gap-4 sm:grid-cols-2"><Field name="publicName" label="Nome público" /><Field name="profession" label="Profissão" /><Field name="city" label="Cidade" /><Field name="state" label="UF" maxLength={2} /></div>
    <label className="block text-sm font-bold text-slate-800">Ferramenta usada<select name="toolKey" required className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"><option value="">Selecione</option><option value="orcamento">Orçamento</option><option value="pix">Pix</option><option value="recibo">Recibo</option><option value="proposta">Proposta</option><option value="contrato">Contrato</option><option value="curriculo">Currículo</option><option value="calculadora">Calculadora</option><option value="outro">Outra</option></select></label>
    <label className="block text-sm font-bold text-slate-800">Sua experiência<textarea name="quote" required minLength={30} maxLength={800} rows={6} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" placeholder="Conte o problema, o que criou e o que aconteceu depois." /></label>
    <label className="flex items-start gap-3 text-sm leading-6 text-slate-700"><input name="consent" type="checkbox" required className="mt-1 h-4 w-4" />Confirmo que este relato é verdadeiro e autorizo a publicação do texto, nome, profissão e cidade/UF. Posso pedir remoção depois.</label>
    <Button type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar para revisão'}</Button>
    {status ? <p className="text-sm font-semibold text-sky-700" role="status">{status} {status.startsWith('Entre') ? <Link href="/login?next=/depoimentos" className="underline">Fazer login</Link> : null}</p> : null}
  </form>;
}
function Field({ name, label, maxLength = 80 }: { name: string; label: string; maxLength?: number }) { return <label className="block text-sm font-bold text-slate-800">{label}<input name={name} required maxLength={maxLength} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" /></label>; }
