const WHATSAPP_ACK_PREFIX = 'rj_quote_whatsapp_ack_v1:';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function quoteWhatsAppAckKey(quoteId: string) {
  return UUID_RE.test(quoteId) ? `${WHATSAPP_ACK_PREFIX}${quoteId}` : '';
}

export function rememberQuoteWhatsAppOpened(quoteId: string) {
  if (typeof window === 'undefined') return;
  const key = quoteWhatsAppAckKey(quoteId);
  if (!key) return;
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    // A confirmação é apenas conveniência de interface.
  }
}

export function wasQuoteWhatsAppOpened(quoteId: string) {
  if (typeof window === 'undefined') return false;
  const key = quoteWhatsAppAckKey(quoteId);
  if (!key) return false;
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
