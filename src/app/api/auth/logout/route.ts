import { NextResponse } from 'next/server';
import { revokeSessionFromCookies } from '@/lib/auth/user-session';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp } from '@/lib/security/request-meta';

export async function POST() {
  const session = await revokeSessionFromCookies();
  if (session) {
    await writeAuditLog({
      event: 'logout',
      userId: session.sub,
      email: session.email,
      ip: getClientIp()
    });
  }
  return NextResponse.json({ ok: true });
}
