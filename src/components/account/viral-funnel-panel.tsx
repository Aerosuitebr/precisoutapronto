'use client';

import { useEffect, useState } from 'react';
import { Loader2, Network } from 'lucide-react';

interface FunnelRow {
  toolKey: string;
  completed: number;
  shared: number;
  opened: number;
  acted: number;
  activated: number;
  shareRate: number;
  openRate: number;
  actionRate: number;
  activationRate: number;
}

interface FunnelData {
  rows: FunnelRow[];
  continuity: Array<{ toolKey: string; duplicated: number; secondToolUsers: number; duplicationRate: number; secondToolRate: number }>;
  transitions: Array<{ sourceTool: string; targetTool: string; users: number }>;
  flag: { enabled: boolean; rolloutPercent: number } | null;
}

export function ViralFunnelPanel() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<FunnelData | null>(null);

  useEffect(() => {
    setData(null);
    void fetch(`/api/analytics/product-events?days=${days}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((response) => setData(response ? { rows: response.viralFunnel || [], continuity: response.continuity || [], transitions: response.transitions || [], flag: response.flag || null } : { rows: [], continuity: [], transitions: [], flag: null }));
  }, [days]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700"><Network className="h-4 w-4" /> Funil viral por ferramenta</p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-950">Resultado → compartilhamento → novo criador</h2>
          <p className="mt-1 text-sm text-slate-600">Pessoas pseudônimas únicas por etapa; nenhum identificador individual é exibido.</p>
        </div>
        <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">
          <option value={1}>24 horas</option><option value={7}>7 dias</option><option value={30}>30 dias</option>
        </select>
      </div>
      {data && (!data.flag?.enabled || data.flag.rolloutPercent < 100) ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Ingestão canônica {data.flag?.enabled ? `em rollout de ${data.flag.rolloutPercent}%` : 'desligada'}.</strong>{' '}
          Os números abaixo podem representar apenas parte do tráfego.
        </div>
      ) : null}
      {data === null ? <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Calculando…</p> : data.rows.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3">Ferramenta</th><th className="px-3 py-3">Concluíram</th><th className="px-3 py-3">Compartilharam</th><th className="px-3 py-3">Abriram</th><th className="px-3 py-3">Agiram</th><th className="px-3 py-3">Ativaram</th><th className="px-3 py-3">Share rate</th><th className="px-3 py-3">Abertura</th><th className="px-3 py-3">Ativação</th></tr></thead>
            <tbody>{data.rows.map((row) => <tr key={row.toolKey} className="border-b border-slate-100"><td className="px-3 py-3 font-bold text-slate-900">{row.toolKey}</td><Cell value={row.completed} /><Cell value={row.shared} /><Cell value={row.opened} /><Cell value={row.acted} /><Cell value={row.activated} /><Rate value={row.shareRate} /><Rate value={row.openRate} /><Rate value={row.activationRate} /></tr>)}</tbody>
          </table>
        </div>
      ) : <p className="mt-6 text-sm text-slate-500">Ainda não há eventos canônicos suficientes no período.</p>}
      {data?.continuity.length ? <div className="mt-8"><h3 className="text-base font-extrabold text-slate-950">Reutilização e segunda ferramenta</h3><div className="mt-3 overflow-x-auto"><table className="min-w-[680px] w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3">Origem</th><th className="px-3 py-3">Duplicaram</th><th className="px-3 py-3">Taxa de duplicação</th><th className="px-3 py-3">Usaram outra ferramenta</th><th className="px-3 py-3">Taxa de segunda ferramenta</th></tr></thead><tbody>{data.continuity.map((row) => <tr key={row.toolKey} className="border-b border-slate-100"><td className="px-3 py-3 font-bold text-slate-900">{row.toolKey}</td><Cell value={row.duplicated} /><Rate value={row.duplicationRate} /><Cell value={row.secondToolUsers} /><Rate value={row.secondToolRate} /></tr>)}</tbody></table></div></div> : null}
      {data?.transitions.length ? <div className="mt-8"><h3 className="text-base font-extrabold text-slate-950">Primeira próxima ferramenta</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{data.transitions.map((row) => <div key={`${row.sourceTool}-${row.targetTool}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span><strong>{row.sourceTool}</strong> <span className="text-slate-400">→</span> <strong>{row.targetTool}</strong></span><span className="font-black tabular-nums text-emerald-700">{row.users}</span></div>)}</div></div> : null}
    </section>
  );
}

function Cell({ value }: { value: number }) {
  return <td className="px-3 py-3 tabular-nums text-slate-700">{value.toLocaleString('pt-BR')}</td>;
}

function Rate({ value }: { value: number }) {
  return <td className="px-3 py-3 font-bold tabular-nums text-emerald-700">{value.toLocaleString('pt-BR')}%</td>;
}
