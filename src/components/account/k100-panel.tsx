'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';

type K100Data = {
  days: number;
  quotes: number;
  newCreators: number;
  k100: number;
  definition: string;
  occupations: Array<{ name: string; quotes: number }>;
};

export function K100Panel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<K100Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetch(`/api/analytics/k100?days=${days}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><BarChart3 className="h-4 w-4" /> Funil K100</p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-950">Novos criadores por 100 orçamentos</h2>
          <p className="mt-1 text-sm text-slate-600">{data?.definition || 'Conversão persistida, calculada a partir dos orçamentos reais.'}</p>
        </div>
        <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">
          <option value={7}>7 dias</option><option value={30}>30 dias</option><option value={90}>90 dias</option>
        </select>
      </div>
      {loading ? <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Calculando…</p> : data ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="K100" value={data.k100.toLocaleString('pt-BR')} highlight />
            <Metric label="Novos criadores" value={String(data.newCreators)} />
            <Metric label="Orçamentos" value={String(data.quotes)} />
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900">Orçamentos por ofício</h3>
            {data.occupations.length ? <div className="mt-3 space-y-2">{data.occupations.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span className="font-medium capitalize text-slate-700">{item.name}</span><strong>{item.quotes}</strong></div>
            ))}</div> : <p className="mt-2 text-sm text-slate-500">Os próximos orçamentos com origem identificada aparecerão aqui.</p>}
          </div>
        </>
      ) : <p className="mt-6 text-sm text-rose-600">Não foi possível carregar o painel.</p>}
    </section>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 text-3xl font-black tabular-nums ${highlight ? 'text-blue-700' : 'text-slate-950'}`}>{value}</p></div>;
}
