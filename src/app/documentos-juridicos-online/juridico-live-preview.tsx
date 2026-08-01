'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { JuridicoPreview } from '@/components/juridicos/juridico-preview';
import {
  LiveToolPreviewLayout,
  livePreviewFieldClass
} from '@/components/marketing/tool-landing/live-tool-preview-layout';
import { buildDefaultClauses } from '@/lib/juridicos/clauses';
import { SAMPLE_LEGAL_DOCUMENT } from '@/lib/juridicos/defaults';
import type { LegalTemplateId } from '@/lib/juridicos/types';
import { LEGAL_TEMPLATES } from '@/lib/juridicos/templates';

const FEATURED_TEMPLATES = LEGAL_TEMPLATES.filter((template) =>
  ['procuracao', 'honorarios', 'substabelecimento', 'notificacao', 'declaracao-residencia'].includes(template.id)
);

export function JuridicoLivePreview() {
  const [partyAName, setPartyAName] = useState(SAMPLE_LEGAL_DOCUMENT.partyA.name);
  const [partyBName, setPartyBName] = useState(SAMPLE_LEGAL_DOCUMENT.partyB.name);
  const [objectDescription, setObjectDescription] = useState('');
  const [templateId, setTemplateId] = useState<LegalTemplateId>(SAMPLE_LEGAL_DOCUMENT.templateId);

  const previewData = useMemo(() => {
    const base = {
      ...SAMPLE_LEGAL_DOCUMENT,
      templateId,
      partyA: { ...SAMPLE_LEGAL_DOCUMENT.partyA, name: partyAName || SAMPLE_LEGAL_DOCUMENT.partyA.name },
      partyB: { ...SAMPLE_LEGAL_DOCUMENT.partyB, name: partyBName || SAMPLE_LEGAL_DOCUMENT.partyB.name },
      objectDescription: objectDescription || SAMPLE_LEGAL_DOCUMENT.objectDescription
    };
    return { ...base, clauses: buildDefaultClauses(base) };
  }, [partyAName, partyBName, objectDescription, templateId]);

  const checklist = [
    { label: 'Outorgante / cliente', done: partyAName.trim().length > 2 },
    { label: 'Outorgado / advogado', done: partyBName.trim().length > 2 },
    { label: 'Objeto da peça', done: objectDescription.trim().length > 5 },
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
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="jur-partya">
            Outorgante / cliente
          </label>
          <input
            id="jur-partya"
            value={partyAName}
            onChange={(event) => setPartyAName(event.target.value)}
            placeholder="Ex: Ana Paula Ferreira"
            className={livePreviewFieldClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="jur-partyb">
            Outorgado / advogado
          </label>
          <input
            id="jur-partyb"
            value={partyBName}
            onChange={(event) => setPartyBName(event.target.value)}
            placeholder="Ex: Dr. Ricardo Mendes Oliveira"
            className={livePreviewFieldClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="jur-objeto">
            Objeto / causa
          </label>
          <textarea
            id="jur-objeto"
            value={objectDescription}
            onChange={(event) => setObjectDescription(event.target.value)}
            placeholder="Ex: Ação de cobrança e demais medidas cíveis"
            rows={3}
            className={`${livePreviewFieldClass} resize-none`}
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-800">Tipo de documento</span>
          <div className="flex flex-wrap gap-2">
            {FEATURED_TEMPLATES.map((template) => (
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
          href="/ferramentas/juridicos"
          className="block w-full rounded-lg bg-sky-600 px-4 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          Continuar e baixar meu documento
        </Link>
        <p className="text-center text-xs font-medium text-slate-500">
          Use grátis no navegador. Conta só depois de duas gerações.
        </p>
        </>
      }
      preview={<JuridicoPreview data={previewData} />}
    />
  );
}
