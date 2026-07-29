export type SpecTier = {
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  note?: string;
};

export type GameEntry = {
  slug: string;
  rank: number;
  title: string;
  genres: string[];
  platforms: string[];
  blurb: string;
  whyPopular: string;
  tips: string[];
  setupMin: SpecTier;
  setupRec: SpecTier;
};

export const gamesCatalog: GameEntry[] = [
  {
    slug: 'counter-strike-2',
    rank: 1,
    title: 'Counter-Strike 2',
    genres: ['FPS', 'Competitivo'],
    platforms: ['PC'],
    blurb:
      'O FPS tático mais jogado no Brasil. Partidas rápidas, economia de round e cena competitiva forte.',
    whyPopular:
      'Baixa barreira de entrada, comunidade enorme e meta constante. Ideal para quem curte mirar fino e jogar em time.',
    tips: [
      'Priorize monitor 144 Hz ou mais e mouse estável antes de gastar em RGB.',
      'Feche overlays pesados se a taxa de frames oscilar no clutch.',
      'Treine mira em map workshop 10 a 15 minutos antes da ranked.'
    ],
    setupMin: {
      cpu: 'Intel Core i5 equivalente / Ryzen 5',
      gpu: 'GTX 1650 / RX 580',
      ram: '8 GB',
      storage: 'SSD 85 GB+',
      note: 'Jogável em 1080p baixo/médio.'
    },
    setupRec: {
      cpu: 'Ryzen 5 5600 / Intel i5 recente',
      gpu: 'RTX 3060 / RX 6600 ou superior',
      ram: '16 GB',
      storage: 'SSD NVMe',
      note: 'Busque 240+ FPS estáveis em 1080p competitivo.'
    }
  },
  {
    slug: 'league-of-legends',
    rank: 2,
    title: 'League of Legends',
    genres: ['MOBA'],
    platforms: ['PC'],
    blurb:
      'MOBA gratuito com temporadas, ranks e uma base gigante de criadores e campeonatos.',
    whyPopular:
      'Partidas de cerca de 30 minutos, progressão clara e cena BR ativa. Funciona bem em PCs medianos.',
    tips: [
      'Estude 2 a 3 campeões por rota em vez de abrir o roster inteiro.',
      'Use mute se o chat atrapalhar a concentração.',
      'Atualize drivers da GPU após patches grandes de cliente.'
    ],
    setupMin: {
      cpu: 'Intel Core i3 / Ryzen 3',
      gpu: 'GPU integrada recente ou GTX 1050',
      ram: '8 GB',
      storage: 'SSD 20 GB+'
    },
    setupRec: {
      cpu: 'Ryzen 5 / Intel i5',
      gpu: 'GTX 1660 / RTX 3050',
      ram: '16 GB',
      storage: 'SSD',
      note: 'Mais FPS ajuda em teamfights caóticas.'
    }
  },
  {
    slug: 'valorant',
    rank: 3,
    title: 'Valorant',
    genres: ['FPS', 'Tático'],
    platforms: ['PC', 'Console'],
    blurb:
      'Shooter tático com agentes e habilidades. Mistura mira de CS com utilitário de herói.',
    whyPopular:
      'Anti-cheat rigoroso, ranks claros e crossover fácil para quem vem de outros FPS.',
    tips: [
      'Sensibilidade baixa e consistente costuma render mais do que DPI alto.',
      'Aprenda um duelista e um controlador antes de expandir o pool.',
      'No notebook, use modo desempenho e cabo Ethernet quando possível.'
    ],
    setupMin: {
      cpu: 'Intel i5- equivalência recente / Ryzen 5',
      gpu: 'GTX 1050 Ti / RX 570',
      ram: '8 GB',
      storage: 'SSD 40 GB+'
    },
    setupRec: {
      cpu: 'Ryzen 5 5600X / Intel i5 12ª gen+',
      gpu: 'RTX 3060 / RX 6600',
      ram: '16 GB',
      storage: 'SSD NVMe',
      note: 'VSync off e limite de FPS alinhado ao monitor.'
    }
  },
  {
    slug: 'grand-theft-auto-v',
    rank: 4,
    title: 'Grand Theft Auto V',
    genres: ['Ação', 'Mundo aberto'],
    platforms: ['PC', 'PlayStation', 'Xbox'],
    blurb:
      'Mundo aberto clássico com campanha e GTA Online. Ainda é referência de sessão com amigos.',
    whyPopular:
      'Conteúdo infinito no Online, mods no PC e presença forte em live e short video.',
    tips: [
      'No PC, comece pelo preset alto e baixe sombras se o 1% low cair.',
      'Backup de saves e cuidado com mods de fonte duvidosa.',
      'Em console, SSD interno ou expansão oficial reduz tela de carregamento.'
    ],
    setupMin: {
      cpu: 'Intel Core i5 / AMD FX-6300 era',
      gpu: 'GTX 770 / Radeon R9 280',
      ram: '8 GB',
      storage: 'HDD/SSD 100 GB+',
      note: 'Mínimo oficial é antigo; SSD melhora muito a experiência.'
    },
    setupRec: {
      cpu: 'Ryzen 5 / Intel i5 moderno',
      gpu: 'RTX 3060 / RX 6700',
      ram: '16 GB',
      storage: 'SSD',
      note: '1080p/1440p alto com mods leves.'
    }
  },
  {
    slug: 'minecraft',
    rank: 5,
    title: 'Minecraft',
    genres: ['Sandbox', 'Sobrevivência'],
    platforms: ['PC', 'Console', 'Mobile'],
    blurb:
      'Sandbox eterno. Criar, sobreviver, redstone e servidores com a galera.',
    whyPopular:
      'Funciona do celular ao PC high-end. Comunidade BR enorme em survival e minigames.',
    tips: [
      'Java Edition no PC abre mais mods; Bedrock facilita crossplay.',
      'Alocar RAM demais no launcher pode piorar stutter. Comece com 4 a 6 GB.',
      'Shaders pedem GPU dedicada; vanilla roda em máquina fraca.'
    ],
    setupMin: {
      cpu: 'Dual-core moderno',
      gpu: 'Integrada recente',
      ram: '4 GB (8 GB melhor)',
      storage: 'SSD 2 GB+'
    },
    setupRec: {
      cpu: 'Ryzen 5 / Intel i5',
      gpu: 'GTX 1660 / RTX 3050',
      ram: '16 GB',
      storage: 'SSD',
      note: 'Para shaders e render distance alto.'
    }
  },
  {
    slug: 'fortnite',
    rank: 6,
    title: 'Fortnite',
    genres: ['Battle royale'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'],
    blurb:
      'Battle royale com construção, temporadas e eventos culturais constantes.',
    whyPopular:
      'Grátis, crossplay e atualizações frequentes. Fácil entrar com amigos em qualquer plataforma.',
    tips: [
      'Modo desempenho no PC ajuda em máquinas limitadas.',
      'Priorize áudio de passos e FOV confortável em vez de gráficos épicos.',
      'Em TV, ative modo jogo para reduzir input lag.'
    ],
    setupMin: {
      cpu: 'Core i5 / Ryzen 5 geração recente',
      gpu: 'GTX 960 / RX 470',
      ram: '8 GB',
      storage: 'SSD 30 GB+'
    },
    setupRec: {
      cpu: 'Ryzen 5 5600 / Intel i5 12ª+',
      gpu: 'RTX 3060 / RX 6600',
      ram: '16 GB',
      storage: 'SSD NVMe'
    }
  },
  {
    slug: 'elden-ring',
    rank: 7,
    title: 'Elden Ring',
    genres: ['Action RPG', 'Souls'],
    platforms: ['PC', 'PlayStation', 'Xbox'],
    blurb:
      'RPG de ação em mundo aberto com exploração densa e combate exigente.',
    whyPopular:
      'Liberdade de rota, lore profunda e rejogabilidade alta. Hit de crítica e comunidade.',
    tips: [
      'Explore laterais antes de forçar o boss da área.',
      'No PC, mantenha DirectX 12 e atualize a GPU após patches.',
      'Controle é confortável; teclado e mouse também funcionam bem.'
    ],
    setupMin: {
      cpu: 'Intel i5-8400 / Ryzen 3 3300X',
      gpu: 'GTX 1060 3GB / RX 580 4GB',
      ram: '12 GB',
      storage: 'SSD 60 GB+'
    },
    setupRec: {
      cpu: 'Intel i7-8700K / Ryzen 5 5600X',
      gpu: 'RTX 3070 / RX 6700 XT',
      ram: '16 GB',
      storage: 'SSD NVMe',
      note: '1440p alto/ultra com folga.'
    }
  },
  {
    slug: 'free-fire',
    rank: 8,
    title: 'Free Fire',
    genres: ['Battle royale', 'Mobile'],
    platforms: ['Mobile'],
    blurb:
      'Battle royale mobile dominante no Brasil. Partidas curtas e acessíveis.',
    whyPopular:
      'Roda em aparelhos modestos, tem cena de criadores forte e é fácil jogar no ônibus ou intervalo.',
    tips: [
      'Feche apps em segundo plano antes da ranked.',
      'Use fone para ouvir passos; áudio conta mais que skin.',
      'Evite recargas em sites sem reputação. Prefira canais oficiais da loja.'
    ],
    setupMin: {
      cpu: 'Chip mid-range recente',
      gpu: 'GPU mobile integrada',
      ram: '3 a 4 GB',
      storage: 'Espaço livre 2 GB+',
      note: 'Android/iOS compatível conforme loja.'
    },
    setupRec: {
      cpu: 'Flagship ou upper mid dos últimos 2 anos',
      gpu: 'GPU mobile forte',
      ram: '6 a 8 GB',
      storage: 'UFS rápido',
      note: 'Taxa alta e gráficos estáveis no competitivo.'
    }
  },
  {
    slug: 'roblox',
    rank: 9,
    title: 'Roblox',
    genres: ['Plataforma', 'UGC'],
    platforms: ['PC', 'Console', 'Mobile'],
    blurb:
      'Plataforma de experiências criadas pela comunidade. Do tycoon ao terror cooperativo.',
    whyPopular:
      'Grátis para jogar, social e sempre com título novo viralizando entre amigos e escola.',
    tips: [
      'Ative autenticação em duas etapas na conta.',
      'Monitore gastos com Robux, principalmente em conta compartilhada.',
      'No PC fraco, reduza gráficos no app e feche navegador pesado.'
    ],
    setupMin: {
      cpu: 'Dual-core moderno',
      gpu: 'Integrada',
      ram: '4 GB',
      storage: 'SSD recomendado'
    },
    setupRec: {
      cpu: 'Quad-core recente',
      gpu: 'GTX 1650 / equivalente',
      ram: '8 a 16 GB',
      storage: 'SSD'
    }
  },
  {
    slug: 'ea-sports-fc',
    rank: 10,
    title: 'EA Sports FC',
    genres: ['Esporte', 'Futebol'],
    platforms: ['PC', 'PlayStation', 'Xbox'],
    blurb:
      'Simulador de futebol atual da EA. Ultimate Team, modos de clube e partidas rápidas.',
    whyPopular:
      'Paixão nacional por futebol + multiplayer. Forte em console e nas lives de Ultimate Team.',
    tips: [
      'Em TV, use modo jogo e, se possível, monitor para competitive.',
      'SSD reduz travadas de carregamento de estádios e menus.',
      'No PC, limite FPS ao refresh do monitor para input mais previsível.'
    ],
    setupMin: {
      cpu: 'Intel i5-6600K / AMD Ryzen equivalente',
      gpu: 'GTX 1050 Ti / RX 570',
      ram: '8 GB',
      storage: 'SSD 100 GB+'
    },
    setupRec: {
      cpu: 'Ryzen 5 5600X / Intel i5 12ª+',
      gpu: 'RTX 3060 Ti / RX 6700',
      ram: '16 GB',
      storage: 'SSD NVMe',
      note: '1080p/1440p alto com estabilidade.'
    }
  }
];

export function getGame(slug: string) {
  return gamesCatalog.find((game) => game.slug === slug);
}

export function listGamesByRank() {
  return [...gamesCatalog].sort((a, b) => a.rank - b.rank);
}
