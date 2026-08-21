export const RECOMMENDATION_OBSERVABILITY_WINDOWS = [1, 7, 30] as const;

export function recommendationObservabilityDays(value: string | null) {
  const requested = Number(value || 7);
  return RECOMMENDATION_OBSERVABILITY_WINDOWS.includes(requested as 1 | 7 | 30) ? requested : 7;
}

function percentage(numerator: number, denominator: number) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(2)) : 0;
}

export function recommendationMetrics(rows: Array<{ eventName: string; _count: { _all: number } }>) {
  const count = (eventName: string) => rows.find((row) => row.eventName === eventName)?._count._all || 0;
  const shown = count('recommendation.shown');
  const clicked = count('recommendation.clicked');
  const completed = count('recommendation.completed');
  return {
    shown,
    clicked,
    completed,
    clickThroughRate: percentage(clicked, shown),
    completionRate: percentage(completed, shown),
    clickToCompletionRate: percentage(completed, clicked)
  };
}

export function recommendationRolloutReadiness(input: {
  trackingSecretConfigured: boolean;
  nbaFlagEnabled: boolean;
  eventPlatformEnabled: boolean;
  killSwitchActive: boolean;
  activeEdges: number;
}) {
  const blockers: string[] = [];
  if (!input.trackingSecretConfigured) blockers.push('tracking-secret-missing');
  if (!input.nbaFlagEnabled) blockers.push('nba-flag-disabled');
  if (!input.eventPlatformEnabled) blockers.push('event-platform-disabled');
  if (input.killSwitchActive) blockers.push('kill-switch-active');
  if (input.activeEdges < 1) blockers.push('no-active-edges');
  return { ready: blockers.length === 0, blockers };
}
