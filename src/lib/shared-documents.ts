export interface SharedDocumentAvailability {
  revokedAt: Date | string | null;
  expiresAt: Date | string | null;
}

function timestamp(value: Date | string | null) {
  if (!value) return null;
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isSharedDocumentAvailable(
  document: SharedDocumentAvailability,
  now: Date = new Date()
) {
  if (document.revokedAt) return false;
  const expiresAt = timestamp(document.expiresAt);
  return expiresAt === null || expiresAt > now.getTime();
}
