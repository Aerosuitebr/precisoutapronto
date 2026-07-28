'use client';

import { useEffect, useRef, useState } from 'react';
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

export function TurnstileWidget({
  onToken,
  className,
  language = 'auto'
}: {
  onToken: (token: string) => void;
  className?: string;
  language?: 'auto' | 'en' | 'es' | 'pt-br';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';

  useEffect(() => {
    if (!siteKey) {
      setMissingKey(true);
      onToken('dev-bypass');
      return;
    }

    function renderWidget() {
      if (!containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
        theme: 'light',
        language
      });
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      renderWidget();
    } else if (existing) {
      existing.addEventListener('load', renderWidget);
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, language]);

  if (missingKey) {
    const missingCopy =
      language === 'en'
        ? 'Turnstile is not configured (dev). Signup without captcha.'
        : language === 'es'
          ? 'Turnstile no configurado (dev). Registro sin captcha.'
          : 'Turnstile não configurado (dev). Cadastro sem captcha.';
    return (
      <p className={cn('rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800', className)}>
        {missingCopy}
      </p>
    );
  }

  return <div ref={containerRef} className={cn('flex justify-center', className)} />;
}
