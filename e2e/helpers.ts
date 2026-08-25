/**
 * Shared helpers for Playwright E2E (CF Access headers live in playwright.config.ts).
 */
export function stagingBaseUrl() {
  return process.env.E2E_BASE_URL?.trim() || 'https://staging.precisoutapronto.com.br';
}

export function cloudflareAccessHeaders(): Record<string, string> {
  const id = process.env.E2E_CF_ACCESS_CLIENT_ID?.trim();
  const secret = process.env.E2E_CF_ACCESS_CLIENT_SECRET?.trim();
  if (!id || !secret) return {};
  return {
    'CF-Access-Client-Id': id,
    'CF-Access-Client-Secret': secret
  };
}
