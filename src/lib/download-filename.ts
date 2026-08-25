/** ID curto e único para nomes de arquivo de download. */
export function buildPrecisouTaProntoDownloadId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

type DownloadKind = 'picture' | 'pdf';

/**
 * Nome padronizado: precisoutapronto_picture_<id>.png | precisoutapronto_pdf_<id>.pdf
 */
export function buildPrecisouTaProntoDownloadName(
  kind: DownloadKind,
  extension?: string
) {
  const id = buildPrecisouTaProntoDownloadId();
  const ext = extension ?? (kind === 'picture' ? 'png' : 'pdf');
  return `precisoutapronto_${kind}_${id}.${ext}`;
}
