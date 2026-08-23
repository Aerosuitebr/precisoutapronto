export interface ProductViralFunnelCounts {
  toolKey: string;
  completed: number;
  shared: number;
  opened: number;
  acted: number;
  activated: number;
}

function pct(value: number, base: number) {
  return base > 0 ? Math.round((value / base) * 1000) / 10 : 0;
}

export function productViralFunnelMetrics(counts: ProductViralFunnelCounts) {
  return {
    ...counts,
    shareRate: pct(counts.shared, counts.completed),
    openRate: pct(counts.opened, counts.shared),
    actionRate: pct(counts.acted, counts.opened),
    activationRate: pct(counts.activated, counts.opened)
  };
}
