/**
 * Paths públicos indexáveis (fora de áreas autenticadas / noindex).
 * Usado para hreflang e sitemap i18n — nunca apontar cluster de idiomas para /ferramentas ou /busca.
 */
export function isPublicIndexablePath(path: string | null | undefined): boolean {
  if (!path?.trim()) return false;
  const normalized = path.split('?')[0]?.split('#')[0] || '';
  if (!normalized.startsWith('/')) return false;
  if (normalized === '/busca' || normalized.startsWith('/busca/')) return false;
  if (normalized === '/ferramentas' || normalized.startsWith('/ferramentas/')) return false;
  if (normalized === '/conta' || normalized.startsWith('/conta/')) return false;
  if (normalized === '/checkout' || normalized.startsWith('/checkout/')) return false;
  if (normalized === '/login' || normalized === '/cadastro') return false;
  if (normalized.startsWith('/api/')) return false;
  if (normalized.startsWith('/documento/')) return false;
  return true;
}
