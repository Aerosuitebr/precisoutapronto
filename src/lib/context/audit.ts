const AUDITABLE_FIELDS = new Set([
  'displayName', 'legalName', 'taxId', 'email', 'phone', 'address', 'logoAssetId',
  'pix', 'signatureAssetId', 'preferences', 'type', 'metadata', 'archivedAt'
]);

export function contextChangedFields(input: Record<string, unknown>) {
  return Array.from(new Set(
    Object.keys(input).filter((key) => AUDITABLE_FIELDS.has(key))
  )).sort();
}

export function validContextAuditMetadata(input: {
  entityType: string;
  action: string;
  changedFields: string[];
}) {
  if (!['user_business_profile', 'customer'].includes(input.entityType)) return false;
  if (!['created', 'updated', 'archived', 'restored', 'deleted'].includes(input.action)) return false;
  return input.changedFields.length <= AUDITABLE_FIELDS.size
    && input.changedFields.every((field) => AUDITABLE_FIELDS.has(field));
}
