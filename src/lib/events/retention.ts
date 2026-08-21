export const DEFAULT_PRODUCT_EVENT_RETENTION_DAYS = 90;
export const MIN_PRODUCT_EVENT_RETENTION_DAYS = 30;
export const MAX_PRODUCT_EVENT_RETENTION_DAYS = 730;

export function productEventRetentionDays(
  configured = process.env.PRODUCT_EVENT_RETENTION_DAYS || ''
) {
  const days = Number(configured);
  if (
    !Number.isInteger(days) ||
    days < MIN_PRODUCT_EVENT_RETENTION_DAYS ||
    days > MAX_PRODUCT_EVENT_RETENTION_DAYS
  ) {
    return DEFAULT_PRODUCT_EVENT_RETENTION_DAYS;
  }
  return days;
}

export function productEventRetentionCutoff(now = new Date(), configured?: string) {
  return new Date(now.getTime() - productEventRetentionDays(configured) * 86_400_000);
}
