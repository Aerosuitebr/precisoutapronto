export interface SavedToolResult {
  id: string;
  title: string;
  highlightLabel: string;
  highlightValue: string;
  toolPath: string;
  savedAt: string;
}

const STORAGE_KEY = 'rj.results.saved';
export const RESULT_HISTORY_UPDATED_EVENT = 'resolva-jato:result-history-updated';

export function loadSavedToolResults(): SavedToolResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as SavedToolResult[];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function saveToolResult(input: Omit<SavedToolResult, 'id' | 'savedAt'>) {
  if (typeof window === 'undefined') return [];
  const signature = `${input.toolPath}:${input.highlightValue}`;
  const next: SavedToolResult[] = [
    { ...input, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, savedAt: new Date().toISOString() },
    ...loadSavedToolResults().filter((item) => `${item.toolPath}:${item.highlightValue}` !== signature)
  ].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(RESULT_HISTORY_UPDATED_EVENT));
  return next;
}

export function removeSavedToolResult(id: string) {
  if (typeof window === 'undefined') return [];
  const next = loadSavedToolResults().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(RESULT_HISTORY_UPDATED_EVENT));
  return next;
}
