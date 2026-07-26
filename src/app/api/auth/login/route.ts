import { NextResponse } from 'next/server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password-hash';
import { issueUserSession } from '@/lib/auth/user-session';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { ensureDeviceCookie, linkDeviceToUser } from '@/lib/security/device-cookie';
import { writeAuditLog } from '@/lib/security/audit';
import { getClientIp, getClientUserAgent } from '@/lib/security/request-meta';
import {
  getServerPlanId,
  getServerUsageProgress,
  getPlanForId
} from '@/lib/billing-server';

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
      forceTakeover?: boolean;
    };
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const forceTakeover = Boolean(body.forceTakeover);

    if (!email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const ip = await getClientIp();
    const userAgent = await getClientUserAgent();

    const rate = await consumeRateLimit({
      key: `login:ip:${ip}`,
      ...RATE_LIMITS.login
    });
    if (!rate.allowed) {
      await writeAuditLog({ event: 'rate_block_login', email, ip, userAgent });
      return NextResponse.json(
        { error: `Muitas tentativas. Aguarde ${rate.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      await writeAuditLog({ event: 'login_fail', email, ip, userAgent });
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const deviceId = await ensureDeviceCookie({ userAgent });
    await linkDeviceToUser(deviceId, user.id);

    const emailVerified = Boolean(user.emailVerifiedAt);
    const issued = await issueUserSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified,
      deviceCookieId: deviceId,
      userAgent,
      ip,
      forceTakeover
    });

    if (issued.conflict) {
      await writeAuditLog({
        event: 'login_session_conflict',
        userId: user.id,
        email,
        ip,
        userAgent,
        deviceId,
        meta: { activeSince: issued.activeSince, lastSeenAt: issued.lastSeenAt }
      });
      return NextResponse.json(
        {
          ok: false,
          code: issued.code,
          error: issued.message,
          message: issued.message,
          activeSince: issued.activeSince,
          lastSeenAt: issued.lastSeenAt
        },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip }
    });

    const planId = await getServerPlanId(user.id);
    const usage = await getServerUsageProgress(user.id);

    await writeAuditLog({
      event: forceTakeover || issued.replaced ? 'login_takeover' : 'login',
      userId: user.id,
      email,
      ip,
      userAgent,
      deviceId,
      meta: { emailVerified, replaced: issued.replaced, sessionId: issued.sessionId }
    });

    return NextResponse.json({
      ok: true,
      emailVerified,
      replaced: issued.replaced,
      session: {
        token: 'cookie',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          emailVerified
        }
      },
      plan: getPlanForId(planId),
      planId,
      usage
    });
  } catch (error) {
    console.error('[login]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no login.' },
      { status: 500 }
    );
  }
}
