'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Check, ChevronLeft } from 'lucide-react';

type AssistantType = 'contrato' | 'curriculo' | 'recibo' | 'proposta';
const flows: Record<AssistantType, { label: string; editor: string; questions: Array<{ key: string; label: string; placeholder: string }> }> = {
  contrato: { label: 'Contrato de serviço', editor: '/gerador-de-contrato', questions: [
    { key: 'case', label: 'Qual serviço será prestado?', placeholder: 'Ex.: gestão de redes sociais por 3 meses' },
    { key: 'payment', label: 'Como será o pagamento?', placeholder: 'Ex.: R$ 1.500 no dia 10 de cada mês' },
    { key: 'risk', label: 'Existe prazo, multa ou dado sensível?', placeholder: 'Conte os pontos que exigem mais cuidado' }
  ] },
  curriculo: { label: 'Currículo', editor: '/gerador-de-curriculo', questions: [
    { key: 'case', label: 'Qual vaga você procura?', placeholder: 'Ex.: auxiliar administrativo' },
    { key: 'payment', label: 'Quais experiências, projetos ou cursos possui?', placeholder: 'Inclua resultados e atividades relevantes' },
    { key: 'risk', label: 'Quais competências quer destacar?', placeholder: 'Ex.: Excel, atendimento e organização' }
  ] },
  recibo: { label: 'Recibo', editor: '/gerador-de-recibo', questions: [
    { key: 'case', label: 'O que foi pago?', placeholder: 'Descreva o serviço ou produto' },
    { key: 'payment', label: 'Qual o valor e a forma de pagamento?', placeholder: 'Ex.: R$ 350 via Pix' },
    { key: 'risk', label: 'Quem pagou e quem recebeu?', placeholder: 'Nomes e documentos, se necessário' }
  ] },
  proposta: { label: 'Proposta comercial', editor: '/gerador-de-proposta-comercial', questions: [
    { key: 'case', label: 'Qual problema será resolvido?', placeholder: 'Contexto e resultado esperado' },
    { key: 'payment', label: 'Qual o investimento?', placeholder: 'Valor, parcelas e validade' },
    { key: 'risk', label: 'Quais são as entregas e limites?', placeholder: 'Escopo, revisões e prazo' }
  ] }
};

export function DocumentAssistant({ initialType = 'contrato' }: { initialType?: AssistantType }) {
  const [type, setType] = useState<AssistantType>(initialType);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const flow = flows[type];
  const complete = step >= flow.questions.length;
  const summary = useMemo(() => flow.questions.map((q) => answers[q.key]).filter(Boolean), [answers, flow.questions]);

  function changeType(next: AssistantType) { setType(next); setStep(0); setAnswers({}); }

  return <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
    <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Bot /></span><div><p className="font-bold text-slate-950">Assistente Resolva Jato</p><p className="text-sm text-slate-500">Organiza o caso antes de abrir o editor atual</p></div></div>
    <div className="mt-6 flex gap-2 overflow-x-auto">{(Object.keys(flows) as AssistantType[]).map((item) => <button key={item} onClick={() => changeType(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${type === item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>{flows[item].label}</button>)}</div>
    {!complete ? <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Etapa {step + 1} de {flow.questions.length}</p><label className="mt-3 block text-xl font-bold text-slate-950">{flow.questions[step].label}</label><textarea autoFocus value={answers[flow.questions[step].key] || ''} onChange={(e) => setAnswers({ ...answers, [flow.questions[step].key]: e.target.value })} placeholder={flow.questions[step].placeholder} className="mt-4 min-h-32 w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-emerald-500" /><div className="mt-5 flex justify-between"><button disabled={!step} onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 disabled:opacity-30"><ChevronLeft className="h-4 w-4" />Voltar</button><button disabled={!answers[flow.questions[step].key]?.trim()} onClick={() => setStep(step + 1)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-40">Continuar<ArrowRight className="h-4 w-4" /></button></div></div> :
    <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Briefing concluído</p><h2 className="mt-3 text-2xl font-extrabold text-slate-950">Sua primeira versão está pronta para o editor</h2><ul className="mt-5 space-y-3">{summary.map((item) => <li key={item} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul><div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Revise nomes, valores, datas e riscos antes de usar. O assistente oferece apoio geral e não substitui aconselhamento profissional.</div><div className="mt-6 flex flex-wrap gap-3"><Link href={`${flow.editor}?assistant=1`} className="inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 font-bold text-white">Abrir editor<ArrowRight className="h-4 w-4" /></Link><button onClick={() => setStep(0)} className="h-12 rounded-xl border border-slate-300 px-5 font-bold text-slate-700">Revisar respostas</button></div></div>}
  </div>;
}
