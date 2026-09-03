/**
 * Destinos e ângulos para conquista de menções e backlinks.
 * Páginas públicas devem ser indexáveis e úteis o bastante para merecer o link.
 */

import { BRAND_PUBLIC_EMAIL, BRAND_NAME, BRAND_SITE } from '@/lib/brand';

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
    path: '/calculadora-de-rescisao',
    title: 'Calculadora de rescisão',
    pitch: 'Ferramenta educativa de alto volume de busca.',
    audiences: ['rh', 'imprensa']
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
  'Operação: Aerosuite',
  `Contato de imprensa: ${BRAND_PUBLIC_EMAIL}`,
  'Proposta: ferramentas online grátis para documentos, cobranças, estudos e cálculos no navegador',
  'Acesso: orçamento e recibo sem cadastro; conta grátis para histórico e para tirar a marca',
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
    title: 'Pix não substitui recibo',
    hook: 'Quando o comprovante da transferência não documenta sozinho a finalidade do pagamento.',
    link: '/recibos/recibo-pagamento-pix'
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
