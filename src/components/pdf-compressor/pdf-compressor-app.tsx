'use client';

import { useState } from 'react';
import { Download, FileArchive, Lock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { buildPrecisouTaProntoDownloadName } from '@/lib/download-filename';
import { compressPdfLossless, compressPdfRasterized, type PdfCompressionMode } from '@/lib/pdf-compressor/compress';

type Locale = 'pt-BR' | 'en' | 'es';
const COPY = {
  'pt-BR': { title: 'Compressor de PDF', subtitle: 'Reduza o arquivo no navegador com um modo seguro ou compressão visual para documentos digitalizados.', select: 'Selecionar PDF', generate: 'Comprimir PDF', download: 'Baixar PDF comprimido', safe: 'Sem perda', safeText: 'Preserva texto pesquisável, vetores e estrutura. A redução depende de como o PDF foi criado.', balanced: 'Equilibrado', balancedText: 'Rasteriza as páginas em 120 DPI. Recomendado para PDFs digitalizados e imagens.', strong: 'Forte', strongText: 'Rasteriza em 90 DPI e reduz mais. Texto deixa de ser selecionável.', local: 'O PDF não sai do dispositivo.', warning: 'Os modos Equilibrado e Forte transformam cada página em imagem. Use Sem perda para contratos, formulários e PDFs com texto.', working: 'Processando página', invalid: 'Selecione um arquivo PDF válido.', tooLarge: 'O arquivo excede o limite de 40 MB.', failed: 'Não foi possível processar este PDF. Verifique se o arquivo está íntegro e sem senha.' },
  en: { title: 'PDF compressor', subtitle: 'Reduce PDF size in your browser with safe optimization or visual compression for scanned documents.', select: 'Select PDF', generate: 'Compress PDF', download: 'Download compressed PDF', safe: 'Lossless', safeText: 'Preserves searchable text, vectors and structure. Reduction depends on the source PDF.', balanced: 'Balanced', balancedText: 'Rasterizes pages at 120 DPI. Recommended for scanned and image-heavy PDFs.', strong: 'Strong', strongText: 'Rasterizes at 90 DPI for smaller files. Text is no longer selectable.', local: 'The PDF never leaves your device.', warning: 'Balanced and Strong turn each page into an image. Use Lossless for contracts, forms and text documents.', working: 'Processing page', invalid: 'Select a valid PDF file.', tooLarge: 'The file exceeds the 40 MB limit.', failed: 'This PDF could not be processed. Check that it is valid and not password-protected.' },
  es: { title: 'Compresor de PDF', subtitle: 'Reduce el archivo en el navegador con optimización segura o compresión visual para documentos escaneados.', select: 'Seleccionar PDF', generate: 'Comprimir PDF', download: 'Descargar PDF comprimido', safe: 'Sin pérdida', safeText: 'Conserva texto buscable, vectores y estructura. La reducción depende del PDF original.', balanced: 'Equilibrado', balancedText: 'Rasteriza las páginas a 120 DPI. Recomendado para PDF escaneados o con imágenes.', strong: 'Fuerte', strongText: 'Rasteriza a 90 DPI y reduce más. El texto deja de ser seleccionable.', local: 'El PDF no sale del dispositivo.', warning: 'Equilibrado y Fuerte convierten cada página en imagen. Usa Sin pérdida para contratos, formularios y documentos con texto.', working: 'Procesando página', invalid: 'Selecciona un archivo PDF válido.', tooLarge: 'El archivo supera el límite de 40 MB.', failed: 'No se pudo procesar este PDF. Comprueba que sea válido y no tenga contraseña.' }
} as const;
const MAX_PDF_BYTES = 40 * 1024 * 1024;

export function PdfCompressorApp({ locale = 'pt-BR', publicLanding = false }: { locale?: Locale; publicLanding?: boolean }) {
  const t = COPY[locale];
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfCompressionMode>('lossless');
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  function choose(next: File) {
    setError(''); setResult(null);
    if (next.type !== 'application/pdf' || next.size > MAX_PDF_BYTES) {
      setError(next.size > MAX_PDF_BYTES ? t.tooLarge : t.invalid);
      return;
    }
    setFile(next);
  }
  async function compress() {
    if (!file) return; setBusy(true); setResult(null); setError('');
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const output = mode === 'lossless' ? await compressPdfLossless(bytes) : await compressPdfRasterized(bytes, mode, (page, total) => setProgress(`${t.working} ${page}/${total}`));
      setResult(output);
    } catch { setError(t.failed); } finally { setBusy(false); setProgress(''); }
  }
  function download() {
    if (!result) return; const blob = new Blob([result as BlobPart], { type: 'application/pdf' }); const href = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = href; link.download = buildPrecisouTaProntoDownloadName('pdf'); link.click(); setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  const reduction = file && result ? Math.round((1 - result.byteLength / file.size) * 100) : null;
  return <div className="space-y-5">
    <ToolsBackButton href={publicLanding ? (locale === 'pt-BR' ? '/recursos' : `/${locale}/tools`) : undefined} />
    <PageHero title={t.title} subtitle={t.subtitle} icon={FileArchive} headingLevel={publicLanding ? 'h2' : 'h1'} />
    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm font-semibold text-slate-700"><Lock className="mr-2 inline h-4 w-4 text-sky-600" />{t.local}</div>
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p> : null}
    {!file ? <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10"><Upload className="h-10 w-10 text-sky-600" /><strong>{t.select}</strong><span className="text-sm text-slate-500">PDF · até 40 MB</span><input className="hidden" type="file" accept="application/pdf" onChange={(e)=>e.target.files?.[0]&&choose(e.target.files[0])} /></label> : <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="font-bold text-slate-900">{file.name}</p><p className="mt-1 text-sm text-slate-500">{(file.size/1024/1024).toFixed(2)} MB</p>{reduction !== null ? <div className={`mt-5 rounded-xl p-4 ${reduction > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}><strong>{reduction > 0 ? `${reduction}% menor` : 'O modo sem perda não reduziu este arquivo'}</strong><p className="mt-1 text-sm">{(result!.byteLength/1024/1024).toFixed(2)} MB</p></div> : null}<button className="mt-5 text-sm font-semibold text-sky-700" onClick={()=>{setFile(null);setResult(null)}}>{t.select}</button></div>
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <ModeCard active={mode==='lossless'} title={t.safe} text={t.safeText} onClick={()=>setMode('lossless')} />
        <ModeCard active={mode==='balanced'} title={t.balanced} text={t.balancedText} onClick={()=>setMode('balanced')} />
        <ModeCard active={mode==='strong'} title={t.strong} text={t.strongText} onClick={()=>setMode('strong')} />
        {mode !== 'lossless' ? <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{t.warning}</p> : null}
        <Button className="w-full" onClick={compress} loading={busy}>{progress || t.generate}</Button>
        <Button className="w-full" variant="success" icon={Download} onClick={download} disabled={!result}>{t.download}</Button>
      </div>
    </div>}
  </div>;
}

function ModeCard({ active, title, text, onClick }: { active: boolean; title: string; text: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`w-full rounded-xl border p-3 text-left ${active ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100' : 'border-slate-200'}`}><strong className="text-sm text-slate-900">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{text}</span></button>; }
