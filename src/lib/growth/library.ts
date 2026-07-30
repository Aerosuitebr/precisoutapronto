export interface LibraryIntentItem {
  slug: string;
  title: string;
  description: string;
  segmentSlugs: string[];
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
