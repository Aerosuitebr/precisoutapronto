export type StoreKind = 'jogo' | 'skin' | 'chave' | 'hardware' | 'console';

export type GameStore = {
  name: string;
  url: string;
  kind: StoreKind;
  blurb: string;
  trustNote: string;
};

export const gameStores: GameStore[] = [
  {
    name: 'Steam',
    url: 'https://store.steampowered.com/',
    kind: 'jogo',
    blurb: 'Loja padrão de PC. Biblioteca, workshop e refund policy conhecida.',
    trustNote: 'Compre pela conta oficial. Desconfie de “Steam barato” em site desconhecido.'
  },
  {
    name: 'Epic Games Store',
    url: 'https://store.epicgames.com/pt-BR/',
    kind: 'jogo',
    blurb: 'Jogos semanais grátis e exclusivos eventuais.',
    trustNote: 'Ative 2FA. O launcher é separado da Steam.'
  },
  {
    name: 'Nuuvem',
    url: 'https://www.nuuvem.com/',
    kind: 'jogo',
    blurb: 'Loja BR com chaves e preços em real em vários catálogos.',
    trustNote: 'Confira se a chave é global ou com restrição de região.'
  },
  {
    name: 'GOG',
    url: 'https://www.gog.com/',
    kind: 'jogo',
    blurb: 'Foco em DRM-free e clássicos.',
    trustNote: 'Bom para quem quer instalar sem launcher obrigatório.'
  },
  {
    name: 'Xbox Store',
    url: 'https://www.xbox.com/pt-BR/microsoft-store',
    kind: 'console',
    blurb: 'Jogos, Game Pass e conteúdo digital Xbox/PC Microsoft.',
    trustNote: 'Use a conta Microsoft com verificação em duas etapas.'
  },
  {
    name: 'PlayStation Store',
    url: 'https://store.playstation.com/pt-br/pages/latest',
    kind: 'console',
    blurb: 'Jogos e add-ons oficiais PlayStation.',
    trustNote: 'Evite gift card de origem duvidosa. Prefira saldo oficial.'
  },
  {
    name: 'Nintendo eShop',
    url: 'https://www.nintendo.com/pt-br/store/',
    kind: 'console',
    blurb: 'Catálogo digital Nintendo.',
    trustNote: 'Controle gastos com saldo e contas infantis.'
  },
  {
    name: 'Steam Community Market',
    url: 'https://steamcommunity.com/market/',
    kind: 'skin',
    blurb: 'Mercado oficial de itens Steam (CS, TF2 e outros).',
    trustNote: 'Trade ban e scams de “middleman” são comuns. Negocie só pelo fluxo oficial.'
  },
  {
    name: 'Skinport',
    url: 'https://skinport.com/',
    kind: 'skin',
    blurb: 'Marketplace conhecido de skins com escrow.',
    trustNote: 'Ainda assim: 2FA Steam, e-mail seguro e nunca compartilhe código.'
  },
  {
    name: 'CS.Money',
    url: 'https://cs.money/',
    kind: 'skin',
    blurb: 'Troca e compra de skins com interface própria.',
    trustNote: 'Leia taxas e confirme o trade no app Steam oficial.'
  },
  {
    name: 'Kabum',
    url: 'https://www.kabum.com.br/',
    kind: 'hardware',
    blurb: 'Hardware e periféricos com operação grande no Brasil.',
    trustNote: 'Compare nota fiscal, garantia e preço em mais de uma loja.'
  },
  {
    name: 'Pichau',
    url: 'https://www.pichau.com.br/',
    kind: 'hardware',
    blurb: 'Peças e PCs montados, forte em público gamer.',
    trustNote: 'Confira compatibilidade e selo da fonte.'
  },
  {
    name: 'Terabyte',
    url: 'https://www.terabyteshop.com.br/',
    kind: 'hardware',
    blurb: 'Componentes e montagem.',
    trustNote: 'Valide prazo e política de RMA antes do PIX alto valor.'
  },
  {
    name: 'Amazon Brasil',
    url: 'https://www.amazon.com.br/',
    kind: 'hardware',
    blurb: 'Periféricos, monitores e alguns componentes.',
    trustNote: 'Prefira sellers bem avaliados e embalagem lacrada.'
  },
  {
    name: 'Magazine Luiza',
    url: 'https://www.magazineluiza.com.br/',
    kind: 'hardware',
    blurb: 'Varejo com opções de console e acessórios.',
    trustNote: 'Confira se o anúncio é do Magalu ou marketplace terceiro.'
  },
  {
    name: 'Green Man Gaming',
    url: 'https://www.greenmangaming.com/',
    kind: 'chave',
    blurb: 'Chaves digitais com promoções frequentes.',
    trustNote: 'Verifique região da key e plataforma (Steam/Epic).'
  },
  {
    name: 'Humble Bundle',
    url: 'https://www.humblebundle.com/',
    kind: 'chave',
    blurb: 'Bundles com parte do valor para caridade e publishers.',
    trustNote: 'Leia quais jogos são Steam key versus redeem no Humble.'
  },
  {
    name: 'Eneba',
    url: 'https://www.eneba.com/',
    kind: 'chave',
    blurb: 'Marketplace de chaves com vários vendedores.',
    trustNote: 'Risco maior que loja oficial. Use só com reputação alta e proteção da plataforma.'
  },
  {
    name: 'Instant Gaming',
    url: 'https://www.instant-gaming.com/pt/',
    kind: 'chave',
    blurb: 'Keys com entrega rápida em várias plataformas.',
    trustNote: 'Confira a região e o jogo exato antes de pagar.'
  },
  {
    name: 'Microsoft Store (PC)',
    url: 'https://apps.microsoft.com/',
    kind: 'jogo',
    blurb: 'Jogos PC Game Pass e títulos Microsoft.',
    trustNote: 'Conta Microsoft única para Xbox e PC facilita o ecossistema.'
  }
];

export const storeSafetyTips = [
  'Nunca envie código de Steam Guard, SMS ou e-mail para “suporte” no Discord ou Instagram.',
  'Desconfie de preço absurdo em skin ou AAA lançamento.',
  'Prefira 2FA em Steam, Epic, PlayStation, Xbox e Nintendo.',
  'Em hardware, priorize nota fiscal e garantia nacional.',
  'Marketplace de key não é loja oficial. Há risco de chargeback e key revogada.'
];
