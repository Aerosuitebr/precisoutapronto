'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Image as ImageIcon, Lock, SlidersHorizontal, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { buildResolvaJatoDownloadName } from '@/lib/download-filename';
import { containedDimensions, decodeImage, extensionForFormat, imageBlobToPdf, processImage, type ImageOutputFormat } from '@/lib/image-tools/process';

type Locale = 'pt-BR' | 'en' | 'es';
type Mode = 'optimize' | 'convert';
const COPY = {
  'pt-BR': { title: 'Estúdio de imagens', subtitle: 'Comprima, redimensione e converta imagens localmente, com controle de qualidade.', select: 'Selecionar imagem', width: 'Largura', height: 'Altura', quality: 'Qualidade', format: 'Formato', process: 'Gerar resultado', download: 'Baixar arquivo', original: 'Original', result: 'Resultado', local: 'A imagem não sai do dispositivo.', saved: 'redução', invalid: 'Selecione uma imagem JPG, PNG ou WEBP válida.', tooLarge: 'O arquivo excede o limite de 25 MB.' },
  en: { title: 'Image studio', subtitle: 'Compress, resize and convert images locally with quality controls.', select: 'Select image', width: 'Width', height: 'Height', quality: 'Quality', format: 'Format', process: 'Generate result', download: 'Download file', original: 'Original', result: 'Result', local: 'The image never leaves your device.', saved: 'smaller', invalid: 'Select a valid JPG, PNG or WEBP image.', tooLarge: 'The file exceeds the 25 MB limit.' },
  es: { title: 'Estudio de imágenes', subtitle: 'Comprime, redimensiona y convierte imágenes localmente con control de calidad.', select: 'Seleccionar imagen', width: 'Ancho', height: 'Alto', quality: 'Calidad', format: 'Formato', process: 'Generar resultado', download: 'Descargar archivo', original: 'Original', result: 'Resultado', local: 'La imagen no sale de tu dispositivo.', saved: 'reducción', invalid: 'Selecciona una imagen JPG, PNG o WEBP válida.', tooLarge: 'El archivo supera el límite de 25 MB.' }
} as const;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export function ImageStudioApp({ locale = 'pt-BR', mode = 'optimize', publicLanding = false }: { locale?: Locale; mode?: Mode; publicLanding?: boolean }) {
  const t = COPY[locale];
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [sourceSize, setSourceSize] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [quality, setQuality] = useState(82);
  const [format, setFormat] = useState<ImageOutputFormat>('image/webp');
  const [pdfOutput, setPdfOutput] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ratio = sourceSize.width && sourceSize.height ? sourceSize.width / sourceSize.height : 1;

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); if (resultUrl) URL.revokeObjectURL(resultUrl); }, [sourceUrl, resultUrl]);

  async function choose(next: File) {
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(next.type) || next.size > MAX_IMAGE_BYTES) {
      setError(next.size > MAX_IMAGE_BYTES ? t.tooLarge : t.invalid);
      return;
    }
    let bitmap: ImageBitmap;
    try { bitmap = await decodeImage(next); } catch { setError(t.invalid); return; }
    const dims = containedDimensions(bitmap.width, bitmap.height, bitmap.width, bitmap.height);
    bitmap.close();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(next); setSourceUrl(URL.createObjectURL(next)); setResultUrl(''); setResultBlob(null);
    setSourceSize(dims); setWidth(dims.width); setHeight(dims.height);
    if (mode === 'convert') setFormat(next.type === 'image/png' ? 'image/jpeg' : 'image/png');
  }

  async function generate() {
    if (!file || width < 1 || height < 1) return;
    setBusy(true); setError('');
    try {
      const processed = await processImage(file, { width, height, format, quality: quality / 100 });
      const output = pdfOutput ? await imageBlobToPdf(processed.blob, width, height) : processed.blob;
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(output); setResultUrl(URL.createObjectURL(output));
    } catch { setError(t.invalid); } finally { setBusy(false); }
  }

  function download() {
    if (!resultBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(resultBlob);
    link.download = buildResolvaJatoDownloadName(pdfOutput ? 'pdf' : 'picture', pdfOutput ? 'pdf' : extensionForFormat(format));
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  const reduction = useMemo(() => file && resultBlob ? Math.round((1 - resultBlob.size / file.size) * 100) : null, [file, resultBlob]);
  return <div className="space-y-5">
    <ToolsBackButton href={publicLanding ? (locale === 'pt-BR' ? '/recursos' : `/${locale}/tools`) : undefined} />
    <PageHero title={t.title} subtitle={t.subtitle} icon={ImageIcon} headingLevel={publicLanding ? 'h2' : 'h1'} />
    <div className="grid gap-2 sm:grid-cols-2"><div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm font-semibold text-slate-700"><Lock className="mr-2 inline h-4 w-4 text-sky-600" />{t.local}</div><div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm font-semibold text-slate-700"><SlidersHorizontal className="mr-2 inline h-4 w-4 text-sky-600" />JPG · PNG · WEBP · PDF</div></div>
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p> : null}
    {!file ? <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center"><Upload className="h-10 w-10 text-sky-600" /><strong>{t.select}</strong><span className="text-sm text-slate-500">JPG, PNG ou WEBP · até 25 MB</span><input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void choose(event.target.files[0])} /></label> :
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-4 sm:grid-cols-2"><Preview title={t.original} src={sourceUrl} /><Preview title={t.result} src={resultUrl} />{reduction !== null ? <p className="sm:col-span-2 text-sm font-semibold text-emerald-700">{reduction >= 0 ? `${reduction}% ${t.saved}` : `${Math.abs(reduction)}% maior`}</p> : null}</div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold">{t.width}<Input type="number" min={1} max={12000} value={width} onChange={(e) => { const value=Number(e.target.value); setWidth(value); setHeight(Math.max(1,Math.round(value/ratio))); }} /></label>
          <label className="block text-sm font-semibold">{t.height}<Input type="number" min={1} max={12000} value={height} onChange={(e) => { const value=Number(e.target.value); setHeight(value); setWidth(Math.max(1,Math.round(value*ratio))); }} /></label>
          <label className="block text-sm font-semibold">{t.format}<Select value={pdfOutput ? 'application/pdf' : format} onChange={(e) => { const value=e.target.value; setPdfOutput(value==='application/pdf'); if(value!=='application/pdf') setFormat(value as ImageOutputFormat); }}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option><option value="application/pdf">PDF</option></Select></label>
          {!pdfOutput && format !== 'image/png' ? <label className="block text-sm font-semibold">{t.quality}: {quality}%<input className="w-full accent-sky-600" type="range" min={40} max={100} value={quality} onChange={(e)=>setQuality(Number(e.target.value))} /></label> : null}
          <Button className="w-full" onClick={generate} loading={busy}>{t.process}</Button>
          <Button className="w-full" variant="success" icon={Download} onClick={download} disabled={!resultBlob}>{t.download}</Button>
        </div>
      </div>}
  </div>;
}

function Preview({ title, src }: { title: string; src: string }) {
  // Blob URLs are already local processed previews; Next Image cannot optimize them.
  // eslint-disable-next-line @next/next/no-img-element
  return <figure className="rounded-2xl border border-slate-200 bg-white p-3"><figcaption className="mb-2 text-xs font-bold uppercase text-slate-500">{title}</figcaption><div className="grid h-72 place-items-center overflow-hidden rounded-xl bg-[conic-gradient(#e2e8f0_25%,#f8fafc_0_50%,#e2e8f0_0_75%,#f8fafc_0)] bg-[length:20px_20px]">{src ? <img src={src} alt={title} className="max-h-full max-w-full object-contain" /> : <span className="text-sm text-slate-400">—</span>}</div></figure>;
}
