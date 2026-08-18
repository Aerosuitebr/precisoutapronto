import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

function bounded(value: string | null, fallback: string, max: number) {
  return (value || fallback).replace(/[<>]/g, '').slice(0, max);
}

export function GET(request: NextRequest) {
  const title = bounded(request.nextUrl.searchParams.get('titulo'), 'Resultado Jato', 100);
  const label = bounded(request.nextUrl.searchParams.get('rotulo'), 'Resultado', 80);
  const value = bounded(request.nextUrl.searchParams.get('valor'), 'Confira o resultado', 80);

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64, color: 'white', background: 'linear-gradient(145deg,#020617 0%,#082f49 58%,#0c4a6e 100%)', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', background: '#38bdf8', color: '#0f172a', fontSize: 27, fontWeight: 900 }}>RJ</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 30, fontWeight: 800 }}>Precisou, Tá Pronto</span><span style={{ marginTop: 4, color: '#7dd3fc', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>RESULTADO JATO</span></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 54, lineHeight: 1.08, fontWeight: 900, letterSpacing: -1.5 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, marginTop: 42, padding: '28px 34px', borderRadius: 24, background: 'rgba(2,6,23,.72)' }}><span style={{ color: '#cbd5e1', fontSize: 25, fontWeight: 700 }}>{label}</span><span style={{ color: '#86efac', fontSize: 43, fontWeight: 900 }}>{value}</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bae6fd', fontSize: 21, fontWeight: 700 }}><span>Crie o seu grátis</span><span>precisoutapronto.com.br</span></div>
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } }
  );
}
