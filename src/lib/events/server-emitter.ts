import { createHash, randomUUID } from 'node:crypto';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';
import { persistProductEvents, validateProductEvent } from '@/lib/events/product-events';

type ScalarProperty = string | number | boolean | null;

export interface ServerProductEventInput {
  eventName: string;
  occurredAt?: Date;
  deviceId: string;
  authenticatedSessionId?: string;
  userId?: string;
  toolKey?: string;
  taskId?: string;
  artifactId?: string;
  properties?: Record<string, ScalarProperty>;
}

interface ServerEmitterDependencies {
  decide: typeof getFeatureFlagDecision;
  persist: typeof persistProductEvents;
  uuid: () => string;
  now: () => Date;
}

const defaultDependencies: ServerEmitterDependencies = {
  decide: getFeatureFlagDecision,
  persist: persistProductEvents,
  uuid: randomUUID,
  now: () => new Date()
};

function pseudonym(prefix: string, value: string) {
  const digest = createHash('sha256').update(value).digest('hex').slice(0, 32);
  return `${prefix}_${digest}`;
}

export function buildServerEventIdentity(input: {
  deviceId: string;
  authenticatedSessionId?: string;
  occurredAt: Date;
}) {
  const anonymousId = pseudonym('anon', input.deviceId);
  const sessionSource = input.authenticatedSessionId
    ? `auth:${input.authenticatedSessionId}`
    : `anonymous:${input.deviceId}:${input.occurredAt.toISOString().slice(0, 13)}`;
  return { anonymousId, sessionId: pseudonym('session', sessionSource) };
}

/**
 * Emite um evento canônico sem permitir que analytics altere o outcome principal.
 * Qualquer indisponibilidade, flag desligada ou erro de persistência degrada para false.
 */
export async function emitServerProductEvent(
  input: ServerProductEventInput,
  dependencies: ServerEmitterDependencies = defaultDependencies
) {
  try {
    if (!input.deviceId) return false;
    const occurredAt = input.occurredAt || dependencies.now();
    const identity = buildServerEventIdentity({
      deviceId: input.deviceId,
      authenticatedSessionId: input.authenticatedSessionId,
      occurredAt
    });
    const decision = await dependencies.decide('event_platform_v1', input.userId || identity.anonymousId);
    if (!decision.enabled) return false;

    const event = {
      eventId: dependencies.uuid(),
      eventName: input.eventName,
      occurredAt: occurredAt.toISOString(),
      schemaVersion: 1,
      anonymousId: identity.anonymousId,
      sessionId: identity.sessionId,
      ...(input.toolKey ? { toolKey: input.toolKey } : {}),
      ...(input.taskId ? { taskId: input.taskId } : {}),
      ...(input.artifactId ? { artifactId: input.artifactId } : {}),
      properties: input.properties || {}
    };
    const validated = validateProductEvent(event, dependencies.now());
    if (!validated.ok) {
      console.error('[product-events] rejected server event', {
        eventName: input.eventName,
        toolKey: input.toolKey,
        reason: validated.error
      });
      return false;
    }
    await dependencies.persist([validated.event], input.userId);
    return true;
  } catch (error) {
    console.error('[product-events] non-blocking server emission failed', {
      eventName: input.eventName,
      toolKey: input.toolKey,
      error
    });
    return false;
  }
}
