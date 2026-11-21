'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ResumePreview } from '@/components/curriculo/resume-preview';
import {
  LiveToolPreviewLayout,
  livePreviewFieldClass
} from '@/components/marketing/tool-landing/live-tool-preview-layout';
import { SAMPLE_RESUME } from '@/lib/curriculo/defaults';
import type { ResumeTemplateId } from '@/lib/curriculo/types';
import { RESUME_TEMPLATES } from '@/lib/curriculo/templates';
import { saveAssistantBriefing } from '@/lib/assistant-briefing';

export function CurriculoLivePreview() {
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [experience, setExperience] = useState('');
  const [templateId, setTemplateId] = useState<ResumeTemplateId>(SAMPLE_RESUME.templateId);

  const previewData = useMemo(
    () => ({
      ...SAMPLE_RESUME,
      templateId,
      experiences: experience.trim()
        ? [{ ...SAMPLE_RESUME.experiences[0], description: experience.trim() }, ...SAMPLE_RESUME.experiences.slice(1)]
        : SAMPLE_RESUME.experiences,
      personal: {
        ...SAMPLE_RESUME.personal,
        fullName: fullName || SAMPLE_RESUME.personal.fullName,
        headline: headline || SAMPLE_RESUME.personal.headline
      }
    }),
    [fullName, headline, experience, templateId]
  );

  const checklist = [
    { label: 'Perfil', done: fullName.trim().length > 2 },
    { label: 'Cargo desejado', done: headline.trim().length > 2 },
    { label: 'Um resultado de experiência', done: experience.trim().length > 5 },
    { label: 'Modelo escolhido', done: true }
  ];
  const completedCount = checklist.filter((item) => item.done).length;

  return (
    <LiveToolPreviewLayout
      form={
        <>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Escolha um modelo</p>
            <div className="grid gap-2" role="group" aria-label="Comparar modelos">
              {RESUME_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  aria-pressed={templateId === template.id}
                  className={`flex min-h-12 items-center gap-3 rounded-xl border-2 bg-white p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    templateId === template.id ? 'border-sky-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span aria-hidden className={`h-8 w-1 shrink-0 rounded-full bg-gradient-to-b ${template.previewClass}`} />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{template.name}</span>
                    <span className="block text-sm text-slate-600">{template.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

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
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cv-nome">
              Seu nome
            </label>
            <input
              id="cv-nome"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ex: Ana Paula Mendes"
              autoComplete="name"
              className={livePreviewFieldClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cv-cargo">
              Cargo desejado
            </label>
            <input
              id="cv-cargo"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="Ex: Analista de Marketing Digital"
              aria-describedby="cv-cargo-dica"
              className={livePreviewFieldClass}
            />
            <p id="cv-cargo-dica" className="mt-1 text-xs font-medium text-slate-500">
              Dica: use o mesmo nome do cargo que aparece na vaga.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="cv-experiencia">
              Um resultado da sua última experiência
            </label>
            <textarea
              id="cv-experiencia"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              placeholder="Ex: Aumentei em 30% a taxa de conversão do site em 4 meses"
              rows={3}
              aria-describedby="cv-experiencia-dica"
              className={`${livePreviewFieldClass} resize-none`}
            />
            <p id="cv-experiencia-dica" className="mt-1 text-xs font-medium text-slate-500">
              Dica: use números e resultados, não só tarefas.
            </p>
          </div>

          <Link
            href="/ferramentas/curriculo"
            onClick={() => {
              try {
                saveAssistantBriefing({
                  type: 'curriculo',
                  answers: { name: fullName.trim(), case: headline.trim(), achievement: experience.trim(), template: templateId }
                });
              } catch {
                // Permite abrir o editor mesmo com o armazenamento bloqueado.
              }
            }}
            className="block w-full rounded-lg bg-sky-600 px-4 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            Abrir gerador e baixar PDF
          </Link>
          <p className="text-center text-xs font-medium text-slate-500">
            Continue no editor com o modelo e os dados preenchidos aqui.
          </p>
        </>
      }
      preview={<ResumePreview data={previewData} />}
    />
  );
}
