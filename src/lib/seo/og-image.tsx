import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

type OgImageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

/** Gera OG 1200x630 padronizada para landings públicas. */
export function createOgImage({ eyebrow, title, subtitle }: OgImageProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#f8fafc',
          background: 'linear-gradient(135deg, #020617 0%, #0f3347 55%, #064e3b 100%)',
          fontFamily: 'sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: 1,
            color: '#6ee7b7'
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            maxWidth: 1030,
            fontSize: 58,
            lineHeight: 1.08,
            fontWeight: 850
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: 25, color: '#cbd5e1', maxWidth: 960 }}>
          {subtitle}
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
