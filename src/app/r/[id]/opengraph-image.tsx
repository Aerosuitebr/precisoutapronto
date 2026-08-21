import { ImageResponse } from 'next/og';
import { loadSharedResult, sanitizeSharedResultLines } from '@/lib/shared-results';

export const runtime = 'nodejs';
export const alt = 'Resultado criado no Precisou? Tá Pronto.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const result = await loadSharedResult((await params).id);
  const lines = result ? sanitizeSharedResultLines(result.data).slice(0, 4) : [];
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg,#0f172a,#064e3b)', color: 'white', padding: 64, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', fontSize: 25, fontWeight: 800, color: '#6ee7b7' }}>PRECISOU? TÁ PRONTO.</div>
      <div style={{ display: 'flex', marginTop: 34, fontSize: 55, lineHeight: 1.05, fontWeight: 900 }}>{result?.title || 'Resultado indisponível'}</div>
      {result?.subtitle ? <div style={{ display: 'flex', marginTop: 15, fontSize: 25, color: '#cbd5e1' }}>{result.subtitle}</div> : null}
      <div style={{ display: 'flex', gap: 15, marginTop: 35 }}>
        {lines.map((line) => <div key={line.label} style={{ display: 'flex', flex: 1, flexDirection: 'column', borderRadius: 20, background: line.emphasis ? '#059669' : 'rgba(255,255,255,.1)', padding: 22 }}><span style={{ fontSize: 18, color: '#d1fae5' }}>{line.label}</span><strong style={{ marginTop: 8, fontSize: 30 }}>{line.value}</strong></div>)}
      </div>
      <div style={{ display: 'flex', marginTop: 'auto', fontSize: 23, fontWeight: 700 }}>Veja o resultado e crie o seu grátis →</div>
    </div>, size
  );
}
