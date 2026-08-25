import type { Metadata } from 'next';
import { EdpiCalculator } from '@/components/games/gamer-tools';
import { GamerToolLanding } from '@/components/games/gamer-tool-landing';

export const metadata: Metadata = {
  title: { absolute: 'Calculadora de eDPI para FPS | Precisou, Tá Pronto Games' },
  description: 'Calcule seu eDPI usando DPI e sensibilidade do jogo. Compare configurações de mira em CS2, Valorant e outros FPS.',
  alternates: { canonical: '/games/ferramentas/calculadora-edpi' },
  openGraph: {
    title: 'Calculadora de eDPI para FPS | Precisou, Tá Pronto Games',
    description: 'Descubra seu eDPI em segundos e registre uma referência consistente para ajustar sua mira.',
    url: '/games/ferramentas/calculadora-edpi',
    type: 'website'
  }
};

const faqs = [
  {
    question: 'O que é eDPI?',
    answer: 'eDPI é o resultado da multiplicação do DPI do mouse pela sensibilidade configurada no jogo. Ele cria uma referência simples para comparar configurações dentro do mesmo jogo.'
  },
  {
    question: 'Posso comparar o eDPI de jogos diferentes?',
    answer: 'Não diretamente. Cada jogo interpreta a sensibilidade de maneira própria. Use o eDPI para comparar configurações do mesmo jogo e conversores específicos ao migrar entre títulos.'
  },
  {
    question: 'Um eDPI baixo é sempre melhor?',
    answer: 'Não. O melhor valor depende do espaço disponível, pegada do mouse, função no jogo e conforto. O objetivo é consistência, controle e ausência de esforço excessivo.'
  }
];

export default function EdpiPage() {
  return (
    <GamerToolLanding
      title="Calculadora de eDPI para jogos FPS"
      eyebrow="Mira e sensibilidade"
      description="Multiplique automaticamente o DPI do mouse pela sensibilidade do jogo e obtenha uma referência clara para testar e comparar sua configuração."
      path="/games/ferramentas/calculadora-edpi"
      directAnswer="A fórmula é DPI × sensibilidade. Por exemplo: 800 DPI com sensibilidade 0,35 resulta em 280 eDPI."
      steps={[
        'Informe o DPI configurado no software ou botão do seu mouse.',
        'Digite a sensibilidade usada dentro do jogo.',
        'Use o eDPI calculado como referência ao testar novos ajustes no mesmo título.'
      ]}
      faqs={faqs}
    >
      <EdpiCalculator />
    </GamerToolLanding>
  );
}
