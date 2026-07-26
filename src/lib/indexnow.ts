import { getViralBaseUrl } from '@/lib/viral-loop';

/** Chave IndexNow (arquivo público em /{key}.txt). */
export const INDEXNOW_KEY = '2251b69074c73278c321f4313c84fe76';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Notifica Bing/Yandex/Seznam/Naver sobre URLs novas ou atualizadas. */
export async function submitIndexNow(urls: string[]) {
  const base = getViralBaseUrl().replace(/\/$/, '');
  const host = new URL(base).host;
  const unique = [...new Set(urls.map((u) => (u.startsWith('http') ? u : `${base}${u}`)))];
  if (unique.length === 0) return { ok: true, submitted: 0 };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${base}/${INDEXNOW_KEY}.txt`,
      urlList: unique
    })
  });

  // 200/202 = aceito; 204 = sem conteúdo (também ok em alguns endpoints)
  const ok = res.status === 200 || res.status === 202 || res.status === 204;
  return { ok, status: res.status, submitted: unique.length, urls: unique };
}
