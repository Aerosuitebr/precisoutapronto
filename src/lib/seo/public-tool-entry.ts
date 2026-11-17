import { publicLandingForToolId } from '@/lib/seo/public-tool-landings';

const entryAnchors: Record<string, string> = {
  curriculo: '#ferramenta',
  recibos: '#ferramenta',
  'editor-pdf': '#ferramenta',
  pix: '#gerar',
  orcamentos: '#montar',
  contratos: '#ferramenta',
  propostas: '#ferramenta'
};

export function publicToolEntry(toolId: string, params?: URLSearchParams) {
  const path = publicLandingForToolId(toolId);
  if (!path) return null;
  const query = params?.toString();
  return `${path}${query ? `?${query}` : ''}${entryAnchors[toolId] ?? ''}`;
}
