'use client';

import { useEffect } from 'react';

/** Mantém <html lang> alinhado ao locale da página (validação nativa do browser). */
export function DocumentLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
