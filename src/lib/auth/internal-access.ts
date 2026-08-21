const DEFAULT_INTERNAL_EMAILS = [
  'contato@resolvajato.com.br',
  'contato@precisoutapronto.com.br'
];

export function internalDashboardEmails(configured = process.env.INTERNAL_DASHBOARD_EMAILS || '') {
  return new Set([
    ...DEFAULT_INTERNAL_EMAILS,
    ...configured.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  ]);
}

export function isInternalDashboardEmail(
  email: string,
  configured = process.env.INTERNAL_DASHBOARD_EMAILS || ''
) {
  return internalDashboardEmails(configured).has(email.trim().toLowerCase());
}
