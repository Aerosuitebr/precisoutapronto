'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Calculator, Trash2 } from 'lucide-react';
import {
  loadSavedToolResults,
  removeSavedToolResult,
  RESULT_HISTORY_UPDATED_EVENT,
  type SavedToolResult
} from '@/lib/result-history';
import { trackEvent } from '@/lib/analytics';

export function SavedResultsPanel() {
  const [results, setResults] = useState<SavedToolResult[]>([]);

  useEffect(() => {
    const refresh = () => setResults(loadSavedToolResults());
    refresh();
    window.addEventListener(RESULT_HISTORY_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(RESULT_HISTORY_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <section id="resultados" className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700">
          <Calculator className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">Resultados salvos</h2>
          <p className="text-sm text-slate-600">Cálculos guardados somente neste dispositivo.</p>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Use “Salvar resultado” depois de um cálculo para encontrá-lo aqui.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {results.map((result) => (
            <li key={result.id} className="flex items-center rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50">
              <Link
                href={result.toolPath}
                onClick={() => trackEvent('saved_result_reopened', { tool_path: result.toolPath })}
                className="min-w-0 flex-1 p-4"
              >
                <span className="block truncate text-sm font-bold text-slate-950">{result.title}</span>
                <span className="mt-1 block text-lg font-black text-sky-700">{result.highlightValue}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {result.highlightLabel} · {new Date(result.savedAt).toLocaleDateString('pt-BR')}
                </span>
              </Link>
              <Link href={result.toolPath} aria-label={`Reabrir ${result.title}`} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-white hover:text-sky-700">
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                aria-label={`Excluir ${result.title}`}
                onClick={() => setResults(removeSavedToolResult(result.id))}
                className="mr-3 grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-white hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
