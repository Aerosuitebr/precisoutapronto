import { headers } from 'next/headers';

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('cf-connecting-ip') || h.get('x-forwarded-for') || h.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

export async function getClientUserAgent(): Promise<string | null> {
  const h = await headers();
  return h.get('user-agent');
}
