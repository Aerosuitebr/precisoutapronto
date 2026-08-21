import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { contextChangedFields } from './audit';
import { CONTEXT_CONSENT_VERSION, parseBusinessContextWrite } from './contracts';
import { encryptContextValue } from './encryption';
import { environmentContextKeyProvider, type ContextKeyProvider } from './key-provider';

function stableProfileId(userId: string) {
  const bytes = createHash('sha256').update(`resolva-jato:context-profile:v1:${userId}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface ProfileWriteDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  keys: ContextKeyProvider;
  findId: (userId: string) => Promise<string | null>;
  persist: (input: {
    id: string;
    userId: string;
    create: Prisma.UserBusinessProfileUncheckedCreateInput;
    update: Prisma.UserBusinessProfileUncheckedUpdateInput;
    audit: Prisma.ContextAuditEventUncheckedCreateInput;
  }) => Promise<void>;
  now: () => Date;
}

const defaultDependencies: ProfileWriteDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  keys: environmentContextKeyProvider,
  findId: async (userId) => (await getPrisma().userBusinessProfile.findUnique({
    where: { userId }, select: { id: true }
  }))?.id || null,
  persist: async ({ userId, create, update, audit }) => {
    await getPrisma().$transaction([
      getPrisma().userBusinessProfile.upsert({ where: { userId }, create, update }),
      getPrisma().contextAuditEvent.create({ data: audit })
    ]);
  },
  now: () => new Date()
};

const ENCRYPTED_FIELDS = ['legalName', 'taxId', 'email', 'phone', 'address', 'pix'] as const;

export async function writeBusinessContextProfile(
  userId: string,
  input: unknown,
  dependencies: ProfileWriteDependencies = defaultDependencies
) {
  try {
    if (!userId || !dependencies.databaseConfigured()) return null;
    const parsed = parseBusinessContextWrite(input);
    if (!parsed.ok) return null;
    const decision = await dependencies.decide('reusable_context_v1', userId);
    if (!decision.enabled) return null;
    const existingId = await dependencies.findId(userId);
    const id = existingId || stableProfileId(userId);
    const now = dependencies.now();
    const encrypted: Record<string, Buffer> = {};
    let keyVersion: string | undefined;
    for (const field of ENCRYPTED_FIELDS) {
      const value = parsed.data[field];
      if (value === undefined) continue;
      const plaintext = typeof value === 'string' ? value.trim() : JSON.stringify(value);
      const result = encryptContextValue(plaintext, {
        entity: 'user_business_profile', recordId: id, ownerUserId: userId, field
      }, dependencies.keys);
      if (!result) return null;
      encrypted[field] = result.ciphertext;
      keyVersion = result.keyVersion;
    }

    const create: Prisma.UserBusinessProfileUncheckedCreateInput = {
      id,
      userId,
      displayName: typeof parsed.data.displayName === 'string' ? parsed.data.displayName.trim() : null,
      legalName: encrypted.legalName || null,
      taxIdEncrypted: encrypted.taxId || null,
      email: encrypted.email || null,
      phone: encrypted.phone || null,
      addressJson: encrypted.address || null,
      pixJson: encrypted.pix || null,
      preferencesJson: (parsed.data.preferences || {}) as Prisma.InputJsonValue,
      encryptionKeyVersion: keyVersion || null,
      consentVersion: CONTEXT_CONSENT_VERSION,
      consentedAt: now
    };
    const update: Prisma.UserBusinessProfileUncheckedUpdateInput = {
      consentVersion: CONTEXT_CONSENT_VERSION,
      consentedAt: now,
      ...(keyVersion ? { encryptionKeyVersion: keyVersion } : {})
    };
    if (encrypted.legalName) update.legalName = encrypted.legalName;
    else if (parsed.data.mode === 'replace') update.legalName = null;
    if (encrypted.taxId) update.taxIdEncrypted = encrypted.taxId;
    else if (parsed.data.mode === 'replace') update.taxIdEncrypted = null;
    if (encrypted.email) update.email = encrypted.email;
    else if (parsed.data.mode === 'replace') update.email = null;
    if (encrypted.phone) update.phone = encrypted.phone;
    else if (parsed.data.mode === 'replace') update.phone = null;
    if (encrypted.address) update.addressJson = encrypted.address;
    else if (parsed.data.mode === 'replace') update.addressJson = null;
    if (encrypted.pix) update.pixJson = encrypted.pix;
    else if (parsed.data.mode === 'replace') update.pixJson = null;
    if (parsed.data.displayName !== undefined) update.displayName = String(parsed.data.displayName).trim();
    else if (parsed.data.mode === 'replace') update.displayName = null;
    if (parsed.data.preferences !== undefined) update.preferencesJson = parsed.data.preferences as Prisma.InputJsonValue;
    else if (parsed.data.mode === 'replace') update.preferencesJson = {};

    await dependencies.persist({
      id,
      userId,
      create,
      update,
      audit: {
        actorUserId: userId,
        entityType: 'user_business_profile',
        entityId: id,
        action: existingId ? 'updated' : 'created',
        changedFields: contextChangedFields(parsed.data) as Prisma.InputJsonValue,
        consentVersion: CONTEXT_CONSENT_VERSION,
        occurredAt: now
      }
    });
    return { id };
  } catch (error) {
    console.error('[context] profile write failed', { error });
    return null;
  }
}
