import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { getActiveIntentGraph } from '@/lib/intent-graph/repository';
import { getToolById } from '@/lib/tools-catalog';

type RiskLevel = 'low' | 'medium' | 'high';

interface RankableIntentEdge {
  relationType: string;
  weight: number;
  transferSchema: { version: 1; fields: string[] };
  rule: { requiresOutcome?: 'completed' };
  target: { key: string; label: string; riskLevel: string };
}

export interface RankedNextAction {
  key: string;
  label: string;
  targetToolKey: string;
  targetUrl: string;
  reasonCode: string;
  rank: number;
  transferAvailable: boolean;
  transferableFieldKeys: string[];
  variant: 'rules_v1';
}

const RISK_ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };

export function rankIntentEdges(input: {
  sourceToolKey: string;
  outcomeStatus?: string;
  maximumRiskLevel?: RiskLevel;
  edges: RankableIntentEdge[];
  resolveTool?: (key: string) => { href: string; status: string } | null;
}) {
  const maximumRisk = RISK_ORDER[input.maximumRiskLevel || 'high'];
  const resolveTool = input.resolveTool || ((key: string) => getToolById(key));
  return input.edges
    .flatMap((edge) => {
      if (edge.relationType !== 'next_action' || edge.target.key === input.sourceToolKey) return [];
      if (!Number.isFinite(edge.weight) || edge.weight < 0 || edge.weight > 1) return [];
      const targetRisk = RISK_ORDER[edge.target.riskLevel as RiskLevel];
      if (targetRisk === undefined || targetRisk > maximumRisk) return [];
      if (edge.rule.requiresOutcome && edge.rule.requiresOutcome !== input.outcomeStatus) return [];
      const tool = resolveTool(edge.target.key);
      if (!tool || tool.status === 'soon' || !tool.href.startsWith('/')) return [];
      return [{ edge, targetUrl: tool.href }];
    })
    .sort((left, right) => right.edge.weight - left.edge.weight || left.edge.target.key.localeCompare(right.edge.target.key))
    .slice(0, 3)
    .map(({ edge, targetUrl }, index): RankedNextAction => ({
      key: `${input.sourceToolKey}.${edge.target.key}`,
      label: edge.target.label,
      targetToolKey: edge.target.key,
      targetUrl,
      reasonCode: `intent_graph.${edge.relationType}`,
      rank: index + 1,
      transferAvailable: edge.transferSchema.fields.length > 0,
      transferableFieldKeys: edge.transferSchema.fields,
      variant: 'rules_v1'
    }));
}

interface GatedRankerDependencies {
  decide: typeof getFeatureFlagDecision;
  graph: typeof getActiveIntentGraph;
}

const defaultDependencies: GatedRankerDependencies = {
  decide: getFeatureFlagDecision,
  graph: getActiveIntentGraph
};

export async function getGatedRankedNextActions(input: {
  sourceToolKey: string;
  subjectKey: string;
  outcomeStatus?: string;
  maximumRiskLevel?: RiskLevel;
}, dependencies: GatedRankerDependencies = defaultDependencies) {
  try {
    const decision = await dependencies.decide('nba_v1', input.subjectKey);
    if (!decision.enabled) return [];
    const [source] = await dependencies.graph(input.sourceToolKey);
    if (!source) return [];
    return rankIntentEdges({ ...input, edges: source.outgoingEdges });
  } catch (error) {
    console.error('[recommendation] non-blocking ranking failed', {
      sourceToolKey: input.sourceToolKey,
      error
    });
    return [];
  }
}
