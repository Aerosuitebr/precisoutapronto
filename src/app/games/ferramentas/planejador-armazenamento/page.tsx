import type { Metadata } from 'next';
import { StoragePlanner } from '@/components/games/gamer-tools';
import { GamerToolLanding } from '@/components/games/gamer-tool-landing';

export const metadata: Metadata = {
  title: { absolute: 'Calculadora de espaço para jogos no SSD | Precisou, Tá Pronto Games' },
  description: 'Some o tamanho dos jogos e descubra quanto espaço reservar no SSD, PC, PlayStation ou Xbox antes de instalar.',
  alternates: { canonical: '/games/ferramentas/planejador-armazenamento' },
  openGraph: {
    title: 'Calculadora de espaço para jogos no SSD | Precisou, Tá Pronto Games',
    description: 'Planeje sua biblioteca e evite descobrir tarde demais que o próximo jogo não cabe.',
    url: '/games/ferramentas/planejador-armazenamento',
    type: 'website'
  }
};

const faqs = [
  {
    question: 'Quanto espaço livre devo manter no SSD?',
    answer: 'Além da soma dos jogos, mantenha uma margem para atualizações, arquivos temporários, sistema e desempenho. A calculadora adiciona uma reserva configurável ao total.'
  },
  {
    question: 'O tamanho informado na loja é exato?',
    answer: 'Nem sempre. Patches, pacotes de idioma, texturas e conteúdo adicional podem aumentar o uso real. Consulte também a página oficial do jogo antes de instalar.'
  },
  {
    question: 'A calculadora serve para PlayStation e Xbox?',
    answer: 'Sim. O planejamento matemático é o mesmo, mas parte do armazenamento anunciado pelo console já é ocupada pelo sistema.'
  }
];

export default function StoragePage() {
  return (
    <GamerToolLanding
      title="Calculadora de espaço para jogos"
      eyebrow="SSD e biblioteca"
      description="Some os jogos que deseja manter instalados, aplique uma margem de segurança e descubra a capacidade que sua biblioteca realmente exige."
      path="/games/ferramentas/planejador-armazenamento"
      directAnswer="Some o tamanho instalado de todos os jogos e acrescente uma margem para atualizações. Uma biblioteca de 400 GB com reserva de 20% exige cerca de 480 GB livres."
      steps={[
        'Adicione o nome e o tamanho estimado de cada jogo.',
        'Escolha uma margem para patches, DLCs e arquivos temporários.',
        'Compare o total recomendado com o espaço realmente livre no dispositivo.'
      ]}
      faqs={faqs}
    >
      <StoragePlanner />
    </GamerToolLanding>
  );
}
