import type { Metadata } from 'next';
import { CostPerHourCalculator } from '@/components/games/gamer-tools';
import { GamerToolLanding } from '@/components/games/gamer-tool-landing';

export const metadata: Metadata = {
  title: { absolute: 'Calculadora de custo por hora de jogo | Jato Games' },
  description: 'Calcule quanto um jogo custa por hora usando preço, DLCs e tempo estimado. Compare compras antes de gastar.',
  alternates: { canonical: '/games/ferramentas/custo-por-hora' },
  openGraph: {
    title: 'Calculadora de custo por hora de jogo | Jato Games',
    description: 'Transforme preço e horas de diversão em uma comparação objetiva para sua próxima compra.',
    url: '/games/ferramentas/custo-por-hora',
    type: 'website'
  }
};

const faqs = [
  {
    question: 'Custo por hora mede a qualidade de um jogo?',
    answer: 'Não. Ele mede apenas a relação entre gasto e tempo de uso. História, diversão, acabamento e preferência pessoal continuam sendo fatores essenciais.'
  },
  {
    question: 'Devo incluir DLCs e microtransações?',
    answer: 'Inclua todo gasto que você considera parte da experiência: jogo base, expansões, passes e compras planejadas. Assim a estimativa fica mais honesta.'
  },
  {
    question: 'Como calcular jogos de assinatura?',
    answer: 'Use a parcela do valor da assinatura que atribui ao jogo e as horas que pretende dedicar a ele. O resultado será uma aproximação, não um custo contábil exato.'
  }
];

export default function CostPerHourPage() {
  return (
    <GamerToolLanding
      title="Calculadora de custo por hora de jogo"
      eyebrow="Compra inteligente"
      description="Divida o investimento total pelas horas que espera jogar e compare títulos, edições e promoções com uma medida simples."
      path="/games/ferramentas/custo-por-hora"
      directAnswer="A fórmula é investimento total ÷ horas jogadas. Um jogo de R$ 200 aproveitado por 80 horas custa R$ 2,50 por hora."
      steps={[
        'Informe o preço do jogo e os gastos adicionais previstos.',
        'Estime quantas horas você realmente pretende jogar.',
        'Compare o custo por hora com outras opções sem tratá-lo como medida de qualidade.'
      ]}
      faqs={faqs}
    >
      <CostPerHourCalculator />
    </GamerToolLanding>
  );
}
