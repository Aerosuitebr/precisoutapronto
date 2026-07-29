export const JATO_GAMES = {
  name: 'Jato Games',
  tagline: 'Jogos, setups e dicas sem enrolação.',
  description:
    'Top jogos com setup sugerido, guias de hardware, consoles e lojas confiáveis. Conteúdo evergreen para a rapaziada gamer.',
  path: '/games',
  poweredBy: 'Resolva Jato',
  poweredByHref: '/',
  publishedAt: '2026-07-29',
  nav: [
    { href: '/games', label: 'Início' },
    { href: '/games/top-jogos', label: 'Top jogos' },
    { href: '/games/hardware', label: 'Hardware' },
    { href: '/games/consoles', label: 'Consoles' },
    { href: '/games/lojas', label: 'Lojas' },
    { href: '/busca?categoria=games', label: 'Busca' }
  ]
} as const;
