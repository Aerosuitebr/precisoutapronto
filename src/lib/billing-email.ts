import { sendEmail } from '@/lib/mail/send-email';
import type { InternationalLocale } from '@/lib/i18n';

export async function sendPremiumConfirmationEmail(input: {
  to: string;
  locale: InternationalLocale;
  expiresAt: Date;
}) {
  const accountUrl = `${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/${input.locale}/account`;
  const expires = new Intl.DateTimeFormat(input.locale === 'es' ? 'es-ES' : 'en-US', {
    dateStyle: 'long'
  }).format(input.expiresAt);
  const copy = input.locale === 'es'
    ? {
        subject: 'Tu acceso Premium está activo · Precisou, Tá Pronto',
        title: '¡Pago confirmado!',
        text: `Tu acceso Premium está activo hasta el ${expires}. Ya puedes crear documentos sin la marca Precisou, Tá Pronto.`,
        action: 'Abrir mi cuenta'
      }
    : {
        subject: 'Your Premium access is active · Precisou, Tá Pronto',
        title: 'Payment confirmed!',
        text: `Your Premium access is active until ${expires}. You can now create documents without Precisou, Tá Pronto branding.`,
        action: 'Open my account'
      };
  return sendEmail({
    to: input.to,
    subject: copy.subject,
    text: `${copy.title} ${copy.text} ${accountUrl}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#0f172a;max-width:560px">
      <h2 style="margin:0 0 12px">${copy.title}</h2>
      <p>${copy.text}</p>
      <p style="margin:24px 0"><a href="${accountUrl}" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">${copy.action}</a></p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">Precisou, Tá Pronto</p>
    </div>`
  });
}
