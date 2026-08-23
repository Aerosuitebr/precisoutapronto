export const ANALYTICS_CONSENT_KEY = 'rj_analytics_consent';

export function hasAnalyticsConsent(storage?: Pick<Storage, 'getItem'>) {
  if (!storage) return false;
  try {
    return storage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}
