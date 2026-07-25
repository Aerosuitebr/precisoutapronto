import { NextResponse } from 'next/server';
import { consumeVerificationToken } from '@/lib/auth/email-verification';
import { issueUserSession } from '@/lib/auth/user-session';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureDeviceCookie, linkDeviceToUser } from '@/lib/security/device-cookie';

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function GET(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.redirect(`${appUrl()}/verificar-email?error=db`);
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    if (!token) {
      return NextResponse.redirect(`${appUrl()}/verificar-email?error=missing`);
    }

    const result = await consumeVerificationToken(token);
    if (!result.ok) {
      return NextResponse.redirect(
        `${appUrl()}/verificar-email?error=${encodeURIComponent(result.error)}`
      );
    }

    const user = result.user;
    const userAgent = getClientUserAgent();
    const ip = getClientIp();
    const deviceId = await ensureDeviceCookie({ userAgent });
    await linkDeviceToUser(deviceId, user.id);

    // Confirmação de e-mail entra direto: assume o controle da sessão única.
    await issueUserSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true,
      deviceCookieId: deviceId,
      userAgent,
      ip,
      forceTakeover: true
    });

    await writeAuditLog({
      event: 'email_verified',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      deviceId
    });

    return NextResponse.redirect(`${appUrl()}/verificar-email?ok=1`);
  } catch (error) {
    console.error('[verify-email]', error);
    return NextResponse.redirect(`${appUrl()}/verificar-email?error=server`);
  }
}
