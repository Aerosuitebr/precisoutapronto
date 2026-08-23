import { NextResponse } from 'next/server';
import { isInternalDashboardEmail } from '@/lib/auth/internal-access';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { productEventRetentionCutoff, productEventRetentionDays } from '@/lib/events/retention';
import { aggregateRate, productViralFunnelMetrics } from '@/lib/growth/product-viral-funnel';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
  }
  const session = await getValidSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!isInternalDashboardEmail(session.email)) {
    return NextResponse.json({ error: 'Acesso interno restrito.' }, { status: 403 });
  }

  const requestedDays = Number(new URL(request.url).searchParams.get('days') || 7);
  const days = [1, 7, 30].includes(requestedDays) ? requestedDays : 7;
  const since = new Date(Date.now() - days * 86_400_000);
  const retentionDays = productEventRetentionDays();
  const retentionCutoff = productEventRetentionCutoff();
  const prisma = getPrisma();
  const where = { occurredAt: { gte: since } };

  const [total, recentHour, byEvent, byTool, viralRows, continuityRows, transitionRows, creatorCampaignRows, flag, retentionEligible] = await Promise.all([
    prisma.productEvent.count({ where }),
    prisma.productEvent.count({ where: { occurredAt: { gte: new Date(Date.now() - 3_600_000) } } }),
    prisma.productEvent.groupBy({
      by: ['eventName'],
      where,
      _count: { _all: true },
      orderBy: { _count: { eventName: 'desc' } }
    }),
    prisma.productEvent.groupBy({
      by: ['toolKey'],
      where,
      _count: { _all: true },
      orderBy: { _count: { toolKey: 'desc' } }
    }),
    prisma.$queryRaw<Array<{
      toolKey: string;
      completed: bigint;
      shared: bigint;
      opened: bigint;
      acted: bigint;
      activated: bigint;
    }>>`
      SELECT
        COALESCE("toolKey", 'unknown') AS "toolKey",
        COUNT(DISTINCT "anonymousId") FILTER (WHERE "eventName" = 'task.completed')::bigint AS completed,
        COUNT(DISTINCT "anonymousId") FILTER (WHERE "eventName" = 'outcome.shared')::bigint AS shared,
        COUNT(DISTINCT "anonymousId") FILTER (WHERE "eventName" = 'growth.share_opened')::bigint AS opened,
        COUNT(DISTINCT "anonymousId") FILTER (WHERE "eventName" = 'growth.recipient_action')::bigint AS acted,
        COUNT(DISTINCT "anonymousId") FILTER (WHERE "eventName" = 'growth.recipient_activated')::bigint AS activated
      FROM "product_events"
      WHERE "occurredAt" >= ${since}
        AND "eventName" IN ('task.completed', 'outcome.shared', 'growth.share_opened', 'growth.recipient_action', 'growth.recipient_activated')
      GROUP BY COALESCE("toolKey", 'unknown')
      ORDER BY shared DESC, opened DESC
      LIMIT 30
    `,
    prisma.$queryRaw<Array<{ toolKey: string; duplicated: bigint; secondToolUsers: bigint }>>`
      WITH first_tools AS (
        SELECT DISTINCT ON ("anonymousId")
          "anonymousId", "toolKey" AS source_tool, "occurredAt" AS source_at
        FROM "product_events"
        WHERE "occurredAt" >= ${since}
          AND "eventName" IN ('task.started', 'task.completed')
          AND "toolKey" IS NOT NULL
        ORDER BY "anonymousId", "occurredAt" ASC
      ), second_tools AS (
        SELECT first_tools.source_tool, COUNT(DISTINCT first_tools."anonymousId")::bigint AS users
        FROM first_tools
        WHERE EXISTS (
          SELECT 1 FROM "product_events" later
          WHERE later."anonymousId" = first_tools."anonymousId"
            AND later."occurredAt" > first_tools.source_at
            AND later."eventName" = 'task.started'
            AND later."toolKey" IS NOT NULL
            AND later."toolKey" <> first_tools.source_tool
        )
        GROUP BY first_tools.source_tool
      ), duplicates AS (
        SELECT "toolKey" AS source_tool, COUNT(DISTINCT "anonymousId")::bigint AS users
        FROM "product_events"
        WHERE "occurredAt" >= ${since}
          AND "eventName" = 'continuity.duplicated'
          AND "toolKey" IS NOT NULL
        GROUP BY "toolKey"
      )
      SELECT COALESCE(duplicates.source_tool, second_tools.source_tool) AS "toolKey",
        COALESCE(duplicates.users, 0)::bigint AS duplicated,
        COALESCE(second_tools.users, 0)::bigint AS "secondToolUsers"
      FROM duplicates FULL OUTER JOIN second_tools ON second_tools.source_tool = duplicates.source_tool
      ORDER BY "secondToolUsers" DESC, duplicated DESC
      LIMIT 30
    `,
    prisma.$queryRaw<Array<{ sourceTool: string; targetTool: string; users: bigint }>>`
      WITH first_tools AS (
        SELECT DISTINCT ON ("anonymousId")
          "anonymousId", "toolKey" AS source_tool, "occurredAt" AS source_at
        FROM "product_events"
        WHERE "occurredAt" >= ${since}
          AND "eventName" IN ('task.started', 'task.completed')
          AND "toolKey" IS NOT NULL
        ORDER BY "anonymousId", "occurredAt" ASC
      ), transitions AS (
        SELECT first_tools."anonymousId", first_tools.source_tool, next_tool."toolKey" AS target_tool
        FROM first_tools
        CROSS JOIN LATERAL (
          SELECT later."toolKey"
          FROM "product_events" later
          WHERE later."anonymousId" = first_tools."anonymousId"
            AND later."occurredAt" > first_tools.source_at
            AND later."eventName" = 'task.started'
            AND later."toolKey" IS NOT NULL
            AND later."toolKey" <> first_tools.source_tool
          ORDER BY later."occurredAt" ASC
          LIMIT 1
        ) next_tool
      )
      SELECT source_tool AS "sourceTool", target_tool AS "targetTool", COUNT(DISTINCT "anonymousId")::bigint AS users
      FROM transitions
      GROUP BY source_tool, target_tool
      ORDER BY users DESC
      LIMIT 20
    `,
    prisma.$queryRaw<Array<{ source: string; campaign: string; entryTool: string; starters: bigint; completed: bigint; secondGeneration: bigint; secondTool: bigint }>>`
      WITH attributed AS (
        SELECT DISTINCT ON ("anonymousId")
          "anonymousId",
          COALESCE("properties"->>'utm_source', 'unknown') AS source,
          COALESCE("properties"->>'utm_campaign', 'unknown') AS campaign,
          COALESCE("toolKey", 'unknown') AS entry_tool,
          "occurredAt" AS attributed_at
        FROM "product_events"
        WHERE "occurredAt" >= ${since}
          AND "eventName" = 'task.started'
          AND COALESCE("properties"->>'utm_medium', '') IN ('creator', 'partner')
        ORDER BY "anonymousId", "occurredAt" ASC
      )
      SELECT
        attributed.source,
        attributed.campaign,
        attributed.entry_tool AS "entryTool",
        COUNT(*)::bigint AS starters,
        COUNT(*) FILTER (WHERE activity.completed_count >= 1)::bigint AS completed,
        COUNT(*) FILTER (WHERE activity.completed_count >= 2)::bigint AS "secondGeneration",
        COUNT(*) FILTER (WHERE activity.used_second_tool)::bigint AS "secondTool"
      FROM attributed
      CROSS JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE later."eventName" = 'task.completed') AS completed_count,
          COALESCE(BOOL_OR(later."eventName" = 'task.started' AND later."toolKey" IS NOT NULL AND later."toolKey" <> attributed.entry_tool), false) AS used_second_tool
        FROM "product_events" later
        WHERE later."anonymousId" = attributed."anonymousId"
          AND later."occurredAt" >= attributed.attributed_at
      ) activity
      GROUP BY attributed.source, attributed.campaign, attributed.entry_tool
      ORDER BY completed DESC, starters DESC
      LIMIT 30
    `,
    prisma.featureFlag.findUnique({
      where: { key: 'event_platform_v1' },
      select: { enabled: true, rolloutPercent: true, updatedAt: true }
    }),
    prisma.productEvent.count({ where: { receivedAt: { lt: retentionCutoff } } })
  ]);

  return NextResponse.json({
    window: { days, since: since.toISOString() },
    totals: { events: total, lastHour: recentHour },
    byEvent: byEvent.map((row) => ({ eventName: row.eventName, count: row._count._all })),
    byTool: byTool.map((row) => ({ toolKey: row.toolKey || 'unknown', count: row._count._all })),
    viralFunnel: viralRows.map((row) => productViralFunnelMetrics({
      toolKey: row.toolKey,
      completed: Number(row.completed),
      shared: Number(row.shared),
      opened: Number(row.opened),
      acted: Number(row.acted),
      activated: Number(row.activated)
    })),
    continuity: continuityRows.map((row) => {
      const completed = Number(viralRows.find((viral) => viral.toolKey === row.toolKey)?.completed || 0);
      return {
        toolKey: row.toolKey,
        duplicated: Number(row.duplicated),
        secondToolUsers: Number(row.secondToolUsers),
        duplicationRate: aggregateRate(Number(row.duplicated), completed),
        secondToolRate: aggregateRate(Number(row.secondToolUsers), completed)
      };
    }),
    transitions: transitionRows.map((row) => ({ sourceTool: row.sourceTool, targetTool: row.targetTool, users: Number(row.users) })),
    creatorCampaigns: creatorCampaignRows.map((row) => ({
      source: row.source,
      campaign: row.campaign,
      entryTool: row.entryTool,
      starters: Number(row.starters),
      completed: Number(row.completed),
      secondGeneration: Number(row.secondGeneration),
      secondTool: Number(row.secondTool),
      completionRate: aggregateRate(Number(row.completed), Number(row.starters)),
      secondGenerationRate: aggregateRate(Number(row.secondGeneration), Number(row.starters))
    })),
    flag: flag
      ? {
          enabled: flag.enabled,
          rolloutPercent: flag.rolloutPercent,
          updatedAt: flag.updatedAt.toISOString()
        }
      : null,
    retention: {
      days: retentionDays,
      cutoff: retentionCutoff.toISOString(),
      eligibleForFutureCleanup: retentionEligible,
      enforcement: 'disabled'
    },
    privacy: 'Aggregates only; event properties and subject identifiers are not returned.'
  });
}
