import { createHash } from 'node:crypto';
import { emitServerProductEvent } from '@/lib/events/server-emitter';
import { readNextActionTrackingToken } from '@/lib/recommendation/tracking-token';

export type RecommendationInteraction = 'shown' | 'clicked' | 'completed';

export function recommendationEventId(trackingToken: string, interaction: RecommendationInteraction) {
  const hex = createHash('sha256').update(`recommendation:v1:${interaction}:${trackingToken}`).digest('hex');
  const chars = hex.slice(0, 32).split('');
  chars[12] = '5';
  chars[16] = ['8', '9', 'a', 'b'][parseInt(chars[16] || '0', 16) % 4];
  const value = chars.join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

interface RecommendationEventDependencies {
  emit: typeof emitServerProductEvent;
  readToken: typeof readNextActionTrackingToken;
}

const defaultDependencies: RecommendationEventDependencies = {
  emit: emitServerProductEvent,
  readToken: readNextActionTrackingToken
};

export async function recordRecommendationInteraction(input: {
  trackingToken: string;
  interaction: RecommendationInteraction;
  deviceId: string;
  authenticatedSessionId?: string;
  userId?: string;
  currentToolKey?: string;
}, dependencies: RecommendationEventDependencies = defaultDependencies) {
  if (!input.deviceId || !['shown', 'clicked', 'completed'].includes(input.interaction)) return false;
  const tracking = dependencies.readToken(input.trackingToken);
  if (!tracking) return false;
  if (input.interaction === 'completed' && tracking.targetToolKey !== input.currentToolKey) return false;
  return dependencies.emit({
    eventId: recommendationEventId(input.trackingToken, input.interaction),
    eventName: `recommendation.${input.interaction}`,
    deviceId: input.deviceId,
    authenticatedSessionId: input.authenticatedSessionId,
    userId: input.userId,
    toolKey: tracking.sourceToolKey,
    properties: {
      recommendation_key: `${tracking.sourceToolKey}.${tracking.targetToolKey}`,
      target_tool_key: tracking.targetToolKey,
      variant: tracking.variant,
      rank: tracking.rank
    }
  });
}
