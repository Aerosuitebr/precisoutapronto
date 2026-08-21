'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CanonicalHistoryItem {
  id: string;
  artifactType: string;
  toolKey: string;
  title: string | null;
  status: string;
  updatedAt: string;
}

interface CanonicalHistoryResponse {
  enabled?: boolean;
  items?: CanonicalHistoryItem[];
}

const TOOL_LINKS: Record<string, string> = {
  orcamentos: '/ferramentas/orcamentos',
  recibos: '/ferramentas/recibos',
  propostas: '/ferramentas/propostas',
  contratos: '/ferramentas/contratos',
  pix: '/ferramentas/pix'
};

const TOOL_LABELS: Record<string, string> = {
  orcamentos: 'Orçamento',
  recibos: 'Recibo',
  propostas: 'Proposta',
  contratos: 'Contrato',
  pix: 'Pix'
};

export function SmartHistoryPanel() {
  const [history, setHistory] = useState<CanonicalHistoryResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/artifacts/history?limit=10', { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() as Promise<CanonicalHistoryResponse> : null)
      .then((payload) => { if (active && payload) setHistory(payload); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const items = history?.items || [];
  if (!history?.enabled || items.length === 0) return null;

  return (
    <section aria-labelledby="smart-history-title" className="rounded-[28px] border border-sky-200 bg-sky-50/60 p-6 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-sky-100 p-3 text-sky-700"><Sparkles className="h-5 w-5" aria-hidden /></span>
        <div>
          <h2 id="smart-history-title" className="text-lg font-bold text-slate-950">Histórico inteligente</h2>
          <p className="mt-1 text-sm text-slate-600">Atividades recentes organizadas por tarefa, sem alterar seus documentos salvos.</p>
        </div>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-sky-100 bg-white p-4">
            <p className="font-semibold text-slate-900">{item.title || TOOL_LABELS[item.toolKey] || item.artifactType}</p>
            <p className="mt-1 text-xs text-slate-500">
              Atualizado em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(item.updatedAt))}
            </p>
            {TOOL_LINKS[item.toolKey] ? (
              <Link href={TOOL_LINKS[item.toolKey]} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900">
                Abrir ferramenta <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
