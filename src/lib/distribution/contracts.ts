export const SHARE_CHANNELS = ['link', 'whatsapp', 'email', 'social', 'other'] as const;
export type ShareChannel = typeof SHARE_CHANNELS[number];

export interface ShareLinkCreateInput {
  channel: ShareChannel;
  campaign?: string;
  expiresInDays?: number;
}

export function parseShareLinkCreate(value: unknown):
  { ok: true; data: ShareLinkCreateInput } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid-input' };
  const input = value as Record<string, unknown>;
  const allowed = new Set(['channel', 'campaign', 'expiresInDays']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return { ok: false, error: 'unknown-field' };
  if (typeof input.channel !== 'string' || !SHARE_CHANNELS.includes(input.channel as ShareChannel)) {
    return { ok: false, error: 'invalid-channel' };
  }
  if (input.campaign !== undefined && (
    typeof input.campaign !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,79}$/.test(input.campaign)
  )) return { ok: false, error: 'invalid-campaign' };
  if (input.expiresInDays !== undefined && (
    !Number.isInteger(input.expiresInDays) || Number(input.expiresInDays) < 1 || Number(input.expiresInDays) > 90
  )) return { ok: false, error: 'invalid-expiry' };
  return {
    ok: true,
    data: {
      channel: input.channel as ShareChannel,
      ...(input.campaign ? { campaign: input.campaign as string } : {}),
      ...(input.expiresInDays ? { expiresInDays: input.expiresInDays as number } : {})
    }
  };
}
