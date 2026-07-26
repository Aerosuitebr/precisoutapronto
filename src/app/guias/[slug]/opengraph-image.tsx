import { ImageResponse } from 'next/og';
import { getGuide } from '@/lib/guides';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function GuideOpenGraphImage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 70, color: '#f8fafc', background: 'linear-gradient(135deg,#020617,#0f3d4c)' }}>
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#6ee7b7' }}>RESOLVA JATO · GUIAS</div>
        <div style={{ display: 'flex', maxWidth: 1020, fontSize: 60, lineHeight: 1.08, fontWeight: 800 }}>{guide?.title ?? 'Guia prático Resolva Jato'}</div>
        <div style={{ display: 'flex', fontSize: 24, color: '#cbd5e1' }}>Resposta direta + ferramenta para colocar em prática</div>
      </div>
    ),
    size
  );
}
