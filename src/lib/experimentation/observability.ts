export const EXPERIMENT_OBSERVABILITY_WINDOWS = [1, 7, 30] as const;

export function experimentObservabilityDays(value: string | null) {
  const requested = Number(value || 7);
  return EXPERIMENT_OBSERVABILITY_WINDOWS.includes(requested as 1 | 7 | 30) ? requested : 7;
}

export function experimentAssignmentAggregates(rows: Array<{
  experimentKey: string;
  variant: string;
  _count: { _all: number };
}>) {
  return rows.map((row) => ({
    experimentKey: row.experimentKey,
    variant: row.variant,
    count: row._count._all
  }));
}
