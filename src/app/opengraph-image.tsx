import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Precisou, Tá Pronto: ferramentas online grátis';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(145deg, #020617 0%, #0f172a 45%, #064e3b 100%)',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#fbbf24'
          }}
        >
          Precisou, Tá Pronto
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
            O que você precisa resolver hoje?
          </div>
          <div style={{ fontSize: 28, color: '#cbd5e1', maxWidth: 900 }}>
            Currículo, recibo, PDF, cálculos, Pix e orçamento pelo WhatsApp.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#86efac' }}>precisoutapronto.com.br</div>
      </div>
    ),
    { ...size }
  );
}
