import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Você recebeu um orçamento para conferir e responder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function QuoteOpenGraphImage() {
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
          background: 'linear-gradient(145deg, #020617 0%, #0f172a 50%, #064e3b 100%)',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              width: 52,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              background: '#fbbf24',
              color: '#0f172a',
              fontSize: 30,
              fontWeight: 900
            }}
          >
            ✓
          </div>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#fbbf24' }}>
            Precisou, Tá Pronto
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 70, fontWeight: 850, lineHeight: 1.02 }}>
            Você recebeu um orçamento
          </div>
          <div style={{ display: 'flex', fontSize: 31, color: '#d1fae5' }}>
            Confira os itens e responda pelo celular.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, fontSize: 23, color: '#cbd5e1' }}>
          <span>Sem instalar aplicativo</span>
          <span>•</span>
          <span>Sem criar conta</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
