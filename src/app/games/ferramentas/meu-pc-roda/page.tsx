import type { Metadata } from 'next';
import { GamerToolLanding } from '@/components/games/gamer-tool-landing';
import { PcGameChecker } from '@/components/games/pc-game-checker';

export const metadata: Metadata = {
  title: { absolute: 'Meu PC roda este jogo? Comparador grátis | Jato Games' },
  description: 'Compare CPU, placa de vídeo, RAM e espaço livre com requisitos mínimos e recomendados de jogos populares.',
  alternates: { canonical: '/games/ferramentas/meu-pc-roda' },
  openGraph: {
    title: 'Meu PC roda este jogo? | Jato Games',
    description: 'Compare seu PC com requisitos mínimos e recomendados antes de comprar ou instalar.',
    url: '/games/ferramentas/meu-pc-roda',
    type: 'website'
  }
};

const faqs = [
  { question: 'Como saber se meu PC roda um jogo?', answer: 'Compare o modelo de CPU e GPU, a quantidade de RAM e o espaço livre com os requisitos do jogo. Depois confirme em benchmarks do mesmo hardware e nos requisitos oficiais.' },
  { question: 'Atender ao mínimo garante boa qualidade?', answer: 'Não. A configuração mínima normalmente indica que o jogo abre e pode ser jogado com ajustes reduzidos. Resolução, taxa de quadros e estabilidade variam.' },
  { question: 'Por que a ferramenta não faz benchmark automático?', answer: 'Navegadores não identificam com precisão todas as peças nem medem o desempenho real com segurança. Por isso, o comparador é transparente e usa as informações fornecidas pelo usuário.' }
];

export default function PcGameCheckerPage() {
  return (
    <GamerToolLanding
      title="Meu PC roda este jogo?"
      eyebrow="Requisitos de jogos"
      description="Escolha um jogo, compare CPU, GPU, RAM e armazenamento e encontre possíveis gargalos antes de comprar ou baixar."
      path="/games/ferramentas/meu-pc-roda"
      directAnswer="Para saber se um jogo roda, os quatro pontos precisam ser verificados juntos: processador, placa de vídeo, memória RAM e espaço livre. Atender apenas a um deles não basta."
      steps={[
        'Selecione um jogo disponível no catálogo.',
        'Compare os modelos da sua CPU e GPU com as referências exibidas.',
        'Informe RAM e espaço livre e leia o diagnóstico orientativo.'
      ]}
      faqs={faqs}
    >
      <PcGameChecker />
    </GamerToolLanding>
  );
}
