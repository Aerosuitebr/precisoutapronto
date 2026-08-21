import { createHash } from 'node:crypto';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { getFeatureFlagDecision } from '@/lib/experimentation/feature-flags';

const SAFE_EXPERIMENT_KEY_RE = /^[a-z][a-z0-9_.-]{0,63}$/;
const SAFE_VARIANT_KEY_RE = /^[a-z][a-z0-9_-]{0,63}$/;
const MAX_VARIANTS = 10;

export interface ExperimentVariant {
  key: string;
  weight: number;
}

export interface ExperimentAssignmentInput {
  experimentKey: string;
  subjectKey: string;
  variants: ExperimentVariant[];
}

export interface GatedExperimentInput extends ExperimentAssignmentInput {
  flagKey: string;
  controlVariant: string;
}

export interface GatedExperimentDecision {
  variant: string;
  active: boolean;
  reason: 'flag-disabled' | 'assigned' | 'unavailable' | 'invalid';
}

interface ExperimentAssignmentDependencies {
  configured: () => boolean;
  persist: (input: { experimentKey: string; subjectKey: string; variant: string }) => Promise<{ variant: string }>;
}

function assignmentSubjectKey(subjectKey: string) {
  return createHash('sha256').update(`experiment-subject:v1:${subjectKey}`).digest('hex');
}

function validVariants(variants: ExperimentVariant[]) {
  if (variants.length < 2 || variants.length > MAX_VARIANTS) return false;
  const keys = new Set<string>();
  return variants.every(({ key, weight }) => {
    if (!SAFE_VARIANT_KEY_RE.test(key) || keys.has(key)) return false;
    keys.add(key);
    return Number.isSafeInteger(weight) && weight > 0;
  });
}

export function chooseExperimentVariant(input: ExperimentAssignmentInput) {
  if (!SAFE_EXPERIMENT_KEY_RE.test(input.experimentKey) || !input.subjectKey || !validVariants(input.variants)) {
    return null;
  }
  const totalWeight = input.variants.reduce((total, variant) => total + variant.weight, 0);
  if (!Number.isSafeInteger(totalWeight) || totalWeight <= 0) return null;

  const digest = createHash('sha256')
    .update(`${input.experimentKey}:${assignmentSubjectKey(input.subjectKey)}`)
    .digest();
  const bucket = digest.readUInt32BE(0) % totalWeight;
  let cursor = 0;
  for (const variant of input.variants) {
    cursor += variant.weight;
    if (bucket < cursor) return variant.key;
  }
  return null;
}

const defaultDependencies: ExperimentAssignmentDependencies = {
  configured: isDatabaseConfigured,
  persist: (input) => getPrisma().experimentAssignment.upsert({
    where: {
      experimentKey_subjectKey: {
        experimentKey: input.experimentKey,
        subjectKey: input.subjectKey
      }
    },
    create: input,
    update: {},
    select: { variant: true }
  })
};

export async function getOrCreateExperimentAssignment(
  input: ExperimentAssignmentInput,
  dependencies: ExperimentAssignmentDependencies = defaultDependencies
) {
  const variant = chooseExperimentVariant(input);
  if (!variant || !dependencies.configured()) return null;

  try {
    const assignment = await dependencies.persist({
      experimentKey: input.experimentKey,
      subjectKey: assignmentSubjectKey(input.subjectKey),
      variant
    });
    return assignment.variant;
  } catch (error) {
    console.error('[experiments] assignment failed', { experimentKey: input.experimentKey, error });
    return null;
  }
}

interface GatedExperimentDependencies {
  decide: typeof getFeatureFlagDecision;
  assign: typeof getOrCreateExperimentAssignment;
}

const defaultGatedDependencies: GatedExperimentDependencies = {
  decide: getFeatureFlagDecision,
  assign: getOrCreateExperimentAssignment
};

/** Resolve a experiência sem persistir assignment quando a flag estiver desligada. */
export async function resolveGatedExperiment(
  input: GatedExperimentInput,
  dependencies: GatedExperimentDependencies = defaultGatedDependencies
): Promise<GatedExperimentDecision> {
  if (
    !SAFE_EXPERIMENT_KEY_RE.test(input.flagKey) ||
    !SAFE_VARIANT_KEY_RE.test(input.controlVariant) ||
    !input.variants.some((variant) => variant.key === input.controlVariant) ||
    !chooseExperimentVariant(input)
  ) {
    return { variant: input.controlVariant, active: false, reason: 'invalid' };
  }

  try {
    const flag = await dependencies.decide(input.flagKey, input.subjectKey);
    if (!flag.enabled) {
      return { variant: input.controlVariant, active: false, reason: 'flag-disabled' };
    }
    const variant = await dependencies.assign(input);
    if (!variant) return { variant: input.controlVariant, active: false, reason: 'unavailable' };
    return { variant, active: true, reason: 'assigned' };
  } catch (error) {
    console.error('[experiments] gated resolution failed', { experimentKey: input.experimentKey, error });
    return { variant: input.controlVariant, active: false, reason: 'unavailable' };
  }
}
