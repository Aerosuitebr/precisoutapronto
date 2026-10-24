'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { ELECTRICIAN_CAMPAIGN, ELECTRICIAN_CONTENT, electricianCampaignUrl, type ElectricianAsset } from '@/lib/growth/electrician-campaign';

export function ElectricianCampaignKit() {
  const [source, setSource] = useState('');
  const [channel, setChannel] = useState('organic_social');
  const [status, setStatus] = useState('');
  async function copy(text: string, asset: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copiado. Pronto para revisar e publicar.');
      trackEvent('electrician_campaign_asset_copied', { asset, campaign: ELECTRICIAN_CAMPAIGN });
    } catch { setStatus('Não foi possível copiar. Selecione o texto da legenda abaixo.'); }
  }
  async function download(asset: ElectricianAsset) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(72, 240, 140, 12);
      ctx.font = 'bold 30px sans-serif'; ctx.fillText('PARA QUEM TRABALHA COM ELÉTRICA', 72, 320);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 60px sans-serif';
      asset.card.forEach((line, index) => ctx.fillText(line, 72, 580 + index * 100, 936));
      ctx.font = '36px sans-serif'; ctx.fillText('Orçamento profissional no WhatsApp', 72, 1120, 936);
      ctx.fillText('Comece grátis, sem cadastro.', 72, 1190, 936);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 44px sans-serif'; ctx.fillText('Precisou, Tá Pronto', 72, 1470);
      ctx.fillStyle = '#ffffff'; ctx.font = '30px sans-serif'; ctx.fillText('precisoutapronto.com.br', 72, 1550);
      ctx.font = '26px sans-serif'; ctx.fillText('Cole o link da legenda no seu Story ou Status.', 72, 1630, 936);
      ctx.fillText('Uso gratuito com a marca da plataforma.', 72, 1680, 936);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG unavailable');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = asset.id + '-1080x1920.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('Card baixado. Copie também a legenda e o link identificado.');
      trackEvent('electrician_campaign_asset_downloaded', { asset: asset.id, campaign: ELECTRICIAN_CAMPAIGN, format: 'story_png' });
    } catch { setStatus('Não foi possível baixar o card. Você pode usar a legenda e gravar a demonstração.'); }
  }
  return <section id="kit-eletricistas" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
    <h2 className="text-3xl font-black">Seis conteúdos para mostrar na prática</h2>
    <p className="mt-3 max-w-3xl leading-7 text-slate-600">Três formatos, duas aberturas para cada teste. Baixe cards verticais de 1080 × 1920, copie a legenda e grave vídeos de 20 a 35 segundos com os roteiros. Os vídeos precisam ser gravados; os cards já estão disponíveis.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="font-bold">Canal ou identificador público<input value={source} maxLength={60} placeholder="ex.: dicasdojoao" onChange={e => setSource(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} className="mt-2 block min-h-12 w-full rounded-xl border p-3 font-normal" /></label>
      <label className="font-bold">Formato de distribuição<select value={channel} onChange={e => setChannel(e.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border p-3 font-normal"><option value="organic_social">Redes sociais</option><option value="organic_video">YouTube e vídeos</option><option value="creator">Parceria com criador</option><option value="whatsapp">WhatsApp e Status</option></select></label>
    </div>
    <p className="mt-3 text-sm text-slate-600">Use um identificador público, sem telefone ou e-mail. Se houver patrocínio, identifique a parceria na publicação.</p>
    <p role="status" aria-live="polite" className="my-4 text-sm font-semibold text-emerald-800">{status}</p>
    <div className="grid gap-6 md:grid-cols-2">{ELECTRICIAN_CONTENT.map(asset => {
      const url = electricianCampaignUrl(source, channel, asset.id);
      const caption = asset.caption + '\n\nCrie seu orçamento grátis; o documento leva a marca da plataforma.\n' + url;
      return <article key={asset.id} className="min-w-0 rounded-3xl border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase text-emerald-700">Dia {asset.day} · {asset.id}</p><h3 className="mt-2 text-xl font-black">{asset.title}</h3>
        <div className="mt-4 rounded-2xl bg-emerald-950 px-5 py-8 text-white"><p className="text-xs uppercase text-amber-300">Eletricistas</p>{asset.card.map(line => <p key={line} className="mt-2 text-xl font-bold">{line}</p>)}<p className="mt-6 text-xs">Precisou, Tá Pronto</p></div>
        <p className="mt-4 font-bold">Abertura: “{asset.hook}”</p><p className="mt-2 text-sm leading-6 text-slate-600">{asset.script}</p>
        <label className="mt-4 block text-sm font-bold">Legenda · {asset.title}<textarea readOnly value={caption} rows={7} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void download(asset)} className="min-h-11 rounded-xl bg-emerald-700 px-4 font-bold text-white">Baixar card vertical</button><button type="button" onClick={() => void copy(caption, asset.id)} className="min-h-11 rounded-xl border px-4 font-bold">Copiar legenda</button><button type="button" onClick={() => void copy(url, asset.id + '_link')} className="min-h-11 rounded-xl border px-4 font-bold">Copiar link</button></div>
      </article>;
    })}</div>
  </section>;
}
