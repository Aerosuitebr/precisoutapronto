import { getPrisma } from '@/lib/db';
import {
  isSafeIntentKey,
  parseIntentEdgeRule,
  parseIntentTransferSchema
} from '@/lib/intent-graph/contracts';

export async function getActiveIntentGraph(toolKey?: string) {
  if (toolKey && !isSafeIntentKey(toolKey)) return [];
  const nodes = await getPrisma().intentNode.findMany({
    where: { active: true, ...(toolKey ? { key: toolKey } : {}) },
    select: {
      key: true,
      type: true,
      label: true,
      description: true,
      frequencyClass: true,
      riskLevel: true,
      outgoingEdges: {
        where: { active: true, toNode: { active: true } },
        select: {
          relationType: true,
          weight: true,
          transferSchema: true,
          ruleJson: true,
          toNode: { select: { key: true, label: true, type: true, riskLevel: true } }
        },
        orderBy: [{ weight: 'desc' }, { toNode: { key: 'asc' } }]
      }
    },
    orderBy: { key: 'asc' }
  });

  return nodes.map((node) => ({
    ...node,
    outgoingEdges: node.outgoingEdges.flatMap((edge) => {
      const transferSchema = parseIntentTransferSchema(edge.transferSchema);
      const rule = parseIntentEdgeRule(edge.ruleJson);
      if (!transferSchema || !rule) return [];
      return [{
        relationType: edge.relationType,
        weight: Number(edge.weight),
        transferSchema,
        rule,
        target: edge.toNode
      }];
    })
  }));
}
