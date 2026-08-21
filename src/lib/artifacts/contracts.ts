type SummaryScalar = string | number | boolean | null;

export interface CanonicalArtifactWriteInput {
  userId?: string;
  anonymousSessionId?: string;
  toolKey: string;
  intentKey?: string;
  artifactType: string;
  legacyArtifactId?: string;
  summary?: Record<string, SummaryScalar>;
}

export interface CanonicalArtifactWriteContract extends CanonicalArtifactWriteInput {
  schemaVersion: 1;
}

const SAFE_KEY = /^[a-z0-9][a-z0-9_-]{1,79}$/;
const SENSITIVE_SUMMARY_KEY = /(name|nome|email|phone|telefone|whatsapp|address|endereco|document|cpf|cnpj|pix|token|secret)/i;

function boundedText(value: unknown, max: number) {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

export function parseCanonicalArtifactWrite(
  value: unknown
): { ok: true; data: CanonicalArtifactWriteContract } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'invalid-input' };
  }
  const input = value as Record<string, unknown>;
  if (!boundedText(input.toolKey, 80) || !SAFE_KEY.test(input.toolKey as string)) {
    return { ok: false, error: 'invalid-tool-key' };
  }
  if (!boundedText(input.artifactType, 48) || !SAFE_KEY.test(input.artifactType as string)) {
    return { ok: false, error: 'invalid-artifact-type' };
  }
  if (input.intentKey !== undefined && (!boundedText(input.intentKey, 80) || !SAFE_KEY.test(input.intentKey as string))) {
    return { ok: false, error: 'invalid-intent-key' };
  }
  if (!boundedText(input.userId, 191) && !boundedText(input.anonymousSessionId, 191)) {
    return { ok: false, error: 'missing-subject' };
  }
  if (input.legacyArtifactId !== undefined && !boundedText(input.legacyArtifactId, 191)) {
    return { ok: false, error: 'invalid-legacy-artifact-id' };
  }
  const rawSummary = input.summary ?? {};
  if (!rawSummary || typeof rawSummary !== 'object' || Array.isArray(rawSummary)) {
    return { ok: false, error: 'invalid-summary' };
  }
  const entries = Object.entries(rawSummary);
  if (entries.length > 12) return { ok: false, error: 'summary-too-large' };
  for (const [key, item] of entries) {
    if (!SAFE_KEY.test(key) || SENSITIVE_SUMMARY_KEY.test(key)) {
      return { ok: false, error: 'unsafe-summary-key' };
    }
    if (item !== null && !['string', 'number', 'boolean'].includes(typeof item)) {
      return { ok: false, error: 'invalid-summary-value' };
    }
    if (typeof item === 'string' && item.length > 160) {
      return { ok: false, error: 'summary-value-too-long' };
    }
  }

  return {
    ok: true,
    data: {
      schemaVersion: 1,
      ...(boundedText(input.userId, 191) ? { userId: input.userId as string } : {}),
      ...(boundedText(input.anonymousSessionId, 191) ? { anonymousSessionId: input.anonymousSessionId as string } : {}),
      toolKey: input.toolKey as string,
      ...(input.intentKey ? { intentKey: input.intentKey as string } : {}),
      artifactType: input.artifactType as string,
      ...(input.legacyArtifactId ? { legacyArtifactId: input.legacyArtifactId as string } : {}),
      summary: Object.fromEntries(entries) as Record<string, SummaryScalar>
    }
  };
}
