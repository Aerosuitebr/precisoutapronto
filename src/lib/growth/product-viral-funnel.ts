export interface ProductViralFunnelCounts {
  toolKey: string;
  completed: number;
  shared: number;
  opened: number;
  acted: number;
  activated: number;
}

export function aggregateRate(value: number, base: number) {
  return base > 0 ? Math.round((value / base) * 1000) / 10 : 0;
}

export function productViralFunnelMetrics(counts: ProductViralFunnelCounts) {
  return {
    ...counts,
    shareRate: aggregateRate(counts.shared, counts.completed),
    openRate: aggregateRate(counts.opened, counts.shared),
    actionRate: aggregateRate(counts.acted, counts.opened),
    activationRate: aggregateRate(counts.activated, counts.opened)
  };
}
