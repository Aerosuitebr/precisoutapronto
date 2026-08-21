export function isTrustedWriteOrigin(request: Request, configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || '') {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const allowed = new Set<string>();
  try { allowed.add(new URL(request.url).origin); } catch { return false; }
  if (configuredBaseUrl) {
    try { allowed.add(new URL(configuredBaseUrl).origin); } catch { return false; }
  }
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    try { allowed.add(new URL(`${proto}://${forwardedHost}`).origin); } catch { return false; }
  }
  try { return allowed.has(new URL(origin).origin); } catch { return false; }
}
