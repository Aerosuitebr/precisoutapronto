/**
 * Destinos e ângulos para conquista de menções e backlinks.
 * Páginas públicas devem ser indexáveis e úteis o bastante para merecer o link.
 */

import { BRAND_CATEGORY, BRAND_PUBLIC_EMAIL, BRAND_NAME, BRAND_SITE } from '@/lib/brand';

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
    pitch: 'HTML pronto para blogs e portais linkarem o Precisou, Tá Pronto.',
    audiences: ['parceiros', 'educacao', 'mei']
  },
  {
    path: '/checklist-cobranca-mei',
    title: 'Checklist de cobrança para MEI',
    pitch: 'Roteiro citável do orçamento ao recibo, com links para ferramentas.',
    audiences: ['mei', 'imprensa', 'parceiros']
  },
  {
    path: '/modelos-de-orcamento',
    title: 'Modelos de orçamento por profissão',
    pitch: 'Exemplos preenchidos com escopo, materiais e condições para prestadores de serviço.',
    audiences: ['mei', 'imprensa', 'parceiros']
  },
  {
    path: '/orcamento-com-pix',
    title: 'Orçamento com Pix',
    pitch: 'Fluxo prático para comunidades MEI e freelancers.',
    audiences: ['mei', 'parceiros']
  }
];

export const PRESS_FACTS = [
  `Nome: ${BRAND_NAME}`,
  `Domínio canônico: ${BRAND_SITE}`,
  'Único domínio oficial da plataforma. Endereços anteriores redirecionam para o mesmo caminho.',
  'Operação: Aerosuite',
  `Contato de imprensa: ${BRAND_PUBLIC_EMAIL}`,
  `Proposta: ${BRAND_CATEGORY}`,
  'Acesso: orçamento e recibo sem cadastro; conta grátis para histórico; plano Premium para remover a marca',
  'Idiomas da interface pública: português (principal), inglês e espanhol em rotas dedicadas',
  'Canal oficial no YouTube: https://www.youtube.com/@precisoutapronto'
] as const;

export const PRESS_STORY_ANGLES = [
  {
    title: 'MEI que perde venda no WhatsApp',
    hook: 'Como organizar escopo, preço e aprovação em um link para enviar ao cliente pelo WhatsApp.',
    link: '/orcamento-com-pix'
  },
  {
    title: 'Materiais e mão de obra no orçamento',
    hook: 'Exemplo preenchido para eletricistas separarem visita, materiais, serviço e condições.',
    link: '/orcamento-para/eletricista'
  },
  {
    title: 'Pix não substitui recibo',
    hook: 'Quando o comprovante da transferência não documenta sozinho a finalidade do pagamento.',
    link: '/recibos/recibo-pagamento-pix'
  },
  {
    title: 'Gerador de recibo Pix sem fingir extrato',
    hook: 'O prestador precisa de um PDF com finalidade, não de um comprovante bancário gerado.',
    link: '/recibos'
  }
] as const;

export function partnerUtm(path: string, source: string, campaign: string) {
  const base = path.startsWith('http') ? path : `${BRAND_SITE}${path}`;
  const url = new URL(base);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'partner');
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}
