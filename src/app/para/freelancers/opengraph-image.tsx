import { createOgImage, ogContentType, ogSize } from '@/lib/seo/og-image';

export const runtime = 'edge';
export const alt = 'Ferramentas grátis para freelancers';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    eyebrow: 'PRECISOU, TÁ PRONTO · FREELANCERS',
    title: 'Proposta, contrato e Pix sem parecer amador.',
    subtitle: 'Do briefing ao pagamento, em um fluxo só'
  });
}
