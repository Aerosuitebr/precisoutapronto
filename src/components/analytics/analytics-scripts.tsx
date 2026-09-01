'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ANALYTICS_CONSENT_KEY } from '@/lib/analytics-consent';

type Consent = 'accepted' | 'rejected' | null;

export function AnalyticsScripts() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    setConsent(saved === 'accepted' || saved === 'rejected' ? saved : null);
    setReady(true);
  }, []);

  function choose(next: Exclude<Consent, null>) {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, next);
    setConsent(next);
  }

  const enabled = consent === 'accepted';
  const locale = pathname === '/en' || pathname.startsWith('/en/')
    ? 'en'
    : pathname === '/es' || pathname.startsWith('/es/')
      ? 'es'
      : 'pt-BR';
  const consentCopy = {
    'pt-BR': {
      label: 'Preferências de privacidade',
      text: 'Usamos métricas opcionais para entender quais páginas ajudam mais. Nenhum dado de pagamento é enviado. Você pode aceitar ou continuar apenas com cookies essenciais.',
      essentials: 'Apenas essenciais',
      accept: 'Aceitar métricas'
    },
    en: {
      label: 'Privacy preferences',
      text: 'We use optional analytics to understand which pages are most helpful. No payment data is sent. You can accept or continue with essential cookies only.',
      essentials: 'Essential only',
      accept: 'Accept analytics'
    },
    es: {
      label: 'Preferencias de privacidad',
      text: 'Usamos métricas opcionales para saber qué páginas son más útiles. No se envían datos de pago. Puedes aceptar o continuar solo con cookies esenciales.',
      essentials: 'Solo esenciales',
      accept: 'Aceptar métricas'
    }
  }[locale];

  return (
    <>
      {enabled && gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(gaId)}, {
                anonymize_ip: true,
                allow_google_signals: false
              });
            `}
          </Script>
        </>
      ) : null}
      {ready && consent === null && gaId ? (
        <aside
          aria-label={consentCopy.label}
          className="fixed bottom-3 left-3 right-3 z-[100] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:left-auto sm:w-[min(28rem,calc(100vw-1.5rem))]"
        >
          <p className="text-xs leading-5 text-slate-600">
            {consentCopy.text}
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700"
              onClick={() => choose('rejected')}
            >
              {consentCopy.essentials}
            </button>
            <button
              type="button"
              className="min-h-9 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white"
              onClick={() => choose('accepted')}
            >
              {consentCopy.accept}
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
