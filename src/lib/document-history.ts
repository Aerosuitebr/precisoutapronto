export interface DocumentHistoryItem {
  artifactId: string;
  toolId: string;
  title: string;
  updatedAt: string;
  isFavorite: boolean;
  editorHref: string;
  toolLabel: string;
}

const TOOL_HISTORY = {
  curriculo: { label: 'Currículo', href: '/ferramentas/curriculo' },
  recibos: { label: 'Recibo', href: '/ferramentas/recibos' },
  propostas: { label: 'Proposta', href: '/ferramentas/propostas' },
  contratos: { label: 'Contrato', href: '/ferramentas/contratos' }
} as const;

export const DOCUMENT_HISTORY_TOOL_IDS = Object.keys(TOOL_HISTORY);

export function getDocumentHistoryTool(toolId: string) {
  return TOOL_HISTORY[toolId as keyof typeof TOOL_HISTORY] ?? null;
}

export function getDocumentHistoryTitle(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return fallback;
  const source = data as Record<string, unknown>;
  for (const candidate of [source.title, source.name, source.number]) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().slice(0, 160);
    }
  }
  return fallback;
}

export function buildDocumentEditorHref(toolId: string, artifactId: string) {
  const tool = getDocumentHistoryTool(toolId);
  if (!tool) return null;
  const params = new URLSearchParams({ document: artifactId });
  return `${tool.href}?${params.toString()}`;
}

export function sortDocumentHistory<T extends Pick<DocumentHistoryItem, 'isFavorite' | 'updatedAt'>>(
  documents: T[]
) {
  return [...documents].sort(
    (a, b) =>
      Number(b.isFavorite) - Number(a.isFavorite) ||
      Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
}
