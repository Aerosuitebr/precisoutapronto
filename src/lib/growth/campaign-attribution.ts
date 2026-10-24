export const CAMPAIGN_ATTRIBUTION_KEY = 'precisoutapronto_campaign_attribution_v1';
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;
export type CampaignAttribution = Partial<Record<(typeof KEYS)[number], string>>;

/** Only public campaign slugs: never store arbitrary query strings or contact fields. */
export function campaignFromSearch(search: string): CampaignAttribution {
  const query = new URLSearchParams(search);
  const result: CampaignAttribution = {};
  for (const key of KEYS) {
    const value = query.get(key);
    if (value && /^[a-z0-9_-]{1,80}$/i.test(value)) result[key] = value;
  }
  return result;
}

/** First campaign in this tab wins; internal navigation cannot replace its origin. */
export function rememberCampaign(storage: Pick<Storage, 'getItem' | 'setItem'>, search: string): CampaignAttribution {
  try {
    const saved = storage.getItem(CAMPAIGN_ATTRIBUTION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const valid = campaignFromSearch(new URLSearchParams(parsed).toString());
          if (valid.utm_source && valid.utm_campaign) return valid;
        }
      } catch { /* Recover stale or corrupted optional storage from the current URL. */ }
    }
    const campaign = campaignFromSearch(search);
    if (campaign.utm_source && campaign.utm_campaign) storage.setItem(CAMPAIGN_ATTRIBUTION_KEY, JSON.stringify(campaign));
    return campaign;
  } catch { return {}; }
}
