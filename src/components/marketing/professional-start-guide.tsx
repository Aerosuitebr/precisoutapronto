import Link from 'next/link';
import { BrickWall, Hammer, PaintRoller, PanelsTopLeft, Snowflake, Zap } from 'lucide-react';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';

const guides = [
  { name: 'Eletricista', path: 'eletricista', icon: Zap, checklist: 'Visita técnica, materiais e instalação.' },
  { name: 'Pintor', path: 'pintor', icon: PaintRoller, checklist: 'Metragem, preparação e acabamento.' },
  { name: 'Marceneiro', path: 'marceneiro', icon: Hammer, checklist: 'Medidas, materiais e montagem.' },
  { name: 'Gesseiro', path: 'gesseiro', icon: PanelsTopLeft, checklist: 'Área, acabamento e prazo.' },
  { name: 'Ar-condicionado', path: 'instalacao-ar-condicionado', icon: Snowflake, checklist: 'Instalação, tubulação e testes.' },
  { name: 'Pedreiro', path: 'pedreiro', icon: BrickWall, checklist: 'Materiais, execução e prazos por etapa.' }
];

export function ProfessionalStartGuide() {
  return (
    <section id="para-profissionais" aria-labelledby="profession-guide-title" className="scroll-mt-32 border-y border-slate-200 bg-slate-50 py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="profession-guide-title" className="precisoutapronto-display text-3xl font-black tracking-tight sm:text-4xl">Modelos de orçamento por profissão</h2>
        <p className="mt-3 text-slate-600">Abra um modelo com itens preenchidos e ajuste os serviços e valores.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map(({ name, path, icon: Icon, checklist }) => (
            <li key={path}>
              <LandingConversionLink href={`/orcamento-para/${path}#montar`} landingPath="/" placement="inline_primary" aria-label={`Criar orçamento para ${name.toLowerCase()}`} className="flex h-full flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md">
                <Icon className="h-6 w-6 text-blue-700" aria-hidden />
                <h3 className="mt-3 text-lg font-bold">{name}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Modelo pronto · Checklist incluso</p>
                <p className="mt-1 flex-1 text-sm leading-6 text-slate-600">{checklist}</p>
                <span className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">Criar orçamento</span>
              </LandingConversionLink>
            </li>
          ))}
        </ul>
        <Link href="/modelos-de-orcamento" className="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-800 hover:underline">Ver todos os modelos de orçamento</Link>
      </div>
    </section>
  );
}
