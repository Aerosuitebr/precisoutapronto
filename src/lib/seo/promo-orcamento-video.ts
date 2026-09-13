/** Vídeo já hospedado em produção. O 9:16 da campanha vai só nas redes (upload nativo). */

export const PROMO_ORCAMENTO_VIDEO = {
  path: '/videos/precisou-ta-pronto-promo-16x9.mp4',
  width: 1920,
  height: 1080,
  publishedAt: '2026-09-10T19:00:00.000Z',
  title: 'Orçamento no WhatsApp com aprovação e Pix',
  description:
    'No Precisou, Tá Pronto o orçamento vai no celular do cliente. Ele confere, aprova e paga com Pix no mesmo link. Sem app. Sem cadastro para começar.'
} as const;

export const VIDEO_SET_CAMPAIGN = 'video_set_2026_09';
export const ORCAMENTO_TOOL_PATH = '/orcamento-com-pix';

export function promoOrcamentoAbsoluteUrl(siteUrl: string, path: string) {
  return `${siteUrl.replace(/\/$/, '')}${path}`;
}

export function orcamentoCampaignUrl(source: string, medium: string, content: string) {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: VIDEO_SET_CAMPAIGN,
    utm_content: content
  });
  return `https://precisoutapronto.com.br${ORCAMENTO_TOOL_PATH}?${params.toString()}`;
}

export type OrcamentoVideoChannel = {
  id: string;
  label: string;
  hint: string;
  composerHref: string;
  composerLabel: string;
  script: string;
};

const CAPTION_CORE =
  'Pedido no WhatsApp? Manda o orçamento no celular do cliente.\nEle aprova e paga com Pix. Sem app.';

export const ORCAMENTO_VIDEO_CHANNELS: readonly OrcamentoVideoChannel[] = [
  {
    id: 'instagram',
    label: 'Instagram Reels',
    hint: 'Anexar o MP4 9:16. Link na bio ou no primeiro comentário.',
    composerHref: 'https://www.instagram.com/',
    composerLabel: 'Abrir Instagram',
    script: `${CAPTION_CORE}\n\nFerramenta grátis: ${orcamentoCampaignUrl('instagram', 'organic_social', 'reels')}\n\n#MEI #WhatsAppBusiness #Pix #Freelancer #PrecisouTaPronto`
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    hint: 'Upload 9:16. Cole o link no primeiro comentário e na bio.',
    composerHref: 'https://www.tiktok.com/tiktokstudio/upload',
    composerLabel: 'Abrir upload TikTok',
    script: `${CAPTION_CORE}\n\nLink na bio: precisoutapronto.com.br\n\n#MEI #Pix #WhatsAppBusiness #freelancer #orcamento`
  },
  {
    id: 'youtube',
    label: 'YouTube Shorts',
    hint: 'YouTube permite o link na descrição. Título curto, sem travessão.',
    composerHref: 'https://studio.youtube.com/',
    composerLabel: 'Abrir YouTube Studio',
    script: `Orçamento no WhatsApp com Pix | Precisou, Tá Pronto\n\n${CAPTION_CORE}\n\n${orcamentoCampaignUrl('youtube', 'organic_social', 'shorts')}\n\n#Shorts #MEI #Pix #WhatsApp`
  },
  {
    id: 'facebook',
    label: 'Facebook (página)',
    hint: 'Página Precisou, Tá Pronto. Anexar o mesmo MP4 9:16.',
    composerHref: 'https://www.facebook.com/',
    composerLabel: 'Abrir Facebook',
    script: `Orçamento com Pix no WhatsApp.\nCliente aprova no celular. Você recebe.\n\n${orcamentoCampaignUrl('facebook', 'organic_social', 'pagina')}`
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp Status',
    hint: 'Anexar o MP4 9:16 no Status. O link abaixo já abre a conversa com o texto.',
    composerHref: `https://wa.me/?text=${encodeURIComponent(`${CAPTION_CORE}\n\n${orcamentoCampaignUrl('whatsapp', 'social', 'status')}`)}`,
    composerLabel: 'Abrir WhatsApp com texto',
    script: `${CAPTION_CORE}\n\n${orcamentoCampaignUrl('whatsapp', 'social', 'status')}`
  },
  {
    id: 'threads',
    label: 'Threads',
    hint: 'Texto curto com o link. Vídeo se o app deixar anexar.',
    composerHref: 'https://www.threads.net/',
    composerLabel: 'Abrir Threads',
    script: `${CAPTION_CORE}\n\n${orcamentoCampaignUrl('threads', 'organic_social', 'post')}`
  },
  {
    id: 'x',
    label: 'X',
    hint: 'Um post. Sem fio. O compositor já leva o texto.',
    composerHref: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${CAPTION_CORE}\n\n${orcamentoCampaignUrl('x', 'organic_social', 'post')}`)}`,
    composerLabel: 'Abrir compositor X',
    script: `${CAPTION_CORE}\n\n${orcamentoCampaignUrl('x', 'organic_social', 'post')}`
  },
  {
    id: 'telegram',
    label: 'Telegram',
    hint: 'Compartilhar em canais ou grupos onde você já participa. Sem spam.',
    composerHref: `https://t.me/share/url?url=${encodeURIComponent(orcamentoCampaignUrl('telegram', 'organic_social', 'share'))}&text=${encodeURIComponent(CAPTION_CORE)}`,
    composerLabel: 'Abrir compartilhar Telegram',
    script: `${CAPTION_CORE}\n\n${orcamentoCampaignUrl('telegram', 'organic_social', 'share')}`
  },
  {
    id: 'linkedin-url',
    label: 'LinkedIn (link do site)',
    hint: 'Além do repost da Aero Suite. Este compositor publica o URL da ferramenta.',
    composerHref: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(orcamentoCampaignUrl('linkedin', 'organic_social', 'share_offsite'))}`,
    composerLabel: 'Abrir compartilhar LinkedIn',
    script: `Orçamento no WhatsApp, com aprovação e Pix no mesmo link.\n\nProduto da Aero Suite: Precisou, Tá Pronto. Grátis para começar.\n\n${orcamentoCampaignUrl('linkedin', 'organic_social', 'share_offsite')}`
  },
  {
    id: 'tabnews',
    label: 'TabNews',
    hint: 'Uma publicação. Sem repetir no mesmo dia dos vídeos 11 a 13/09.',
    composerHref: 'https://www.tabnews.com.br/login',
    composerLabel: 'Abrir TabNews',
    script: `Mostrei o Precisou, Tá Pronto: orçamento com Pix no WhatsApp\n\nLancei o Precisou, Tá Pronto pra cobrir o fluxo real do profissional brasileiro: fechar no WhatsApp, emitir documento e calcular o básico sem planilha.\n\nHoje o núcleo gratuito inclui:\n• Orçamento com aprovação e Pix no WhatsApp\n• Currículo, recibo, contrato e proposta em PDF\n• Calculadoras de rescisão, preço freelancer e MEI vs CLT\n\nLink: ${orcamentoCampaignUrl('tabnews', 'referral', 'br_tabnews')}\n\nFeedback sincero é bem-vindo, sobretudo de quem é MEI ou freelancer de verdade.`
  }
] as const;
