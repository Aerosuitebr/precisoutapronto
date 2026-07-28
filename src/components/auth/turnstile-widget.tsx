'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_ID = 'cf-turnstile-script';
let turnstileLoader: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (turnstileLoader) return turnstileLoader;

  turnstileLoader = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile script failed')), {
        once: true
      });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed'));
    document.head.appendChild(script);
  });

  return turnstileLoader;
}

/** Códigos aceitos pelo Turnstile (ISO / regionais). */
export function turnstileLanguageCode(
  language: 'auto' | 'en' | 'es' | 'pt-br' | 'pt-BR'
): string {
  if (language === 'auto') return 'auto';
  if (language === 'es') return 'es';
  if (language === 'pt-br' || language === 'pt-BR') return 'pt-BR';
  return 'en';
}

export function TurnstileWidget({
  onToken,
  className,
  language = 'auto'
}: {
  onToken: (token: string) => void;
  className?: string;
  language?: 'auto' | 'en' | 'es' | 'pt-br' | 'pt-BR';
}) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [missingKey, setMissingKey] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';
  const languageCode = turnstileLanguageCode(language);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey) {
      setMissingKey(true);
      onTokenRef.current('dev-bypass');
      return;
    }

    let cancelled = false;

    async function mount() {
      try {
        await loadTurnstile();
      } catch {
        return;
      }
      if (cancelled || !containerRef.current || !window.turnstile) return;

      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      // Garante locale do documento antes do iframe do Turnstile ler o ambiente.
      if (languageCode !== 'auto') {
        document.documentElement.lang = languageCode === 'pt-BR' ? 'pt-BR' : languageCode;
      }

      containerRef.current.innerHTML = '';
      containerRef.current.setAttribute('data-language', languageCode);

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => onTokenRef.current(''),
        theme: 'light',
        language: languageCode
      });
    }

    void mount();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, languageCode, reactId]);

  if (missingKey) {
    const missingCopy =
      languageCode === 'en'
        ? 'Turnstile is not configured (dev). Signup without captcha.'
        : languageCode === 'es'
          ? 'Turnstile no configurado (dev). Registro sin captcha.'
          : 'Turnstile não configurado (dev). Cadastro sem captcha.';
    return (
      <p className={cn('rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800', className)}>
        {missingCopy}
      </p>
    );
  }

  return (
    <div
      key={`turnstile-${languageCode}`}
      ref={containerRef}
      data-language={languageCode}
      className={cn('flex justify-center', className)}
    />
  );
}
