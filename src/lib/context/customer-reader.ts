import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { decryptContextValue } from './encryption';
import { environmentContextKeyProvider, type ContextKeyProvider } from './key-provider';

export interface CustomerListQuery {
  search?: string;
  cursor?: string;
  limit: 10 | 20 | 50;
}

export function parseCustomerListQuery(searchParams: URLSearchParams): CustomerListQuery | null {
  const requestedLimit = Number(searchParams.get('limit') || 20);
  if (![10, 20, 50].includes(requestedLimit)) return null;
  const search = (searchParams.get('search') || '').trim();
  if (search.length > 80) return null;
  const cursor = (searchParams.get('cursor') || '').trim();
  if (cursor && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cursor)) return null;
  return {
    limit: requestedLimit as 10 | 20 | 50,
    ...(search ? { search } : {}),
    ...(cursor ? { cursor } : {})
  };
}

interface CustomerReaderDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  find: (ownerUserId: string, query: CustomerListQuery) => Promise<Array<{
    id: string;
    type: string;
    displayName: string;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }>>;
}

const defaultDependencies: CustomerReaderDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  find: (ownerUserId, query) => getPrisma().customer.findMany({
    where: {
      ownerUserId,
      archivedAt: null,
      ...(query.search ? { displayName: { contains: query.search, mode: 'insensitive' } } : {})
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    select: { id: true, type: true, displayName: true, metadata: true, createdAt: true, updatedAt: true }
  })
};

function safeMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const tags = Array.isArray(input.tags)
    ? input.tags.filter((tag): tag is string => typeof tag === 'string' && /^[a-z0-9_-]{1,32}$/.test(tag)).slice(0, 10)
    : [];
  return { ...(input.source === 'manual' ? { source: 'manual' } : {}), ...(tags.length ? { tags } : {}) };
}

export async function listContextCustomers(
  ownerUserId: string,
  query: CustomerListQuery,
  dependencies: CustomerReaderDependencies = defaultDependencies
) {
  try {
    if (!ownerUserId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('reusable_context_v1', ownerUserId);
    if (!decision.enabled) return { enabled: false, customers: [], nextCursor: null };
    const rows = await dependencies.find(ownerUserId, query);
    const hasMore = rows.length > query.limit;
    const page = rows.slice(0, query.limit);
    return {
      enabled: true,
      customers: page.map((row) => ({
        id: row.id,
        type: row.type,
        displayName: row.displayName,
        metadata: safeMetadata(row.metadata),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      })),
      nextCursor: hasMore ? page.at(-1)?.id || null : null
    };
  } catch (error) {
    console.error('[context] customer list failed', { error });
    return null;
  }
}

interface CustomerDetailDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  keys: ContextKeyProvider;
  find: (ownerUserId: string, id: string) => Promise<{
    id: string; type: string; displayName: string; legalName: Buffer | null;
    taxIdEncrypted: Buffer | null; email: Buffer | null; phone: Buffer | null;
    addressJson: Buffer | null; metadata: unknown; createdAt: Date; updatedAt: Date;
  } | null>;
}

const defaultDetailDependencies: CustomerDetailDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  keys: environmentContextKeyProvider,
  find: (ownerUserId, id) => getPrisma().customer.findFirst({
    where: { id, ownerUserId, archivedAt: null },
    select: {
      id: true, type: true, displayName: true, legalName: true, taxIdEncrypted: true,
      email: true, phone: true, addressJson: true, metadata: true, createdAt: true, updatedAt: true
    }
  })
};

export async function getContextCustomer(
  ownerUserId: string,
  id: string,
  dependencies: CustomerDetailDependencies = defaultDetailDependencies
) {
  try {
    if (!ownerUserId || !id || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('reusable_context_v1', ownerUserId);
    if (!decision.enabled) return { enabled: false as const };
    const row = await dependencies.find(ownerUserId, id);
    if (!row) return { enabled: true as const, notFound: true as const };
    const decrypt = (field: string, value: Buffer | null) => value
      ? decryptContextValue(value, { entity: 'customer', recordId: id, ownerUserId, field }, dependencies.keys)
      : null;
    const addressText = decrypt('address', row.addressJson);
    let address: unknown = null;
    if (addressText) {
      try { address = JSON.parse(addressText); } catch { return null; }
    }
    return {
      enabled: true as const,
      notFound: false as const,
      customer: {
        id: row.id, type: row.type, displayName: row.displayName,
        legalName: decrypt('legalName', row.legalName),
        taxId: decrypt('taxId', row.taxIdEncrypted),
        email: decrypt('email', row.email),
        phone: decrypt('phone', row.phone),
        address,
        metadata: safeMetadata(row.metadata),
        createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error('[context] customer detail failed', { error });
    return null;
  }
}
