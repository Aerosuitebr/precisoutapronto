export type HardwareGuide = {
  slug: string;
  title: string;
  description: string;
  answer: string;
  readTime: string;
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>;
  faq: Array<{ question: string; answer: string }>;
};

export const hardwareGuides: HardwareGuide[] = [
  {
    slug: 'escolher-placa-de-video',
    title: 'Como escolher placa de vídeo para jogos',
    description:
      'Entenda resolução, VRAM, consumo e custo-benefício antes de comprar uma GPU gamer.',
    answer:
      'Escolha a placa de vídeo pela resolução alvo, taxa de frames desejada e o restante do PC. Em 1080p competitivo priorize FPS estável. Em 1440p e 4K, VRAM e potência bruta pesam mais.',
    readTime: '7 min',
    sections: [
      {
        title: 'Comece pela resolução e pelo tipo de jogo',
        paragraphs: [
          'FPS competitivo em 1080p pede taxa alta e estabilidade. RPG e mundo aberto em 1440p ou 4K pedem mais VRAM e rasterização forte.',
          'Liste os 3 jogos que você mais joga. Uma GPU excelente em ray tracing pode ser exagero se o seu dia a dia for CS2 e LoL.'
        ],
        bullets: ['1080p competitivo', '1440p equilibrado', '4K só com folga de orçamento']
      },
      {
        title: 'VRAM, consumo e fonte',
        paragraphs: [
          'Texturas modernas e mods aumentam o uso de VRAM. Em 1440p, 8 GB é piso confortável para muitos títulos atuais. Em 4K, 12 GB ou mais ajuda.',
          'Confira o TDP da placa e a recomendação de fonte do fabricante. Deixe margem. Cabo PCIe de boa qualidade evita stress desnecessário.'
        ]
      },
      {
        title: 'Custo-benefício no Brasil',
        paragraphs: [
          'Compare preço por desempenho em reviews recentes e olhe disponibilidade local. Modelo “certo no papel” que está com ágio alto deixa de ser negócio.',
          'Garantia nacional e loja com nota fiscal importam quando o RMA for necessário.'
        ]
      }
    ],
    faq: [
      {
        question: 'GPU usada vale a pena?',
        answer:
          'Pode valer se houver teste, nota e histórico. Evite mineração pesada sem evidência de saúde do chip e das memórias.'
      },
      {
        question: 'Preciso de ray tracing?',
        answer:
          'Não é obrigatório. Em muitos títulos competitivos o ganho visual não compensa a perda de FPS.'
      }
    ]
  },
  {
    slug: 'processador-para-jogos',
    title: 'Processador para jogos: o que realmente importa',
    description:
      'Núcleos, clock, cache e gargalo com a GPU. Guia prático para montar ou upar o CPU gamer.',
    answer:
      'Para jogos, priorize bom desempenho single-thread e núcleos suficientes para o restante do sistema. Um CPU fraco limita FPS mínimo mesmo com GPU forte.',
    readTime: '6 min',
    sections: [
      {
        title: 'CPU e GPU precisam conversar',
        paragraphs: [
          'Se a placa de vídeo fica ociosa e o processador em 100%, há gargalo de CPU. Isso aparece muito em 1080p com monitores de alta taxa.',
          'Em 4K a GPU costuma ser o limite. Em competitivo 1080p o CPU ganha importância.'
        ]
      },
      {
        title: 'Núcleos, threads e cache',
        paragraphs: [
          'Seis núcleos bem resolvidos cobrem a maioria dos jogos atuais. Oito núcleos dão folga para stream e abas abertas.',
          'Cache grande ajuda em engines modernas. Olhe benchmarks do seu jogo alvo, não só o marketing de geração.'
        ],
        bullets: ['6 núcleos: piso sólido', '8 núcleos: stream e multitask', 'Cooler adequado ao TDP']
      },
      {
        title: 'Placa-mãe e memória',
        paragraphs: [
          'O socket define o caminho de upgrade. DDR4 ainda é ótimo custo. DDR5 faz sentido em plataformas novas com preço saneado.',
          '16 GB em dual channel é o padrão confortável para jogar em 2026. 32 GB ajuda quem edita e streama ao mesmo tempo.'
        ]
      }
    ],
    faq: [
      {
        question: 'Preciso do modelo topo de linha?',
        answer:
          'Quase nunca. O sweet spot costuma estar uma ou duas faixas abaixo do flagship.'
      },
      {
        question: 'AMD ou Intel?',
        answer:
          'Compare preço, temperatura, plataforma e benchmarks dos seus jogos. Ambos entregam ótimos chips gamers.'
      }
    ]
  },
  {
    slug: 'o-que-e-game-engine',
    title: 'O que é uma game engine',
    description:
      'Entenda Unity, Unreal e motores próprios sem juridiquês técnico demais.',
    answer:
      'Uma game engine é o conjunto de ferramentas e sistemas que rodam física, render, áudio, input e assets. O jogo “roda em cima” desse motor.',
    readTime: '5 min',
    sections: [
      {
        title: 'Por que isso aparece nas fichas técnicas',
        paragraphs: [
          'Quando um título usa Unreal Engine 5, por exemplo, recursos como Nanite e Lumen mudam o peso gráfico. Isso explica porque o mesmo PC rende diferente entre jogos.',
          'Engines também afetam mods, ferramentas de criação e bugs típicos de patch.'
        ]
      },
      {
        title: 'Unity, Unreal e motores próprios',
        paragraphs: [
          'Unity é comum em indie e mobile. Unreal aparece muito em AAA e demos técnicas. Estúdios grandes também mantêm engines próprias afinadas ao IP deles.',
          'Nenhuma engine é “melhor” no absoluto. O que importa é o quão bem o time otimizou o jogo.'
        ],
        bullets: ['Render e iluminação', 'Física e colisão', 'Áudio e networking', 'Pipeline de assets']
      },
      {
        title: 'O que o jogador pode fazer',
        paragraphs: [
          'Atualizar a engine em si não é tarefa sua. Atualize o jogo, os drivers e use opções gráficas saneadas.',
          'Se um título Unreal 5 pesa demais, baixe efeitos de iluminação global e upscaling antes de culpar só a GPU.'
        ]
      }
    ],
    faq: [
      {
        question: 'Engine define se o jogo roda bem?',
        answer:
          'Influencia, mas a otimização do estúdio pesa mais. Há jogos leves e pesados na mesma engine.'
      },
      {
        question: 'Preciso saber engine para comprar PC?',
        answer:
          'Não. Use os requisitos do jogo e reviews em resolução realista para a sua tela.'
      }
    ]
  },
  {
    slug: 'montar-pc-gamer-sem-desperdicar',
    title: 'Montar PC gamer sem desperdiçar',
    description:
      'Ordem de compra, gargalos e onde cortar custo sem matar a experiência.',
    answer:
      'Defina resolução e jogos alvo, reserve a maior fatia do orçamento para GPU e um CPU compatível, e não economize na fonte nem no SSD.',
    readTime: '8 min',
    sections: [
      {
        title: 'Ordem mental do orçamento',
        paragraphs: [
          '1) Monitor e taxa de atualização. 2) GPU. 3) CPU + placa-mãe + RAM. 4) Fonte boa. 5) SSD. 6) Gabinete e cooler.',
          'RGB no fim da lista. Luz não sobe elo.'
        ],
        bullets: ['Fonte com selo confiável', 'SSD para SO e jogos', 'Dual channel na RAM']
      },
      {
        title: 'Onde as pessoas erram',
        paragraphs: [
          'GPU topo com CPU antigo demais. Fonte genérica barata. Só 8 GB em dual channel irregular. HD lento para jogos AAA.',
          'Outro erro clássico: comprar tudo “futuro-proof” e ficar sem grana para a placa de vídeo adequada à tela.'
        ]
      },
      {
        title: 'Checklist antes de fechar',
        paragraphs: [
          'Compatibilidade de socket e padrão de memória. Espaço do gabinete para a GPU. Cabos PCIe suficientes na fonte.',
          'Some o consumo estimado e deixe folga. Confirme garantia e política de troca da loja.'
        ]
      }
    ],
    faq: [
      {
        question: 'Notebook gamer ou desktop?',
        answer:
          'Desktop costuma entregar mais FPS por real e upgradability. Notebook vence em mobilidade.'
      },
      {
        question: 'Posso reaproveitar peças?',
        answer:
          'Sim, principalmente gabinete, SSD e periféricos. Fonte só se a potência e os cabos forem adequados à GPU nova.'
      }
    ]
  }
];

export function getHardwareGuide(slug: string) {
  return hardwareGuides.find((guide) => guide.slug === slug);
}
