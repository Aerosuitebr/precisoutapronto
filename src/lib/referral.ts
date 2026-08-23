import { generateSecureToken } from '@/lib/auth/password-hash';
import { grantPremiumDaysServer } from '@/lib/billing-server';
import { getPrisma } from '@/lib/db';
import {
  buildReferralSignupUrl,
  buildReferralWhatsAppUrl,
  normalizeReferralCode,
  REFERRAL_BATCH_SIZE,
  REFERRAL_MILESTONE_DAYS,
  REFERRED_WELCOME_PREMIUM_DAYS
} from '@/lib/referral-shared';
import { writeAuditLog } from '@/lib/security/audit';

export {
  buildReferralSignupUrl,
  buildReferralWhatsAppUrl,
  normalizeReferralCode,
  REFERRAL_BATCH_SIZE,
  REFERRAL_MILESTONE_DAYS,
  REFERRED_WELCOME_PREMIUM_DAYS,
  REFERRAL_STORAGE_KEY
} from '@/lib/referral-shared';

export async function ensureUserReferralCode(userId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, referralCode: true }
  });
  if (!user) throw new Error('Usuário não encontrado.');
  if (user.referralCode) return user.referralCode;

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `RJ${generateSecureToken(4).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true }
      });
      return updated.referralCode!;
    } catch {
      // unique collision: retry
    }
  }
  throw new Error('Não foi possível gerar código de indicação.');
}

export async function resolveReferrerIdByCode(codeRaw: string, excludeUserId?: string) {
  const code = normalizeReferralCode(codeRaw);
  if (!code) return null;
  const prisma = getPrisma();
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true }
  });
  if (!referrer) return null;
  if (excludeUserId && referrer.id === excludeUserId) return null;
  return referrer.id;
}

async function sharesDeviceWithReferrer(referrerId: string, referredId: string) {
  const prisma = getPrisma();
  const [referrerLinks, referredLinks] = await Promise.all([
    prisma.deviceCookieLink.findMany({
      where: { userId: referrerId },
      select: { deviceCookieId: true }
    }),
    prisma.deviceCookieLink.findMany({
      where: { userId: referredId },
      select: { deviceCookieId: true }
    })
  ]);
  const referrerDevices = new Set(referrerLinks.map((l) => l.deviceCookieId));
  return referredLinks.some((l) => referrerDevices.has(l.deviceCookieId));
}

/** Marca amigo como ativo (e-mail ok + 1º uso) e tenta liberar recompensa. */
export async function maybeActivateReferral(referredUserId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: referredUserId },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true,
      referredByUserId: true,
      toolUsage: { select: { totalConsumed: true } },
      referralActivationReceived: { select: { id: true, referrerId: true } }
    }
  });

  if (!user?.referredByUserId) return { activated: false as const };
  if (!user.emailVerifiedAt) return { activated: false as const };
  if ((user.toolUsage?.totalConsumed || 0) < 1) return { activated: false as const };
  if (user.referralActivationReceived) {
    const benefits = await grantActivationBenefits({
      activationId: user.referralActivationReceived.id,
      referrerId: user.referralActivationReceived.referrerId,
      referredId: user.id
    });
    return { activated: false as const, benefits };
  }

  if (await sharesDeviceWithReferrer(user.referredByUserId, user.id)) {
    await writeAuditLog({
      event: 'referral_blocked_same_device',
      userId: user.id,
      email: user.email,
      meta: { referrerId: user.referredByUserId }
    });
    return { activated: false as const, blocked: 'same_device' as const };
  }

  const activation = await prisma.referralActivation.create({
    data: {
      referrerId: user.referredByUserId,
      referredId: user.id
    }
  });

  await writeAuditLog({
    event: 'referral_activated',
    userId: user.id,
    email: user.email,
    meta: { referrerId: user.referredByUserId }
  });

  const benefits = await grantActivationBenefits({
    activationId: activation.id,
    referrerId: user.referredByUserId,
    referredId: user.id
  });
  return { activated: true as const, benefits };
}

async function grantBenefit(input: {
  activationId: string;
  beneficiaryId: string;
  kind: 'referrer_milestone' | 'referred_welcome';
  days: number;
}) {
  const prisma = getPrisma();
  const existing = await prisma.referralBenefit.findUnique({
    where: { activationId_kind: { activationId: input.activationId, kind: input.kind } }
  });
  if (existing) return { granted: false as const, days: existing.days, expiresAt: existing.expiresAt };

  const providerRef = `referral:${input.kind}:${input.activationId}`;
  try {
    await prisma.referralBenefit.create({
      data: { ...input, providerRef, expiresAt: new Date() }
    });
  } catch (error) {
    const claimed = await prisma.referralBenefit.findUnique({
      where: { activationId_kind: { activationId: input.activationId, kind: input.kind } }
    });
    if (claimed) return { granted: false as const, days: claimed.days, expiresAt: claimed.expiresAt };
    throw error;
  }

  let sub;
  try {
    sub = await grantPremiumDaysServer(input.beneficiaryId, input.days, providerRef);
  } catch (error) {
    await prisma.referralBenefit.deleteMany({ where: { providerRef } });
    throw error;
  }
  const benefit = await prisma.referralBenefit.update({
    where: { providerRef },
    data: { expiresAt: sub.expiresAt }
  });
  await writeAuditLog({
    event: `referral_${input.kind}_granted`,
    userId: input.beneficiaryId,
    meta: { activationId: input.activationId, days: input.days, providerRef, expiresAt: sub.expiresAt.toISOString() }
  });
  return { granted: true as const, days: benefit.days, expiresAt: benefit.expiresAt };
}

async function grantActivationBenefits(input: { activationId: string; referrerId: string; referredId: string }) {
  const prisma = getPrisma();
  const activationPosition = await prisma.referralActivation.count({
    where: { referrerId: input.referrerId, activatedAt: { lte: (await prisma.referralActivation.findUniqueOrThrow({ where: { id: input.activationId }, select: { activatedAt: true } })).activatedAt } }
  });
  const milestoneIndex = Math.max(0, (activationPosition - 1) % REFERRAL_BATCH_SIZE);
  const referrerDays = REFERRAL_MILESTONE_DAYS[milestoneIndex];
  const [referrer, referred] = await Promise.all([
    grantBenefit({ activationId: input.activationId, beneficiaryId: input.referrerId, kind: 'referrer_milestone', days: referrerDays }),
    grantBenefit({ activationId: input.activationId, beneficiaryId: input.referredId, kind: 'referred_welcome', days: REFERRED_WELCOME_PREMIUM_DAYS })
  ]);
  return { referrer, referred, milestone: milestoneIndex + 1 };
}

export async function getReferralDashboard(userId: string) {
  const prisma = getPrisma();
  const code = await ensureUserReferralCode(userId);
  const [activations, rewards, benefits, pendingReferrals] = await Promise.all([
    prisma.referralActivation.count({ where: { referrerId: userId } }),
    prisma.referralReward.findMany({
      where: { referrerId: userId },
      orderBy: { grantedAt: 'desc' },
      take: 5
    }),
    prisma.referralBenefit.findMany({
      where: { beneficiaryId: userId, kind: 'referrer_milestone' },
      orderBy: { grantedAt: 'desc' }
    }),
    prisma.user.count({
      where: {
        referredByUserId: userId,
        referralActivationReceived: null
      }
    })
  ]);

  const progressInBatch = activations % REFERRAL_BATCH_SIZE;
  const remainingForReward =
    progressInBatch === 0 ? REFERRAL_BATCH_SIZE : REFERRAL_BATCH_SIZE - progressInBatch;

  return {
    code,
    inviteUrl: buildReferralSignupUrl(code),
    whatsappUrl: buildReferralWhatsAppUrl(code),
    batchSize: REFERRAL_BATCH_SIZE,
    activations,
    pendingReferrals,
    remainingForReward,
    progressInBatch,
    rewardsCount: rewards.length,
    premiumDaysEarned: benefits.reduce((total, benefit) => total + benefit.days, rewards.length * 30),
    nextRewardDays: REFERRAL_MILESTONE_DAYS[progressInBatch],
    lastRewardExpiresAt: benefits[0]?.expiresAt.toISOString() || rewards[0]?.expiresAt.toISOString() || null,
    rewards: rewards.map((r) => ({
      id: r.id,
      grantedAt: r.grantedAt.toISOString(),
      expiresAt: r.expiresAt.toISOString()
    }))
  };
}
