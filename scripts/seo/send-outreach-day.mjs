#!/usr/bin/env node
/**
 * Dispara o lote diário de outreach (máx. 10) via SMTP Workspace.
 *
 * Uso:
 *   node --env-file=.env scripts/seo/send-outreach-day.mjs --dry-run
 *   node --env-file=.env scripts/seo/send-outreach-day.mjs --send
 *   node --env-file=.env scripts/seo/send-outreach-day.mjs --send --self-test
 *   node --env-file=.env scripts/seo/send-outreach-day.mjs --day=docs/divulgacao/outreach-followup-2026-08-04.json --dry-run
 *   node --env-file=.env scripts/seo/send-outreach-day.mjs --day=docs/divulgacao/outreach-followup-2026-08-04.json --send
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const dayFile =
  process.argv.find((arg) => arg.startsWith('--day='))?.slice(6) ||
  'docs/divulgacao/outreach-day-2026-08-01.json';
const dryRun = process.argv.includes('--dry-run') || !process.argv.includes('--send');
const selfTest = process.argv.includes('--self-test');

function env(name) {
  return (process.env[name] || '').trim().replace(/^"|"$/g, '');
}

function stripDashes(text) {
  return text.replace(/[—–]/g, ',');
}

function pitchFor(contact) {
  const link = contact.primaryUrl;
  const embed = 'https://precisoutapronto.com.br/embed?utm_source=outreach&utm_medium=partner&utm_campaign=autoridade_2026_08';
  const press = 'https://precisoutapronto.com.br/imprensa?utm_source=outreach&utm_medium=partner&utm_campaign=autoridade_2026_08';

  if (contact.angle === 'followup') {
    const askLabel = contact.askLabel || 'recurso gratuito';
    const prev = contact.previousSubject || 'mensagem anterior';
    const secondary = contact.secondaryUrl
      ? `\nSe preferir outra URL da mesma linha: ${contact.secondaryUrl}`
      : '';
    const subject = prev.startsWith('Re:') ? prev : `Re: ${prev}`;
    const body = stripDashes(
      [
        `Olá, equipe ${contact.org},`,
        '',
        'Complementando o e-mail de 1º de agosto: o pedido concreto é um link ou menção para a página interna abaixo (não só a home).',
        '',
        `Recurso: ${askLabel}`,
        `URL para linkar: ${link}${secondary}`,
        '',
        `Badges HTML prontos: ${embed}`,
        `Press kit / como citar: ${press}`,
        '',
        'Se não for o momento, tudo bem. Se couber numa matéria, guia ou lista de ferramentas, esse link interno ajuda o público a achar o recurso certo.',
        '',
        'Abraço,',
        'Wellem Lyra',
        'contato@precisoutapronto.com.br',
        'https://precisoutapronto.com.br/?utm_source=outreach&utm_medium=partner&utm_campaign=autoridade_fu_2026_08'
      ].join('\n')
    );
    return {
      subject: stripDashes(subject),
      text: body,
      inReplyTo: contact.previousMessageId || null,
      references: contact.previousMessageId || null
    };
  }

  const byAngle = {
    rescisao: {
      subject: `Sugestão de pauta · calculadora educativa de rescisão`,
      intro:
        `Vi que vocês cobrem temas de RH e pensei em um recurso gratuito que pode ajudar o público: uma calculadora educativa de rescisão (saldo, férias, 13º, aviso e FGTS), com aviso claro de que não substitui análise individual.\n\nLink: ${link}`
    },
    embed: {
      subject: `Badges prontos para linkar ferramentas grátis (MEI, RH, educação)`,
      intro:
        `Monteamos uma página de embeds/HTML para blogs e portais citarem ferramentas grátis do Precisou, Tá Pronto com UTM de parceria.\n\nPágina: ${link}\nPress kit: ${press}`
    },
    enem: {
      subject: `Recurso gratuito · corretor de redação ENEM (por competência)`,
      intro:
        `Para o público de vestibular/ENEM, liberamos um corretor gratuito com estimativa por competência (C1 a C5), pensado para treino (não substitui correção oficial).\n\nLink: ${link}\nTambém há gerador de referências ABNT: https://precisoutapronto.com.br/gerador-de-referencias-abnt`
    },
    checklist: {
      subject: `Checklist citável · cobrança para MEI (orçamento → Pix → recibo)`,
      intro:
        `Publiquei um checklist prático de cobrança para MEI, com links para ferramentas grátis no navegador. Pode ser útil como material de apoio ou menção em conteúdo.\n\nLink: ${link}`
    },
    estudantes: {
      subject: `Ferramentas grátis para jovens · currículo, ENEM e ABNT`,
      intro:
        `O Precisou, Tá Pronto tem ferramentas gratuitas no navegador que podem apoiar conteúdos de educação e primeiro emprego: currículo em PDF, corretor de redação ENEM e referências ABNT.\n\nCurrículo: ${link}\nENEM: https://precisoutapronto.com.br/corretor-de-redacao-enem\nABNT: https://precisoutapronto.com.br/gerador-de-referencias-abnt`
    },
    'mei-pix': {
      subject: `Recurso gratuito para MEI · orçamento com Pix no WhatsApp`,
      intro:
        `Sugestão de recurso gratuito para o público MEI: orçamento digital com aprovação no celular e Pix na hora, sem instalar app.\n\nLink: ${link}\nChecklist completo: https://precisoutapronto.com.br/checklist-cobranca-mei`
    },
    'mei-clt': {
      subject: `Simulador gratuito MEI vs CLT (educativo)`,
      intro:
        `Ferramenta educativa para comparar MEI e CLT no bolso, útil em conteúdos de formalização e carreira.\n\nLink: ${link}`
    },
    recibo: {
      subject: `Gerador de recibo grátis para MEI (PDF)`,
      intro:
        `Recurso gratuito para MEI emitir recibo em PDF com valor por extenso, no navegador.\n\nLink: ${link}`
    },
    'recibo-aluguel': {
      subject: `Recurso gratuito para o guia de recibo de aluguel`,
      intro:
        `Vi o conteúdo de vocês sobre como preencher recibo de aluguel. Mantemos uma página gratuita que ajuda o leitor a organizar locador, inquilino, imóvel, competência e valor e seguir para a geração do PDF.\n\nLink: ${link}`
    },
    proposta: {
      subject: `Gerador de proposta comercial grátis (PDF)`,
      intro:
        `Ferramenta gratuita para MEI/freelancer montar proposta comercial em PDF, com layouts prontos.\n\nLink: ${link}`
    }
  };

  const pack = byAngle[contact.angle] || byAngle.checklist;
  const body = stripDashes(
    [
      `Olá, equipe ${contact.org},`,
      '',
      'Sou o Wellem, do Precisou, Tá Pronto (https://precisoutapronto.com.br).',
      pack.intro,
      '',
      `Se fizer sentido citar ou recomendar, temos badges HTML prontos em ${embed} e press kit em ${press}.`,
      'Posso mandar um bloco pronto para a matéria ou um outline de guest post.',
      '',
      'Abraço,',
      'Wellem Lyra',
      'contato@precisoutapronto.com.br',
      'https://precisoutapronto.com.br/?utm_source=outreach&utm_medium=partner&utm_campaign=autoridade_2026_08'
    ].join('\n')
  );

  return { subject: stripDashes(pack.subject), text: body, inReplyTo: null, references: null };
}

async function sendViaResend({ from, to, subject, text, headers }) {
  const key = env('RESEND_API_KEY');
  if (!key) return null;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      ...(headers ? { headers } : {})
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend HTTP ${res.status}: ${body.slice(0, 240)}`);
  }
  const json = await res.json();
  return { messageId: json.id || 'resend', provider: 'resend' };
}

async function sendViaSmtp({ from, to, subject, text, transporter, inReplyTo, references }) {
  const headers = { 'Content-Language': 'pt-BR' };
  if (inReplyTo) headers['In-Reply-To'] = inReplyTo;
  if (references) headers.References = references;
  const info = await transporter.sendMail({
    from,
    to,
    replyTo: env('SMTP_USER'),
    subject,
    text,
    headers,
    ...(inReplyTo ? { inReplyTo, references: references || inReplyTo } : {})
  });
  return { messageId: info.messageId, provider: 'smtp' };
}

async function main() {
  const listPath = path.isAbsolute(dayFile) ? dayFile : path.join(root, dayFile);
  const contacts = JSON.parse(readFileSync(listPath, 'utf8'));
  if (!Array.isArray(contacts) || contacts.length === 0) {
    throw new Error('Lista de outreach vazia');
  }
  if (contacts.length > 10) {
    throw new Error('Lote diário limitado a 10 contatos');
  }

  const host = env('SMTP_HOST');
  const user = env('SMTP_USER');
  const pass = env('SMTP_PASS');
  const from = env('SMTP_FROM') || env('RESEND_FROM') || `Precisou, Tá Pronto <${user || 'contato@precisoutapronto.com.br'}>`;
  const hasResend = Boolean(env('RESEND_API_KEY'));
  const hasSmtp = Boolean(host && user && pass);
  if (!dryRun && !hasResend && !hasSmtp) {
    throw new Error('Nenhum provedor: defina RESEND_API_KEY ou SMTP_*');
  }

  let transporter = null;
  if (!dryRun && hasSmtp && !hasResend) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(env('SMTP_PORT') || '587'),
      secure: env('SMTP_SSL') === 'true',
      requireTLS: (env('SMTP_START_TLS') || 'REQUIRED').toUpperCase() === 'REQUIRED',
      auth: { user, pass }
    });
    await transporter.verify();
    console.log('SMTP verificado:', user);
  } else if (!dryRun && hasResend) {
    console.log('Usando Resend como provedor principal');
  }

  const results = [];
  const queue = selfTest
    ? [
        {
          id: 'self-test',
          org: 'Precisou, Tá Pronto (teste)',
          email: user || 'contato@precisoutapronto.com.br',
          audience: 'teste',
          angle: 'embed',
          primaryUrl: 'https://precisoutapronto.com.br/embed',
          source: 'self-test'
        }
      ]
    : contacts;

  for (const contact of queue) {
    const { subject, text, inReplyTo, references } = pitchFor(contact);
    const threadHeaders =
      inReplyTo || references
        ? {
            ...(inReplyTo ? { 'In-Reply-To': inReplyTo } : {}),
            ...(references ? { References: references } : {})
          }
        : null;
    const entry = {
      id: contact.id,
      org: contact.org,
      email: contact.email,
      subject,
      primaryUrl: contact.primaryUrl || null,
      dryRun,
      at: new Date().toISOString()
    };

    if (dryRun) {
      entry.status = 'dry-run';
      console.log(`[dry-run] ${contact.email} · ${subject}`);
      console.log(`         → ${contact.primaryUrl || '(sem URL)'}`);
      results.push(entry);
      continue;
    }

    try {
      let sent;
      if (hasResend) {
        try {
          sent = await sendViaResend({
            from,
            to: contact.email,
            subject,
            text,
            headers: threadHeaders
          });
        } catch (resendError) {
          if (!hasSmtp) throw resendError;
          console.warn(`Resend falhou (${contact.email}), tentando SMTP...`);
          if (!transporter) {
            transporter = nodemailer.createTransport({
              host,
              port: Number(env('SMTP_PORT') || '587'),
              secure: env('SMTP_SSL') === 'true',
              requireTLS: (env('SMTP_START_TLS') || 'REQUIRED').toUpperCase() === 'REQUIRED',
              auth: { user, pass }
            });
          }
          sent = await sendViaSmtp({
            from,
            to: contact.email,
            subject,
            text,
            transporter,
            inReplyTo,
            references
          });
        }
      } else {
        sent = await sendViaSmtp({
          from,
          to: contact.email,
          subject,
          text,
          transporter,
          inReplyTo,
          references
        });
      }
      entry.status = 'sent';
      entry.provider = sent.provider;
      entry.messageId = sent.messageId;
      console.log(`[sent:${sent.provider}] ${contact.email} · ${subject}`);
    } catch (error) {
      entry.status = 'error';
      entry.error = error instanceof Error ? error.message : String(error);
      console.error(`[error] ${contact.email} · ${entry.error}`);
    }
    results.push(entry);
    await new Promise((r) => setTimeout(r, 4000));
  }

  const logDir = path.join(path.dirname(listPath), 'logs');
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const kind = /followup/i.test(path.basename(listPath)) ? '-followup' : '';
  const logPath = path.join(
    logDir,
    `outreach-${stamp}${kind}${selfTest ? '-selftest' : ''}${dryRun ? '-dry' : ''}.json`
  );
  writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`Log: ${logPath}`);
  console.log(
    `Resumo: ${results.filter((r) => r.status === 'sent').length} enviados, ${results.filter((r) => r.status === 'error').length} erros, ${results.filter((r) => r.status === 'dry-run').length} dry-run`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
