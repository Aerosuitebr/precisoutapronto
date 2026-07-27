#!/usr/bin/env node
/**
 * Envia e-mail pedindo indicação de 3 amigos (usuários com e-mail verificado).
 * Uso no container app:
 *   DRY_RUN=1 node /tmp/nudge-referral-emails.mjs
 *   DRY_RUN=0 LIMIT=50 node /tmp/nudge-referral-emails.mjs
 */
const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');

// Inline minimal mail via Resend to avoid importing TS paths in container
async function sendViaResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    'Resolva Jato <contato@resolvajato.com.br>';
  if (!apiKey) return { sent: false, error: 'RESEND_API_KEY ausente' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [to], subject, html, text })
  });
  if (!res.ok) {
    const body = await res.text();
    return { sent: false, error: body.slice(0, 300) };
  }
  return { sent: true };
}

function makeCode() {
  return `RJ${randomBytes(4).toString('hex').toUpperCase()}`.slice(0, 10);
}

const DRY_RUN = process.env.DRY_RUN !== '0';
const LIMIT = Math.max(1, Number(process.env.LIMIT || 200));
const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://resolvajato.com.br').replace(/\/$/, '');

async function main() {
  const prisma = new PrismaClient();
  try {
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
      const subject = '3 amigos ativos = 1 mês Premium no Resolva Jato';
      const text =
        `Oi, ${firstName}!\n\n` +
        `No Resolva Jato, indicar 3 amigos que confirmam o e-mail e usam uma ferramenta libera 1 mês de Premium pra você.\n\n` +
        `Seu link de indicação:\n${inviteUrl}\n\n` +
        `Painel completo (copiar / WhatsApp):\n${contaUrl}\n\n` +
        `Equipe Resolva Jato`;
      const html =
        `<p>Oi, ${firstName}!</p>` +
        `<p>No Resolva Jato, indicar <strong>3 amigos</strong> que confirmam o e-mail e usam uma ferramenta libera <strong>1 mês de Premium</strong> pra você.</p>` +
        `<p><a href="${inviteUrl}">Seu link de indicação</a></p>` +
        `<p>Painel completo (copiar / WhatsApp): <a href="${contaUrl}">${contaUrl}</a></p>` +
        `<p>Equipe Resolva Jato</p>`;

      if (DRY_RUN) {
        console.log(JSON.stringify({ wouldSend: user.email, code }, null, 2));
        sent += 1;
        continue;
      }

      const result = await sendViaResend({
        to: user.email,
        subject,
        html,
        text
      });

      await prisma.auditLog.create({
        data: {
          event: result.sent ? 'referral_nudge_email_sent' : 'referral_nudge_email_failed',
          userId: user.id,
          email: user.email,
          meta: { error: result.error || null, code }
        }
      });

      if (result.sent) sent += 1;
      else {
        failed += 1;
        console.error(JSON.stringify({ email: user.email, error: result.error }));
      }

      // leve espaçamento
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
