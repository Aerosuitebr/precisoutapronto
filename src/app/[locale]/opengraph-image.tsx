import { ImageResponse } from 'next/og';
import { isInternationalLocale } from '@/lib/i18n';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type ImageProps = {
  params: Promise<{ locale: string }>;
};

const copy = {
  en: {
    eyebrow: 'PROFESSIONAL TOOLS THAT GET THINGS DONE',
    title: 'Quotes, payments and professional PDFs.',
    accent: 'Ready in minutes.',
    description: 'Create, send and move your work forward — all from your phone.',
    locale: 'English',
    cta: 'Free to start'
  },
  es: {
    eyebrow: 'HERRAMIENTAS PROFESIONALES QUE RESUELVEN',
    title: 'Presupuestos, cobros y PDF profesionales.',
    accent: 'Listos en minutos.',
    description: 'Crea, envía y haz avanzar tu trabajo — todo desde tu celular.',
    locale: 'Español',
    cta: 'Comienza gratis'
  }
} as const;

export default async function InternationalOpenGraphImage({ params }: ImageProps) {
  const { locale } = await params;
  const selected = isInternationalLocale(locale) ? copy[locale] : copy.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 52%, #052e2b 100%)',
          color: '#f8fafc',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            right: -140,
            top: -180,
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.20)',
            boxShadow: '0 0 100px rgba(16, 185, 129, 0.28)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            right: 115,
            bottom: -200,
            borderRadius: 999,
            background: 'rgba(251, 191, 36, 0.13)'
          }}
        />

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                  background: '#fbbf24',
                  color: '#0f172a',
                  fontSize: 30,
                  fontWeight: 900
                }}
              >
                RJ
              </div>
              <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>Precisou, Tá Pronto</div>
            </div>
            <div
              style={{
                display: 'flex',
                padding: '10px 18px',
                border: '1px solid rgba(148, 163, 184, 0.45)',
                borderRadius: 999,
                color: '#cbd5e1',
                fontSize: 20
              }}
            >
              {selected.locale}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1010 }}>
            <div
              style={{
                display: 'flex',
                color: '#6ee7b7',
                fontSize: 21,
                fontWeight: 800,
                letterSpacing: 2.4
              }}
            >
              {selected.eyebrow}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 59, fontWeight: 900, lineHeight: 1.02 }}>
              <div style={{ display: 'flex' }}>{selected.title}</div>
              <div style={{ display: 'flex', color: '#fbbf24' }}>{selected.accent}</div>
            </div>
            <div style={{ display: 'flex', color: '#cbd5e1', fontSize: 25, lineHeight: 1.35 }}>
              {selected.description}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 20 }}>
            <div style={{ display: 'flex' }}>precisoutapronto.com.br/{locale}</div>
            <div style={{ display: 'flex', color: '#a7f3d0' }}>{selected.cta}</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
