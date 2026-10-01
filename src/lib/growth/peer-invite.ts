export const PEER_PROFESSIONS = [
  { slug: 'eletricista', label: 'Eletricista' },
  { slug: 'pintor', label: 'Pintor' },
  { slug: 'instalacao-ar-condicionado', label: 'Instalador de ar-condicionado' },
  { slug: 'designer', label: 'Designer' },
  { slug: '', label: 'Outros serviços' }
];

export function peerInviteUrl(baseUrl: string, occupation: string, referralUrl?: string) {
  const profession = PEER_PROFESSIONS.find((item) => item.slug === occupation) || PEER_PROFESSIONS[4];
  const url = new URL(profession.slug ? `/orcamento-para/${profession.slug}` : '/orcamento-com-pix', baseUrl);
  const params = new URLSearchParams({ utm_source: 'peer', utm_medium: 'whatsapp', utm_campaign: 'peer_model_v1', source_occupation: profession.slug || 'geral' });
  if (referralUrl) {
    try { const ref = new URL(referralUrl).searchParams.get('ref'); if (ref) params.set('ref', ref); } catch { /* Generic invite remains available. */ }
  }
  url.search = params.toString();
  url.hash = 'montar';
  return url.toString();
}
