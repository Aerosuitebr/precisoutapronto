export type ConsoleBlock = {
  id: string;
  name: string;
  blurb: string;
  tips: string[];
  accessories: string[];
};

export const consoleBlocks: ConsoleBlock[] = [
  {
    id: 'playstation',
    name: 'PlayStation',
    blurb:
      'Ecossistema forte em exclusivos, DualSense e PS Plus. Bom equilíbrio entre campanha e multiplayer.',
    tips: [
      'Ative modo desempenho nos jogos que oferecem a opção se você prioriza fluidez.',
      'SSD interno já é rápido. Expansão oficial ajuda se a biblioteca crescer.',
      'Rest Mode com cuidado em updates grandes. Deixe espaço livre para patches.'
    ],
    accessories: ['Headset stereo ou 3D', 'Base de carregamento DualSense', 'Cartão de expansão compatível']
  },
  {
    id: 'xbox',
    name: 'Xbox',
    blurb:
      'Game Pass é o diferencial. Biblioteca rotativa e Quick Resume em vários títulos.',
    tips: [
      'Compare Series S e X pela resolução alvo e se você liga para 4K nativo.',
      'Game Pass Ultimate combina console, PC e nuvem. Avalie se a assinatura cabe no mês.',
      'Storage Expansion Card oficial evita dor de cabeça de compatibilidade.'
    ],
    accessories: ['Controle extra', 'Headset', 'Cartão de expansão Seagate/WD oficial']
  },
  {
    id: 'nintendo',
    name: 'Nintendo',
    blurb:
      'Portátil e TV no mesmo aparelho. Exclusivos primeiro e sessão rápida no sofá ou na viagem.',
    tips: [
      'Cartão microSD de marca boa e classe rápida. Formate no console.',
      'Dock oficial ou certificada reduz risco na TV.',
      'Joy-Con: se houver drift, veja suporte oficial e cuidados de armazenamento.'
    ],
    accessories: ['microSD confiável', 'Case de transporte', 'Pro Controller']
  }
];
