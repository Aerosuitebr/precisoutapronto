/**
 * Destinos e ângulos para conquista de menções e backlinks.
 * Páginas públicas devem ser indexáveis e úteis o bastante para merecer o link.
 */

export type AuthorityAsset = {
  path: string;
  title: string;
  pitch: string;
  audiences: Array<'mei' | 'rh' | 'educacao' | 'imprensa' | 'parceiros'>;
};

export const AUTHORITY_ASSETS: AuthorityAsset[] = [
  {
    path: '/imprensa',
    title: 'Sala de imprensa',
    pitch: 'Boilerplates, fatos citáveis, logos e contato de mídia.',
    audiences: ['imprensa', 'parceiros']
  },
  {
    path: '/embed',
    title: 'Badges e embeds',
    pitch: 'HTML pronto para blogs e portais linkarem o Resolva Jato.',
    audiences: ['parceiros', 'educacao', 'mei']
  },
  {
    path: '/checklist-cobranca-mei',
    title: 'Checklist de cobrança para MEI',
    pitch: 'Roteiro citável do orçamento ao recibo, com links para ferramentas.',
    audiences: ['mei', 'imprensa', 'parceiros']
  },
  {
    path: '/calculadora-de-rescisao',
    title: 'Calculadora de rescisão',
    pitch: 'Ferramenta educativa de alto volume de busca.',
    audiences: ['rh', 'imprensa']
  },
  {
    path: '/mei-ou-clt',
    title: 'MEI ou CLT',
    pitch: 'Comparador útil para matérias de carreira e negócios.',
    audiences: ['mei', 'rh', 'imprensa']
  },
  {
    path: '/corretor-de-redacao-enem',
    title: 'Corretor de redação ENEM',
    pitch: 'Recurso educacional para portais de educação e vestibulares.',
    audiences: ['educacao', 'imprensa']
  },
  {
    path: '/gerador-de-referencias-abnt',
    title: 'Referências ABNT',
    pitch: 'Utilitário acadêmico fácil de recomendar em guias de TCC.',
    audiences: ['educacao']
  },
  {
    path: '/orcamento-com-pix',
    title: 'Orçamento com Pix',
    pitch: 'Fluxo prático para comunidades MEI e freelancers.',
    audiences: ['mei', 'parceiros']
  }
];

export const PRESS_FACTS = [
  'Nome: Resolva Jato',
  'Domínio canônico: https://resolvajato.com.br',
  'Operação: Aerosuite',
  'Contato de imprensa: contato@resolvajato.com.br',
  'Proposta: ferramentas online grátis para documentos, cobranças, estudos e cálculos no navegador',
  'Acesso: duas gerações livres sem cadastro; conta grátis para continuar',
  'Idiomas da interface pública: português (principal), inglês e espanhol em rotas dedicadas'
] as const;

export const PRESS_STORY_ANGLES = [
  {
    title: 'MEI que perde venda no WhatsApp',
    hook: 'Como um orçamento com Pix reduz o sumiço do cliente depois do “te mando o valor”.',
    link: '/orcamento-com-pix'
  },
  {
    title: 'Rescisão sem planilha',
    hook: 'Ferramenta educativa para estimar saldo, férias, 13º, aviso e FGTS.',
    link: '/calculadora-de-rescisao'
  },
  {
    title: 'ENEM: treino de redação no celular',
    hook: 'Estimativa por competência para o estudante revisar antes da prova.',
    link: '/corretor-de-redacao-enem'
  },
  {
    title: 'Documentos sem Canva Pro',
    hook: 'Currículo, recibo, proposta e contrato em PDF no navegador.',
    link: '/recursos'
  }
] as const;

export function partnerUtm(path: string, source: string, campaign: string) {
  const base = path.startsWith('http') ? path : `https://resolvajato.com.br${path}`;
  const url = new URL(base);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'partner');
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}
