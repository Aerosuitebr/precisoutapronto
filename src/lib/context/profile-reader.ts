import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { decryptContextValue, type ContextEncryptionScope } from './encryption';
import { environmentContextKeyProvider, type ContextKeyProvider } from './key-provider';

interface StoredProfile {
  id: string;
  displayName: string | null;
  legalName: Buffer | null;
  taxIdEncrypted: Buffer | null;
  email: Buffer | null;
  phone: Buffer | null;
  addressJson: Buffer | null;
  pixJson: Buffer | null;
  preferencesJson: unknown;
  consentVersion: string;
  consentedAt: Date;
  updatedAt: Date;
}

interface ProfileReaderDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  keys: ContextKeyProvider;
  find: (userId: string) => Promise<StoredProfile | null>;
}

const defaultDependencies: ProfileReaderDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  keys: environmentContextKeyProvider,
  find: (userId) => getPrisma().userBusinessProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      displayName: true,
      legalName: true,
      taxIdEncrypted: true,
      email: true,
      phone: true,
      addressJson: true,
      pixJson: true,
      preferencesJson: true,
      consentVersion: true,
      consentedAt: true,
      updatedAt: true
    }
  })
};

function safePreferences(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  return {
    ...(input.defaultCurrency === 'BRL' ? { defaultCurrency: 'BRL' } : {}),
    ...(input.locale === 'pt-BR' ? { locale: 'pt-BR' } : {}),
    ...(typeof input.reuseBusinessContext === 'boolean'
      ? { reuseBusinessContext: input.reuseBusinessContext }
      : {})
  };
}

export async function readBusinessContextProfile(
  userId: string,
  dependencies: ProfileReaderDependencies = defaultDependencies
) {
  try {
    if (!userId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('reusable_context_v1', userId);
    if (!decision.enabled) return { enabled: false, context: null };
    const stored = await dependencies.find(userId);
    if (!stored) return { enabled: true, context: null };

    const scope = (field: string): ContextEncryptionScope => ({
      entity: 'user_business_profile', recordId: stored.id, ownerUserId: userId, field
    });
    const decrypt = (value: Buffer | null, field: string) => value
      ? decryptContextValue(value, scope(field), dependencies.keys)
      : null;
    const legalName = decrypt(stored.legalName, 'legalName');
    const taxId = decrypt(stored.taxIdEncrypted, 'taxId');
    const email = decrypt(stored.email, 'email');
    const phone = decrypt(stored.phone, 'phone');
    const address = decrypt(stored.addressJson, 'address');
    const pix = decrypt(stored.pixJson, 'pix');
    const requiredDecryptions = [
      [stored.legalName, legalName], [stored.taxIdEncrypted, taxId], [stored.email, email],
      [stored.phone, phone], [stored.addressJson, address], [stored.pixJson, pix]
    ];
    if (requiredDecryptions.some(([encrypted, plaintext]) => encrypted && plaintext === null)) return null;

    return {
      enabled: true,
      context: {
        id: stored.id,
        displayName: stored.displayName,
        legalName,
        taxId,
        email,
        phone,
        address: address ? JSON.parse(address) : null,
        pix: pix ? JSON.parse(pix) : null,
        preferences: safePreferences(stored.preferencesJson),
        consentVersion: stored.consentVersion,
        consentedAt: stored.consentedAt.toISOString(),
        updatedAt: stored.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error('[context] profile read failed', { error });
    return null;
  }
}
