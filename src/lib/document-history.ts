export interface DocumentHistoryItem {
  artifactId: string;
  toolId: string;
  title: string;
  updatedAt: string;
  isFavorite: boolean;
  editorHref: string;
  toolLabel: string;
}

export type DocumentHistoryFilter = 'all' | 'favorites' | 'curriculo' | 'recibos' | 'propostas' | 'contratos';

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

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function filterDocumentHistory(
  documents: DocumentHistoryItem[],
  filter: DocumentHistoryFilter,
  query: string
) {
  const normalizedQuery = normalizeSearch(query);
  return documents.filter((document) => {
    if (filter === 'favorites' && !document.isFavorite) return false;
    if (filter !== 'all' && filter !== 'favorites' && document.toolId !== filter) return false;
    if (!normalizedQuery) return true;
    return normalizeSearch(`${document.title} ${document.toolLabel}`).includes(normalizedQuery);
  });
}
