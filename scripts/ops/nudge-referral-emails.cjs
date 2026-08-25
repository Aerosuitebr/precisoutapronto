#!/usr/bin/env node
/**
 * Envia e-mail pedindo indicação de 3 amigos (usuários com e-mail verificado).
 * Uso no container app (/app):
 *   DRY_RUN=1 node /app/nudge-referral-emails.cjs
 *   DRY_RUN=0 LIMIT=50 node /app/nudge-referral-emails.cjs
 */
const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');
const nodemailer = require('nodemailer');

function env(name) {
  return (process.env[name] || '').trim();
}

function defaultFrom() {
  return (
    env('SMTP_FROM') ||
    env('RESEND_FROM') ||
    (env('SMTP_USER') ? `Precisou, Tá Pronto <${env('SMTP_USER')}>` : 'Precisou, Tá Pronto <contato@precisoutapronto.com.br>')
  );
}

function smtpConfigured() {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));
}

async function sendEmail({ to, subject, html, text }) {
  if (env('RESEND_API_KEY')) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: defaultFrom(), to: [to], subject, html, text })
    });
    if (res.ok) return { sent: true, provider: 'resend' };
    const body = await res.text();
    if (!smtpConfigured()) {
      return { sent: false, error: body.slice(0, 300), provider: 'resend' };
    }
  }

  if (!smtpConfigured()) {
    return {
      sent: false,
      error: 'Nenhum provedor de e-mail (RESEND_API_KEY ou SMTP_*).'
    };
  }

  const port = Number(env('SMTP_PORT') || '587');
  const secure = env('SMTP_SSL') === 'true' || port === 465;
  const requireTls =
    env('SMTP_START_TLS').toUpperCase() === 'REQUIRED' || (!secure && port === 587);

  try {
    const transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port,
      secure,
      requireTLS: requireTls,
      auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') }
    });
    await transporter.sendMail({ from: defaultFrom(), to, subject, html, text });
    return { sent: true, provider: 'smtp' };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Falha SMTP',
      provider: 'smtp'
    };
  }
}

function makeCode() {
  return `RJ${randomBytes(4).toString('hex').toUpperCase()}`.slice(0, 10);
}

const DRY_RUN = process.env.DRY_RUN !== '0';
const LIMIT = Math.max(1, Number(process.env.LIMIT || 200));
const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://precisoutapronto.com.br').replace(/\/$/, '');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log(
      JSON.stringify(
        {
          mail: {
            resend: Boolean(env('RESEND_API_KEY')),
            smtp: smtpConfigured()
          }
        },
        null,
        2
      )
    );

    const users = await prisma.user.findMany({
      where: { emailVerifiedAt: { not: null } },
      orderBy: { lastLoginAt: 'desc' },
      take: LIMIT,
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true,
        lastLoginAt: true
      }
    });

    console.log(JSON.stringify({ dryRun: DRY_RUN, candidates: users.length }, null, 2));

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const user of users) {
      let code = user.referralCode;
      if (!code) {
        for (let i = 0; i < 5; i++) {
          const candidate = makeCode();
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { referralCode: candidate }
            });
            code = candidate;
            break;
          } catch {
            // unique collision
          }
        }
      }
      if (!code) {
        skipped += 1;
        continue;
      }

      const inviteUrl = `${BASE}/cadastro?ref=${encodeURIComponent(code)}&utm_source=email&utm_medium=referral&utm_campaign=premium_3friends_nudge`;
      const contaUrl = `${BASE}/conta`;
      const firstName = (user.name || '').split(/\s+/)[0] || 'olá';
      const subject = '3 amigos ativos = 1 mês Premium no Precisou, Tá Pronto';
      const text =
        `Oi, ${firstName}!\n\n` +
        `No Precisou, Tá Pronto, indicar 3 amigos que confirmam o e-mail e usam uma ferramenta libera 1 mês de Premium pra você.\n\n` +
        `Seu link de indicação:\n${inviteUrl}\n\n` +
        `Painel completo (copiar / WhatsApp):\n${contaUrl}\n\n` +
        `Equipe Precisou, Tá Pronto`;
      const html =
        `<p>Oi, ${firstName}!</p>` +
        `<p>No Precisou, Tá Pronto, indicar <strong>3 amigos</strong> que confirmam o e-mail e usam uma ferramenta libera <strong>1 mês de Premium</strong> pra você.</p>` +
        `<p><a href="${inviteUrl}">Seu link de indicação</a></p>` +
        `<p>Painel completo (copiar / WhatsApp): <a href="${contaUrl}">${contaUrl}</a></p>` +
        `<p>Equipe Precisou, Tá Pronto</p>`;

      if (DRY_RUN) {
        console.log(JSON.stringify({ wouldSend: user.email, code }, null, 2));
        sent += 1;
        continue;
      }

      const result = await sendEmail({ to: user.email, subject, html, text });

      await prisma.auditLog.create({
        data: {
          event: result.sent ? 'referral_nudge_email_sent' : 'referral_nudge_email_failed',
          userId: user.id,
          email: user.email,
          meta: { error: result.error || null, code, provider: result.provider || null }
        }
      });

      if (result.sent) sent += 1;
      else {
        failed += 1;
        console.error(JSON.stringify({ email: user.email, error: result.error }));
      }

      await new Promise((r) => setTimeout(r, 250));
    }

    console.log(JSON.stringify({ dryRun: DRY_RUN, sent, skipped, failed }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
