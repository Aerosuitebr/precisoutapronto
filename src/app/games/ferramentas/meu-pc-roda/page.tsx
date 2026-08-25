import type { Metadata } from 'next';
import { GamerToolLanding } from '@/components/games/gamer-tool-landing';
import { PcGameChecker } from '@/components/games/pc-game-checker';

export const metadata: Metadata = {
  title: { absolute: 'Meu PC roda este jogo? Comparador grátis | Precisou, Tá Pronto Games' },
  description: 'Meça CPU e gráficos no navegador e receba um relatório visual comparando seu PC com requisitos de jogos populares.',
  alternates: { canonical: '/games/ferramentas/meu-pc-roda' },
  openGraph: {
    title: 'Meu PC roda este jogo? | Precisou, Tá Pronto Games',
    description: 'Execute um diagnóstico local e veja capacidade, gargalos e fidelidade antes de comprar ou instalar.',
    url: '/games/ferramentas/meu-pc-roda',
    type: 'website'
  }
};

const faqs = [
  { question: 'Como saber se meu PC roda um jogo?', answer: 'Autorize o teste ativo para medir processamento e capacidade gráfica no navegador. O relatório combina essas medições com RAM aproximada, espaço informado e requisitos do jogo.' },
  { question: 'Atender ao mínimo garante boa qualidade?', answer: 'Não. A configuração mínima normalmente indica que o jogo abre e pode ser jogado com ajustes reduzidos. Resolução, taxa de quadros e estabilidade variam.' },
  { question: 'Qual é a diferença entre os dois testes?', answer: 'Com consentimento, a ferramenta executa um benchmark curto de CPU e avalia recursos gráficos. Sem consentimento, usa apenas informações passivas disponibilizadas pelo navegador e reduz o percentual de fidelidade.' },
  { question: 'Meus dados são enviados para o servidor?', answer: 'Não. A medição e o relatório são processados no próprio navegador. O site também explica quais informações foram medidas, detectadas ou fornecidas manualmente.' }
];

export default function PcGameCheckerPage() {
  return (
    <GamerToolLanding
      title="Meu PC roda este jogo?"
      eyebrow="Requisitos de jogos"
      description="Meça CPU e capacidade gráfica no navegador, compare RAM e armazenamento com o jogo e receba um relatório visual com gargalos e fidelidade."
      path="/games/ferramentas/meu-pc-roda"
      directAnswer="Para saber se um jogo roda, os quatro pontos precisam ser verificados juntos: processador, placa de vídeo, memória RAM e espaço livre. Atender apenas a um deles não basta."
      steps={[
        'Selecione um jogo disponível no catálogo.',
        'Escolha entre o benchmark ativo autorizado e a análise passiva sem carga.',
        'Complete o espaço livre, se desejar, e leia o relatório visual com gargalos e fidelidade.'
      ]}
      faqs={faqs}
    >
      <PcGameChecker />
    </GamerToolLanding>
  );
}
