export const ARTIFACT_OBSERVABILITY_WINDOWS = [1, 7, 30] as const;

export function artifactObservabilityDays(value: string | null) {
  const requested = Number(value || 7);
  return ARTIFACT_OBSERVABILITY_WINDOWS.includes(requested as 1 | 7 | 30) ? requested : 7;
}

export function artifactShadowMetrics(input: {
  legacyCreated: number;
  tasksCreated: number;
  artifactsCreated: number;
  tasksWithoutArtifact: number;
}) {
  const coverage = input.legacyCreated > 0
    ? Number(((input.artifactsCreated / input.legacyCreated) * 100).toFixed(2))
    : 0;
  return {
    ...input,
    coveragePercent: coverage,
    taskArtifactDelta: input.tasksCreated - input.artifactsCreated
  };
}

export function artifactRolloutReadiness(input: {
  writeFlagEnabled: boolean;
  killSwitchActive: boolean;
  tasksWithoutArtifact: number;
  taskArtifactDelta: number;
}) {
  const blockers: string[] = [];
  if (!input.writeFlagEnabled) blockers.push('artifact-shadow-write-flag-disabled');
  if (input.killSwitchActive) blockers.push('kill-switch-active');
  if (input.tasksWithoutArtifact > 0) blockers.push('orphan-tasks-detected');
  if (input.taskArtifactDelta !== 0) blockers.push('task-artifact-count-mismatch');
  return { ready: blockers.length === 0, blockers };
}
