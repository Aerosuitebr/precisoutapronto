export const DOCUMENT_SHARE_UPDATED_EVENT = 'resolva-jato:document-share-updated';

export interface DocumentShareUpdatedDetail {
  toolId: string;
  artifactId: string;
  reused: boolean;
}

export function buildDocumentSharePayload(title: string, url: string): ShareData {
  return {
    title: title.trim().slice(0, 140) || 'Documento compartilhado',
    text: 'Veja este documento criado no Precisou, Tá Pronto.',
    url
  };
}

export function buildDocumentShareRequest(input: {
  toolId: string;
  artifactId: string;
  title: string;
}) {
  return {
    toolId: input.toolId,
    artifactId: input.artifactId,
    title: input.title.trim().slice(0, 140) || 'Documento compartilhado',
    expiresInDays: 30
  };
}

export function dispatchDocumentShareUpdated(detail: DocumentShareUpdatedDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<DocumentShareUpdatedDetail>(
    DOCUMENT_SHARE_UPDATED_EVENT,
    { detail }
  ));
}

export function isShareCancellation(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
