import { getPrisma } from '@/lib/db';
import { generateSecureToken, hashToken } from '@/lib/auth/password-hash';
import { sendEmail } from '@/lib/mail/send-email';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
type EmailLocale = 'en' | 'es' | undefined;

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function createEmailVerificationToken(userId: string, locale?: EmailLocale) {
  const prisma = getPrisma();
  const raw = generateSecureToken(32);
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await prisma.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } });
  const localeQuery = locale ? `&locale=${locale}` : '';
  return { raw, expiresAt, verifyUrl: `${appUrl()}/api/auth/verify-email?token=${raw}${localeQuery}` };
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
  locale?: EmailLocale;
}): Promise<{ sent: boolean; error?: string }> {
  const copy = input.locale === 'en'
    ? { title: 'Confirm your email', hello: 'Hello', intro: 'Confirm your email to activate your Precisou, Tá Pronto account and access the tools:', action: 'Confirm email', expiry: 'This link expires in 24 hours. If you did not create this account, ignore this message.', subject: 'Confirm your email · Precisou, Tá Pronto', text: 'Confirm your Precisou, Tá Pronto email' }
    : input.locale === 'es'
      ? { title: 'Confirma tu correo', hello: 'Hola', intro: 'Confirma tu correo para activar tu cuenta de Precisou, Tá Pronto y acceder a las herramientas:', action: 'Confirmar correo', expiry: 'Este enlace caduca en 24 horas. Si no creaste esta cuenta, ignora este mensaje.', subject: 'Confirma tu correo · Precisou, Tá Pronto', text: 'Confirma tu correo de Precisou, Tá Pronto' }
      : { title: 'Confirme seu e-mail', hello: 'Olá', intro: 'Para ativar sua conta no Precisou, Tá Pronto e liberar as ferramentas, confirme seu e-mail:', action: 'Confirmar e-mail', expiry: 'O link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.', subject: 'Confirme seu e-mail · Precisou, Tá Pronto', text: 'Confirme seu e-mail no Precisou, Tá Pronto' };
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px">
      <h2 style="margin:0 0 12px">${copy.title}</h2>
      <p>${copy.hello}${input.name ? ` ${input.name}` : ''},</p>
      <p>${copy.intro}</p>
      <p style="margin:24px 0"><a href="${input.verifyUrl}" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">${copy.action}</a></p>
      <p style="color:#64748b;font-size:13px">${copy.expiry}</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">Precisou, Tá Pronto</p>
    </div>`;
  const result = await sendEmail({ to: input.to, subject: copy.subject, html, text: `${copy.text}: ${input.verifyUrl}` });
  if (!result.sent && process.env.NODE_ENV !== 'production') {
    console.info('[auth] verification email not sent:', input.verifyUrl, result.error);
  }
  return { sent: result.sent, error: result.error };
}

export async function consumeVerificationToken(rawToken: string) {
  const prisma = getPrisma();
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: 'Link inválido ou expirado.' };
  }
  const now = new Date();
  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: now } }),
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: now } }),
    prisma.toolUsage.upsert({
      where: { userId: record.userId },
      create: { userId: record.userId, availableUses: 0, totalConsumed: 0, periodDays: 30 },
      update: { exhaustedAt: null, nextReleaseAt: null }
    })
  ]);
  return { ok: true as const, user: record.user };
}
