const { PrismaClient } = require('@prisma/client');

async function mpFetch(path) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN ausente');
  const res = await fetch('https://api.mercadopago.com' + path, {
    headers: { Authorization: 'Bearer ' + token },
    cache: 'no-store'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'MP ' + res.status);
  return data;
}

function amountOk(amount) {
  if (typeof amount !== 'number') return true;
  // Aceita preço atual (5,00) e legado (4,99).
  return Math.abs(amount - 5) < 0.05 || Math.abs(amount - 4.99) < 0.05;
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
      orderBy: { createdAt: 'desc' },
      take: 80
    });

    let activated = 0;
    let already = 0;
    let skipped = 0;

    for (const user of users) {
      const email = user.email.trim().toLowerCase();
      const ref = encodeURIComponent(email);
      const search = await mpFetch(
        '/v1/payments/search?external_reference=' + ref + '&sort=date_created&criteria=desc&limit=10'
      );
      const results = Array.isArray(search.results) ? search.results : [];
      const payment = results.find((p) => p.status === 'approved' && amountOk(p.transaction_amount));
      if (!payment) {
        skipped++;
        continue;
      }

      const providerRef = 'mp:' + payment.id;
      const existing = await prisma.subscription.findUnique({ where: { userId: user.id } });
      if (existing && existing.providerRef === providerRef && existing.expiresAt > new Date()) {
        console.log('[ok] ja ativo', email, providerRef);
        already++;
        continue;
      }

      const now = new Date();
      const base = existing && existing.expiresAt > now ? existing.expiresAt : now;
      const expiresAt = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          planId: 'premium',
          startedAt: now,
          expiresAt,
          providerRef
        },
        update: {
          expiresAt,
          providerRef
        }
      });

      console.log(
        '[activated]',
        email,
        providerRef,
        'ate',
        expiresAt.toISOString(),
        'method=',
        payment.payment_method_id
      );
      activated++;
    }

    console.log(JSON.stringify({ activated, already, skipped, usersChecked: users.length }));
  } finally {
    await prisma.$disconnect();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
