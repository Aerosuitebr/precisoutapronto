'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ContabilPreview } from '@/components/contabeis/contabil-preview';
import {
  LiveToolPreviewLayout,
  livePreviewFieldClass
} from '@/components/marketing/tool-landing/live-tool-preview-layout';
import { buildDefaultClauses } from '@/lib/contabeis/clauses';
import { SAMPLE_CONTABIL_DOCUMENT } from '@/lib/contabeis/defaults';
import type { ContabilTemplateId } from '@/lib/contabeis/types';
import { CONTABIL_TEMPLATES } from '@/lib/contabeis/templates';

export function ContabilLivePreview() {
  const [partyAName, setPartyAName] = useState(SAMPLE_CONTABIL_DOCUMENT.partyA.name);
  const [partyBName, setPartyBName] = useState(SAMPLE_CONTABIL_DOCUMENT.partyB.name);
  const [objectDescription, setObjectDescription] = useState('');
  const [templateId, setTemplateId] = useState<ContabilTemplateId>(SAMPLE_CONTABIL_DOCUMENT.templateId);

  const previewData = useMemo(() => {
    const base = {
      ...SAMPLE_CONTABIL_DOCUMENT,
      templateId,
      partyA: { ...SAMPLE_CONTABIL_DOCUMENT.partyA, name: partyAName || SAMPLE_CONTABIL_DOCUMENT.partyA.name },
      partyB: { ...SAMPLE_CONTABIL_DOCUMENT.partyB, name: partyBName || SAMPLE_CONTABIL_DOCUMENT.partyB.name },
      objectDescription: objectDescription || SAMPLE_CONTABIL_DOCUMENT.objectDescription
    };
    return { ...base, clauses: buildDefaultClauses(base) };
  }, [partyAName, partyBName, objectDescription, templateId]);

  const checklist = [
    { label: 'Cliente', done: partyAName.trim().length > 2 },
    { label: 'Escritório / profissional', done: partyBName.trim().length > 2 },
    { label: 'Escopo do serviço', done: objectDescription.trim().length > 5 },
    { label: 'Modelo escolhido', done: true }
  ];
  const completedCount = checklist.filter((item) => item.done).length;

  return (
    <LiveToolPreviewLayout
      form={
        <>
        <div aria-live="polite">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Seu progresso</span>
            <span className="text-xs font-bold text-sky-700">{completedCount}/{checklist.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-600 transition-all"
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full ${
                    item.done ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white'
                  }`}
                  aria-hidden
                >
                  {item.done && <Check className="h-2.5 w-2.5" />}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cnt-partya">
            Cliente
          </label>
          <input
            id="cnt-partya"
            value={partyAName}
            onChange={(event) => setPartyAName(event.target.value)}
            placeholder="Ex: Comércio Norte LTDA"
            className={livePreviewFieldClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cnt-partyb">
            Escritório / profissional
          </label>
          <input
            id="cnt-partyb"
            value={partyBName}
            onChange={(event) => setPartyBName(event.target.value)}
            placeholder="Ex: Escritório Silva Contabilidade"
            className={livePreviewFieldClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cnt-objeto">
            Escopo do serviço
          </label>
          <textarea
            id="cnt-objeto"
            value={objectDescription}
            onChange={(event) => setObjectDescription(event.target.value)}
            placeholder="Ex: escrituração contábil e obrigações acessórias mensais"
            rows={3}
            className={`${livePreviewFieldClass} resize-none`}
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-800">Tipo de documento</span>
          <div className="flex flex-wrap gap-2">
            {CONTABIL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                aria-pressed={templateId === template.id}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  templateId === template.id
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/ferramentas/contabeis"
          className="block w-full rounded-lg bg-sky-600 px-4 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          Continuar e baixar meu documento
        </Link>
        <p className="text-center text-xs font-medium text-slate-500">
          Use grátis no navegador. Conta só depois de duas gerações.
        </p>
        </>
      }
      preview={<ContabilPreview data={previewData} />}
    />
  );
}
