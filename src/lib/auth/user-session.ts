import { generateSecureToken, hashToken } from '@/lib/auth/password-hash';
import {
  SESSION_COOKIE,
  clearSessionCookie,
  createSessionToken,
  parseSessionToken,
  setSessionCookie,
  type SessionPayload
} from '@/lib/auth/session-cookie';
import { getPrisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 30 * 1000;

export type ActiveSessionConflict = {
  conflict: true;
  code: 'SESSION_ACTIVE';
  message: string;
  activeSince: string;
  lastSeenAt: string;
  sameDevice: boolean;
};

export type IssuedSession = {
  conflict: false;
  sessionId: string;
  replaced: boolean;
};

function summarizeUserAgent(userAgent?: string | null) {
  const ua = (userAgent || '').trim();
  if (!ua) return 'outro dispositivo';
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) return 'celular ou tablet';
  if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) return 'computador';
  return 'outro dispositivo';
}

export async function findActiveUserSession(userId: string) {
  const prisma = getPrisma();
  const session = await prisma.userSession.findUnique({ where: { userId } });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.userSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session;
}

/**
 * Cria a sessão ativa do usuário.
 * Se já houver outra sessão em dispositivo diferente e `forceTakeover` for false,
 * devolve conflito para a UI avisar antes de desconectar.
 * Com `forceTakeover` (ou mesmo dispositivo), apaga TODAS as sessões do usuário e cria uma nova.
 */
export async function issueUserSession(input: {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  deviceCookieId?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  forceTakeover?: boolean;
}): Promise<ActiveSessionConflict | IssuedSession> {
  const prisma = getPrisma();
  const existing = await findActiveUserSession(input.userId);
  const sameDevice = Boolean(
    existing?.deviceCookieId &&
      input.deviceCookieId &&
      existing.deviceCookieId === input.deviceCookieId
  );

  if (existing && !sameDevice && !input.forceTakeover) {
    const deviceLabel = summarizeUserAgent(existing.userAgent);
    return {
      conflict: true,
      code: 'SESSION_ACTIVE',
      message: `Já existe um login ativo em outro dispositivo (${deviceLabel}). Se continuar, esse acesso será desconectado.`,
      activeSince: existing.createdAt.toISOString(),
      lastSeenAt: existing.lastSeenAt.toISOString(),
      sameDevice: false
    };
  }

  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const replaced = Boolean(existing);

  // Garante que só resta uma sessão: remove todas e cria a nova.
  await prisma.userSession.deleteMany({ where: { userId: input.userId } });

  const row = await prisma.userSession.create({
    data: {
      userId: input.userId,
      tokenHash,
      deviceCookieId: input.deviceCookieId || null,
      userAgent: input.userAgent?.slice(0, 500) || null,
      ip: input.ip || null,
      expiresAt
    }
  });

  const cookieToken = createSessionToken({
    userId: input.userId,
    email: input.email,
    name: input.name,
    emailVerified: input.emailVerified,
    sid: row.id,
    token: rawToken
  });
  await setSessionCookie(cookieToken);

  return { conflict: false, sessionId: row.id, replaced };
}

/** Valida assinatura + presença da sessão no banco (revoga cookie morto). */
export async function getValidSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const rawCookie = jar.get(SESSION_COOKIE)?.value;
  const payload = parseSessionToken(rawCookie);
  if (!payload?.sid || !payload.jti) {
    if (rawCookie) await clearSessionCookie();
    return null;
  }

  const prisma = getPrisma();
  const row = await prisma.userSession.findUnique({ where: { id: payload.sid } });
  if (!row || row.userId !== payload.sub) {
    await clearSessionCookie();
    return null;
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    await prisma.userSession.delete({ where: { id: row.id } }).catch(() => undefined);
    await clearSessionCookie();
    return null;
  }

  const expectedHash = hashToken(payload.jti);
  if (row.tokenHash !== expectedHash) {
    await clearSessionCookie();
    return null;
  }

  // Atualiza lastSeen no máximo a cada 2 min (evita write em toda request).
  if (Date.now() - row.lastSeenAt.getTime() > 2 * 60 * 1000) {
    await prisma.userSession
      .update({
        where: { id: row.id },
        data: { lastSeenAt: new Date() }
      })
      .catch(() => undefined);
  }

  return payload;
}

export async function revokeSessionFromCookies() {
  const jar = await cookies();
  const rawCookie = jar.get(SESSION_COOKIE)?.value;
  const payload = parseSessionToken(rawCookie);
  await clearSessionCookie();
  if (!payload?.sid) return payload;

  const prisma = getPrisma();
  await prisma.userSession
    .deleteMany({
      where: {
        id: payload.sid,
        userId: payload.sub
      }
    })
    .catch(() => undefined);

  return payload;
}

export async function revokeAllUserSessions(userId: string) {
  const prisma = getPrisma();
  await prisma.userSession.deleteMany({ where: { userId } });
}
