export function buildDocumentSharePayload(title: string, url: string): ShareData {
  return {
    title: title.trim().slice(0, 140) || 'Documento compartilhado',
    text: 'Veja este documento criado no Resolva Jato.',
    url
  };
}

export function isShareCancellation(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
