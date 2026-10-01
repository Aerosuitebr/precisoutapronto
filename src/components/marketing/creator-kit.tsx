'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PEER_PROFESSIONS } from '@/lib/growth/peer-invite';
import { trackEvent } from '@/lib/analytics';
import { PROMO_ORCAMENTO_VIDEO } from '@/lib/seo/promo-orcamento-video';

export function CreatorKit() {
  const [creator, setCreator] = useState('');
  const [occupation, setOccupation] = useState('eletricista');
  const [status, setStatus] = useState('');
  const path = occupation ? `/orcamento-para/${occupation}` : '/orcamento-com-pix';
  const params = new URLSearchParams({ utm_source: creator || 'kit_publico', utm_medium: 'creator', utm_campaign: 'profession_kit_v1', source_occupation: occupation || 'geral' });
  const url = `https://precisoutapronto.com.br${path}?${params}#montar`;
  const caption = `Seu cliente pediu preço no WhatsApp? Organize serviços e valores em um orçamento que ele pode conferir e aprovar pelo celular. Teste grátis, sem cadastro para começar:\n${url}`;
  async function copy(text: string, asset: string) {
    try { await navigator.clipboard.writeText(text); setStatus('Copiado.'); trackEvent('creator_kit_copied', { asset, source_occupation: occupation || 'geral' }); }
    catch { setStatus('Não foi possível copiar automaticamente. Selecione o texto abaixo.'); }
  }
  return <section id="kit" className="mx-auto max-w-4xl space-y-5 px-4 py-12">
    <h2 className="text-3xl font-black">Kit para mostrar na prática</h2>
    <p className="text-slate-600">Escolha uma profissão, personalize o link e use os materiais. Identifique a parceria quando houver uma relação comercial.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className="text-sm font-bold" htmlFor="kit-creator">Seu canal ou identificador público</label><input id="kit-creator" value={creator} maxLength={60} onChange={(e) => setCreator(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} placeholder="ex.: dicasdojoao" className="mt-2 min-h-11 w-full rounded-xl border p-3" /></div>
      <div><label className="text-sm font-bold" htmlFor="kit-profession">Profissão</label><select id="kit-profession" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border p-3">{PEER_PROFESSIONS.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}</select></div>
    </div>
    <video controls preload="none" className="w-full rounded-2xl" aria-label="Apresentação do orçamento" src={PROMO_ORCAMENTO_VIDEO.path} />
    <div className="flex flex-wrap gap-4 font-bold text-emerald-800"><a href={PROMO_ORCAMENTO_VIDEO.path} download onClick={() => trackEvent('creator_kit_download', { asset: 'video_16_9' })}>Baixar vídeo horizontal (16:9)</a><a href="/kit/orcamento.png" download onClick={() => trackEvent('creator_kit_download', { asset: 'image' })}>Baixar imagem</a><Link href="/demonstracao-orcamento">Abrir demonstração</Link></div>
    <p className="text-sm text-slate-600">Para um vídeo vertical, grave a demonstração no celular. O arquivo disponível acima é horizontal.</p>
    <label className="block text-sm font-bold">Legenda pronta<textarea readOnly value={caption} rows={6} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
    <div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-xl bg-emerald-700 px-5 font-bold text-white" onClick={() => copy(caption, 'caption')}>Copiar legenda</button><button className="min-h-11 rounded-xl border px-5 font-bold" onClick={() => copy(url, 'link')}>Copiar meu link</button><a href={url} className="p-3 font-bold text-emerald-800">Testar destino</a></div>
    <p role="status" className="text-sm">{status}</p>
    <p className="text-sm text-slate-500">O identificador aparece no link público; não use e-mail ou telefone. Ele identifica a origem das visitas, sem criar uma conta de parceiro ou garantir exclusividade.</p>
  </section>;
}
