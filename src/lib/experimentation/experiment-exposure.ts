import { emitServerProductEvent } from '@/lib/events/server-emitter';

const SAFE_EXPERIMENT_KEY_RE = /^[a-z][a-z0-9_.-]{0,63}$/;
const SAFE_VARIANT_KEY_RE = /^[a-z][a-z0-9_-]{0,63}$/;

export interface PresentedExperimentExposureInput {
  presented: true;
  experimentKey: string;
  variant: string;
  deviceId: string;
  authenticatedSessionId?: string;
  userId?: string;
  toolKey?: string;
}

interface ExperimentExposureDependencies {
  emit: typeof emitServerProductEvent;
}

const defaultDependencies: ExperimentExposureDependencies = {
  emit: emitServerProductEvent
};

/** Registra exposição somente após a variante ter sido efetivamente apresentada. */
export async function recordPresentedExperimentExposure(
  input: PresentedExperimentExposureInput,
  dependencies: ExperimentExposureDependencies = defaultDependencies
) {
  if (
    input.presented !== true ||
    !SAFE_EXPERIMENT_KEY_RE.test(input.experimentKey) ||
    !SAFE_VARIANT_KEY_RE.test(input.variant) ||
    !input.deviceId
  ) {
    return false;
  }

  return dependencies.emit({
    eventName: 'experiment.exposed',
    deviceId: input.deviceId,
    authenticatedSessionId: input.authenticatedSessionId,
    userId: input.userId,
    toolKey: input.toolKey,
    properties: {
      experiment_key: input.experimentKey,
      variant: input.variant,
      assignment_source: 'stable'
    }
  });
}
