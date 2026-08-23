'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
type Row = { id: string; publicName: string; profession: string; city: string; state: string; toolKey: string; quote: string; status: string; createdAt: string };
export function TestimonialModerationPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const load = () => void fetch('/api/internal/testimonials', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => setRows(data?.rows || []));
  useEffect(load, []);
  async function decide(id: string, status: 'approved' | 'rejected') { await fetch('/api/internal/testimonials', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); load(); }
  return <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold text-slate-950">Moderação de depoimentos</h2><p className="mt-1 text-sm text-slate-600">Aprovação humana obrigatória antes da publicação.</p><div className="mt-5 space-y-3">{rows.length ? rows.map(row => <article key={row.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold">{row.publicName} · {row.profession} · {row.city}/{row.state}</p><span className="text-xs font-bold uppercase text-slate-500">{row.status}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">“{row.quote}”</p>{row.status === 'pending' ? <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => void decide(row.id, 'approved')}>Aprovar</Button><Button size="sm" variant="outline" onClick={() => void decide(row.id, 'rejected')}>Rejeitar</Button></div> : null}</article>) : <p className="text-sm text-slate-500">Nenhum relato recebido.</p>}</div></section>;
}
