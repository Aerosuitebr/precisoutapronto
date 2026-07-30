export interface LibraryIntentItem {
  slug: string;
  title: string;
  description: string;
  segmentSlugs: string[];
}

const LIBRARY_SEGMENTS = new Set([
  'mei', 'autonomos', 'empresas', 'rh', 'contadores',
  'advogados', 'estudantes', 'prestadores', 'saude', 'gestores'
]);

export function normalizeLibrarySegment(raw: string | null | undefined) {
  const segment = (raw || '').trim().toLocaleLowerCase('pt-BR');
  return LIBRARY_SEGMENTS.has(segment) ? segment : '';
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function filterLibraryIntents(
  items: LibraryIntentItem[],
  query: string,
  segmentSlug: string
) {
  const normalizedQuery = normalize(query);
  return items.filter((item) => {
    if (segmentSlug && !item.segmentSlugs.includes(segmentSlug)) return false;
    if (!normalizedQuery) return true;
    return normalize(`${item.title} ${item.description}`).includes(normalizedQuery);
  });
}
