import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Metodologia das calculadoras',
  description: 'Hipóteses, limites e critérios usados nas calculadoras públicas do Resolva Jato.',
  alternates: { canonical: '/metodologia-calculadoras' }
};

export default function MetodologiaCalculadorasPage() {
  return (
    <LegalPage title="Metodologia das calculadoras" subtitle="Estimativas transparentes, não decisões automáticas">
      <p>As calculadoras organizam cenários a partir dos dados informados. Resultados são estimativas educacionais e não substituem folha oficial, contador, advogado, sindicato ou análise individual.</p>
      <h2>Rescisão e verbas trabalhistas</h2>
      <p>A ferramenta separa saldo de salário, férias, décimo terceiro, aviso-prévio e componentes relacionados ao FGTS conforme modalidade selecionada. Médias, convenções coletivas, afastamentos, descontos e decisões específicas podem alterar o resultado.</p>
      <h2>Preço de serviço freelancer</h2>
      <p>A estimativa distribui custos, meta de remuneração, tributos informados e margem pelas horas efetivamente vendáveis. Horas administrativas e risco precisam ser considerados pelo usuário.</p>
      <h2>MEI ou CLT</h2>
      <p>A comparação anualiza remuneração e benefícios informados e contrapõe custos empresariais. Ela não determina enquadramento, vínculo ou ocupação permitida.</p>
      <h2>Conferência e atualização</h2>
      <p>Testamos casos de referência e revisamos fórmulas quando há alteração material. Se o resultado divergir de documento oficial, preserve as entradas usadas e comunique a diferença.</p>
      <p><Link href="/calculadora-de-rescisao" className="font-semibold text-sky-700 hover:underline">Calculadora de rescisão</Link>{' · '}<Link href="/calculadora-de-preco-freelancer" className="font-semibold text-sky-700 hover:underline">Calculadora de preço</Link>{' · '}<Link href="/mei-ou-clt" className="font-semibold text-sky-700 hover:underline">Comparador MEI ou CLT</Link></p>
    </LegalPage>
  );
}
