'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'rj_analytics_consent';
type Consent = 'accepted' | 'rejected' | null;

export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    setConsent(saved === 'accepted' || saved === 'rejected' ? saved : null);
    setReady(true);
  }, []);

  function choose(next: Exclude<Consent, null>) {
    window.localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
  }

  const enabled = consent === 'accepted';

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
      {enabled && clarityId ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", ${JSON.stringify(clarityId)});
          `}
        </Script>
      ) : null}
      {ready && consent === null && (gaId || clarityId) ? (
        <aside
          aria-label="Preferências de privacidade"
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:flex sm:items-center sm:gap-5"
        >
          <p className="flex-1 text-sm leading-6 text-slate-600">
            Usamos métricas opcionais para entender quais páginas ajudam mais. Nenhum dado de
            pagamento é enviado. Você pode aceitar ou continuar apenas com cookies essenciais.
          </p>
          <div className="mt-3 flex gap-2 sm:mt-0">
            <button
              type="button"
              className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => choose('rejected')}
            >
              Apenas essenciais
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
              onClick={() => choose('accepted')}
            >
              Aceitar métricas
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
