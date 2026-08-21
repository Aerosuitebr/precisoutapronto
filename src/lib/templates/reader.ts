import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';

export interface TemplateListQuery {
  limit: 10 | 20 | 50;
  cursor?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseTemplateListQuery(searchParams: URLSearchParams): TemplateListQuery | null {
  const limit = Number(searchParams.get('limit') || 20);
  if (![10, 20, 50].includes(limit)) return null;
  const cursor = (searchParams.get('cursor') || '').trim();
  if (cursor && !UUID.test(cursor)) return null;
  return { limit: limit as 10 | 20 | 50, ...(cursor ? { cursor } : {}) };
}

interface ReaderDependencies {
  databaseConfigured: () => boolean;
  decide: typeof getFeatureFlagDecision;
  find: (ownerUserId: string, query: TemplateListQuery) => Promise<Array<{
    id: string; toolKey: string; name: string; visibility: string; status: string;
    createdAt: Date; updatedAt: Date;
  }>>;
}

const defaultDependencies: ReaderDependencies = {
  databaseConfigured: isDatabaseConfigured,
  decide: getFeatureFlagDecision,
  find: (ownerUserId, query) => getPrisma().personalTemplate.findMany({
    where: { ownerUserId, visibility: 'private', status: 'active' },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    select: {
      id: true, toolKey: true, name: true, visibility: true, status: true,
      createdAt: true, updatedAt: true
    }
  })
};

export async function listPersonalTemplates(
  ownerUserId: string,
  query: TemplateListQuery,
  dependencies: ReaderDependencies = defaultDependencies
) {
  try {
    if (!ownerUserId || !dependencies.databaseConfigured()) return null;
    const decision = await dependencies.decide('personal_templates_v1', ownerUserId);
    if (!decision.enabled) return { enabled: false as const, templates: [], nextCursor: null };
    const rows = await dependencies.find(ownerUserId, query);
    const hasMore = rows.length > query.limit;
    const page = rows.slice(0, query.limit);
    return {
      enabled: true as const,
      templates: page.map((row) => ({
        id: row.id, toolKey: row.toolKey, name: row.name,
        visibility: row.visibility, status: row.status,
        createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString()
      })),
      nextCursor: hasMore ? page.at(-1)?.id || null : null
    };
  } catch (error) {
    console.error('[personal-templates] list failed', { error });
    return null;
  }
}
