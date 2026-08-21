import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { contextChangedFields } from './audit';
import { CONTEXT_CONSENT_VERSION, parseCustomerCreate, parseCustomerPatch } from './contracts';
import { encryptContextValue } from './encryption';
import { environmentContextKeyProvider, type ContextKeyProvider } from './key-provider';

interface CustomerRepositoryDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  keys: ContextKeyProvider;
  findDuplicate: (ownerUserId: string, displayName: string) => Promise<{ id: string; displayName: string } | null>;
  persist: (input: {
    customer: Prisma.CustomerUncheckedCreateInput;
    audit: Prisma.ContextAuditEventUncheckedCreateInput;
  }) => Promise<void>;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: CustomerRepositoryDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  keys: environmentContextKeyProvider,
  findDuplicate: (ownerUserId, displayName) => getPrisma().customer.findFirst({
    where: {
      ownerUserId,
      archivedAt: null,
      displayName: { equals: displayName, mode: 'insensitive' }
    },
    select: { id: true, displayName: true }
  }),
  persist: async ({ customer, audit }) => {
    await getPrisma().$transaction([
      getPrisma().customer.create({ data: customer }),
      getPrisma().contextAuditEvent.create({ data: audit })
    ]);
  },
  uuid: randomUUID,
  now: () => new Date()
};

export async function createContextCustomer(
  ownerUserId: string,
  input: unknown,
  dependencies: CustomerRepositoryDependencies = defaultDependencies
) {
  try {
    if (!ownerUserId || !dependencies.databaseConfigured()) return null;
    const parsed = parseCustomerCreate(input);
    if (!parsed.ok) return null;
    const decision = await dependencies.decide('reusable_context_v1', ownerUserId);
    if (!decision.enabled) return null;
    const displayName = String(parsed.data.displayName).trim();
    const duplicate = await dependencies.findDuplicate(ownerUserId, displayName);
    if (duplicate) return { duplicate: true as const, customer: duplicate };

    const id = dependencies.uuid();
    const now = dependencies.now();
    const encrypted: Record<string, Buffer> = {};
    let keyVersion: string | undefined;
    for (const field of ['legalName', 'taxId', 'email', 'phone', 'address'] as const) {
      const value = parsed.data[field];
      if (value === undefined) continue;
      const plaintext = typeof value === 'string' ? value.trim() : JSON.stringify(value);
      const result = encryptContextValue(plaintext, {
        entity: 'customer', recordId: id, ownerUserId, field
      }, dependencies.keys);
      if (!result) return null;
      encrypted[field] = result.ciphertext;
      keyVersion = result.keyVersion;
    }
    const customer: Prisma.CustomerUncheckedCreateInput = {
      id,
      ownerUserId,
      type: String(parsed.data.type),
      displayName,
      legalName: encrypted.legalName || null,
      taxIdEncrypted: encrypted.taxId || null,
      email: encrypted.email || null,
      phone: encrypted.phone || null,
      addressJson: encrypted.address || null,
      metadata: (parsed.data.metadata || {}) as Prisma.InputJsonValue,
      encryptionKeyVersion: keyVersion || null,
      consentVersion: CONTEXT_CONSENT_VERSION,
      consentedAt: now
    };
    await dependencies.persist({
      customer,
      audit: {
        actorUserId: ownerUserId,
        entityType: 'customer',
        entityId: id,
        action: 'created',
        changedFields: contextChangedFields(parsed.data) as Prisma.InputJsonValue,
        consentVersion: CONTEXT_CONSENT_VERSION,
        occurredAt: now
      }
    });
    return { duplicate: false as const, customer: { id, displayName, type: customer.type } };
  } catch (error) {
    console.error('[context] customer create failed', { error });
    return null;
  }
}

interface CustomerUpdateDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  keys: ContextKeyProvider;
  existsOwned: (ownerUserId: string, id: string) => Promise<boolean>;
  persist: (input: {
    id: string;
    ownerUserId: string;
    update: Prisma.CustomerUncheckedUpdateManyInput;
    audit: Prisma.ContextAuditEventUncheckedCreateInput;
  }) => Promise<void>;
  now: () => Date;
}

const defaultUpdateDependencies: CustomerUpdateDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  keys: environmentContextKeyProvider,
  existsOwned: async (ownerUserId, id) => Boolean(await getPrisma().customer.findFirst({
    where: { id, ownerUserId, archivedAt: null }, select: { id: true }
  })),
  persist: ({ id, ownerUserId, update, audit }) => getPrisma().$transaction(async (tx) => {
    const result = await tx.customer.updateMany({ where: { id, ownerUserId, archivedAt: null }, data: update });
    if (result.count !== 1) throw new Error('customer-ownership-changed');
    await tx.contextAuditEvent.create({ data: audit });
  }),
  now: () => new Date()
};

export async function updateContextCustomer(
  ownerUserId: string,
  id: string,
  input: unknown,
  dependencies: CustomerUpdateDependencies = defaultUpdateDependencies
) {
  try {
    if (!ownerUserId || !id || !dependencies.databaseConfigured()) return null;
    const parsed = parseCustomerPatch(input);
    if (!parsed.ok) return null;
    const decision = await dependencies.decide('reusable_context_v1', ownerUserId);
    if (!decision.enabled) return null;
    if (!await dependencies.existsOwned(ownerUserId, id)) return { notFound: true as const };
    const now = dependencies.now();
    const encrypted: Record<string, Buffer | null> = {};
    let keyVersion: string | undefined;
    for (const field of ['legalName', 'taxId', 'email', 'phone', 'address'] as const) {
      const value = parsed.data[field];
      if (value === undefined) continue;
      if (value === null) { encrypted[field] = null; continue; }
      const plaintext = typeof value === 'string' ? value.trim() : JSON.stringify(value);
      const result = encryptContextValue(plaintext, {
        entity: 'customer', recordId: id, ownerUserId, field
      }, dependencies.keys);
      if (!result) return null;
      encrypted[field] = result.ciphertext;
      keyVersion = result.keyVersion;
    }
    const update: Prisma.CustomerUncheckedUpdateManyInput = {
      consentVersion: CONTEXT_CONSENT_VERSION,
      consentedAt: now,
      ...(keyVersion ? { encryptionKeyVersion: keyVersion } : {})
    };
    if (parsed.data.displayName !== undefined) update.displayName = String(parsed.data.displayName).trim();
    if ('legalName' in encrypted) update.legalName = encrypted.legalName;
    if ('taxId' in encrypted) update.taxIdEncrypted = encrypted.taxId;
    if ('email' in encrypted) update.email = encrypted.email;
    if ('phone' in encrypted) update.phone = encrypted.phone;
    if ('address' in encrypted) update.addressJson = encrypted.address;
    if (parsed.data.metadata !== undefined) update.metadata = parsed.data.metadata as Prisma.InputJsonValue;
    await dependencies.persist({
      id,
      ownerUserId,
      update,
      audit: {
        actorUserId: ownerUserId,
        entityType: 'customer',
        entityId: id,
        action: 'updated',
        changedFields: contextChangedFields(parsed.data) as Prisma.InputJsonValue,
        consentVersion: CONTEXT_CONSENT_VERSION,
        occurredAt: now
      }
    });
    return { notFound: false as const, customer: { id } };
  } catch (error) {
    console.error('[context] customer update failed', { error });
    return null;
  }
}

interface CustomerArchiveDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  persist: (input: {
    id: string;
    ownerUserId: string;
    archivedAt: Date;
    audit: Prisma.ContextAuditEventUncheckedCreateInput;
  }) => Promise<boolean>;
  now: () => Date;
}

const defaultArchiveDependencies: CustomerArchiveDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  persist: ({ id, ownerUserId, archivedAt, audit }) => getPrisma().$transaction(async (tx) => {
    const result = await tx.customer.updateMany({
      where: { id, ownerUserId, archivedAt: null },
      data: { archivedAt }
    });
    if (result.count !== 1) return false;
    await tx.contextAuditEvent.create({ data: audit });
    return true;
  }),
  now: () => new Date()
};

export async function archiveContextCustomer(
  ownerUserId: string,
  id: string,
  dependencies: CustomerArchiveDependencies = defaultArchiveDependencies
) {
  try {
    if (!ownerUserId || !id || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('reusable_context_v1', ownerUserId);
    if (!decision.enabled) return null;
    const archivedAt = dependencies.now();
    const archived = await dependencies.persist({
      id,
      ownerUserId,
      archivedAt,
      audit: {
        actorUserId: ownerUserId,
        entityType: 'customer',
        entityId: id,
        action: 'archived',
        changedFields: ['archivedAt'] as Prisma.InputJsonValue,
        consentVersion: CONTEXT_CONSENT_VERSION,
        occurredAt: archivedAt
      }
    });
    return archived ? { notFound: false as const, archivedAt: archivedAt.toISOString() } : { notFound: true as const };
  } catch (error) {
    console.error('[context] customer archive failed', { error });
    return null;
  }
}

interface CustomerRestoreDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  persist: (input: {
    id: string;
    ownerUserId: string;
    restoredAt: Date;
    audit: Prisma.ContextAuditEventUncheckedCreateInput;
  }) => Promise<boolean>;
  now: () => Date;
}

const defaultRestoreDependencies: CustomerRestoreDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  persist: ({ id, ownerUserId, audit }) => getPrisma().$transaction(async (tx) => {
    const result = await tx.customer.updateMany({
      where: { id, ownerUserId, archivedAt: { not: null } },
      data: { archivedAt: null }
    });
    if (result.count !== 1) return false;
    await tx.contextAuditEvent.create({ data: audit });
    return true;
  }),
  now: () => new Date()
};

export async function restoreContextCustomer(
  ownerUserId: string,
  id: string,
  dependencies: CustomerRestoreDependencies = defaultRestoreDependencies
) {
  try {
    if (!ownerUserId || !id || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('reusable_context_v1', ownerUserId);
    if (!decision.enabled) return null;
    const restoredAt = dependencies.now();
    const restored = await dependencies.persist({
      id,
      ownerUserId,
      restoredAt,
      audit: {
        actorUserId: ownerUserId,
        entityType: 'customer',
        entityId: id,
        action: 'restored',
        changedFields: ['archivedAt'] as Prisma.InputJsonValue,
        consentVersion: CONTEXT_CONSENT_VERSION,
        occurredAt: restoredAt
      }
    });
    return restored ? { notFound: false as const, restoredAt: restoredAt.toISOString() } : { notFound: true as const };
  } catch (error) {
    console.error('[context] customer restore failed', { error });
    return null;
  }
}
