import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';

const guides = [
  { name: 'Eletricistas', path: 'eletricista', tasks: ['Separe visita, materiais e mão de obra.', 'Descreva pontos, circuitos e testes incluídos.', 'Combine prazo, entrada e saldo antes de executar.'] },
  { name: 'Pintores', path: 'pintor', tasks: ['Informe ambientes, área e preparação das superfícies.', 'Defina quem fornece tinta e demais materiais.', 'Registre acabamento, prazo e condições de pagamento.'] },
  { name: 'Manutenção residencial', path: 'manutencao-residencial', tasks: ['Descreva diagnóstico, reparos e peças.', 'Separe deslocamento e serviços adicionais.', 'Combine ajustes antes de executar e registre cada pagamento.'] }
] as const;

export function ProfessionalStartGuide() {
  return <section aria-labelledby="profession-guide-title" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Comece pelo seu serviço</p>
    <h2 id="profession-guide-title" className="mt-3 text-3xl font-black text-slate-950">Um modelo e um checklist para atender melhor.</h2>
    <p className="mt-3 max-w-3xl leading-7 text-slate-600">Escolha o serviço, ajuste os itens e seus preços e confira a prévia. Os exemplos são ilustrativos; o escopo deve refletir o atendimento real.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-3">{guides.map(guide => <article key={guide.path} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-xl font-bold">{guide.name}</h3>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-600">{guide.tasks.map(task => <li key={task}>{task}</li>)}</ul>
      <LandingConversionLink href={`/orcamento-para/${guide.path}#montar`} landingPath="/" placement="inline_primary" className="mt-5 inline-flex min-h-11 items-center font-bold text-blue-800 underline underline-offset-4">Abrir modelo de {guide.name.toLowerCase()}</LandingConversionLink>
    </article>)}</div>
  </section>;
}
