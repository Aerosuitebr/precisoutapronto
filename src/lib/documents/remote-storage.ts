export type RemoteToolId =
  | 'curriculo'
  | 'recibos'
  | 'propostas'
  | 'contratos'
  | 'resume-intl'
  | 'receipt-intl'
  | 'proposal-intl'
  | 'service-contract-intl'
  | 'academic-cover-intl'
  | 'legal-documents-intl'
  | 'accounting-documents-intl';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  });
  if (!response.ok) throw new Error(`Document API returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function listRemoteDocuments<T>(toolId: RemoteToolId): Promise<T[]> {
  const payload = await request<{ documents: T[] }>(`/api/documents/${toolId}`);
  return payload.documents;
}

export async function saveRemoteDocument<T extends { id: string }>(toolId: RemoteToolId, document: T): Promise<T> {
  const payload = await request<{ document: T }>(`/api/documents/${toolId}`, {
    method: 'POST',
    body: JSON.stringify(document)
  });
  return payload.document;
}

export async function deleteRemoteDocument(toolId: RemoteToolId, artifactId: string): Promise<void> {
  await request(`/api/documents/${toolId}/${encodeURIComponent(artifactId)}`, { method: 'DELETE' });
}
