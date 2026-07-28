'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ContratoPreview } from '@/components/contratos/contrato-preview';
import {
  LiveToolPreviewLayout,
  livePreviewFieldClass
} from '@/components/marketing/tool-landing/live-tool-preview-layout';
import { buildDefaultClauses } from '@/lib/contratos/clauses';
import { SAMPLE_CONTRATO } from '@/lib/contratos/defaults';
import type { ContractTemplateId } from '@/lib/contratos/types';
import { CONTRACT_TEMPLATES } from '@/lib/contratos/templates';

export function ContratoLivePreview() {
  const [partyAName, setPartyAName] = useState(SAMPLE_CONTRATO.partyA.name);
  const [partyBName, setPartyBName] = useState(SAMPLE_CONTRATO.partyB.name);
  const [objectDescription, setObjectDescription] = useState('');
  const [templateId, setTemplateId] = useState<ContractTemplateId>(SAMPLE_CONTRATO.templateId);

  const previewData = useMemo(() => {
    const base = {
      ...SAMPLE_CONTRATO,
      templateId,
      partyA: { ...SAMPLE_CONTRATO.partyA, name: partyAName || SAMPLE_CONTRATO.partyA.name },
      partyB: { ...SAMPLE_CONTRATO.partyB, name: partyBName || SAMPLE_CONTRATO.partyB.name },
      objectDescription: objectDescription || SAMPLE_CONTRATO.objectDescription
    };
    return { ...base, clauses: buildDefaultClauses(base) };
  }, [partyAName, partyBName, objectDescription, templateId]);

  const checklist = [
    { label: 'Contratante', done: partyAName.trim().length > 2 },
    { label: 'Contratado(a)', done: partyBName.trim().length > 2 },
    { label: 'Objeto do contrato', done: objectDescription.trim().length > 5 },
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
              <span className="text-xs font-bold text-sky-700">
                {completedCount}/{checklist.length}
              </span>
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
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="ctr-partya">
              Contratante
            </label>
            <input
              id="ctr-partya"
              value={partyAName}
              onChange={(event) => setPartyAName(event.target.value)}
              placeholder="Ex: Studio Norte Comunicação LTDA"
              className={livePreviewFieldClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="ctr-partyb">
              Contratado(a)
            </label>
            <input
              id="ctr-partyb"
              value={partyBName}
              onChange={(event) => setPartyBName(event.target.value)}
              placeholder="Ex: Mariana Alves Costa"
              className={livePreviewFieldClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="ctr-objeto">
              Objeto do contrato
            </label>
            <textarea
              id="ctr-objeto"
              value={objectDescription}
              onChange={(event) => setObjectDescription(event.target.value)}
              placeholder="Ex: Criação de identidade visual completa para lançamento de produto"
              rows={3}
              className={`${livePreviewFieldClass} resize-none`}
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-800">Tipo de contrato</span>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_TEMPLATES.map((template) => (
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
            href="/cadastro?next=/ferramentas/contratos"
            className="block w-full rounded-lg bg-sky-600 px-4 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            Continuar e baixar meu contrato
          </Link>
          <p className="text-center text-xs font-medium text-slate-500">
            Conta grátis para baixar o PDF. Sem cartão.
          </p>
        </>
      }
      preview={<ContratoPreview data={previewData} />}
    />
  );
}
