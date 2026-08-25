'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Copy,
  Download,
  FileStack,
  FileUp,
  Loader2,
  Lock,
  Maximize2,
  Pencil,
  RotateCcw,
  RotateCw,
  ScissorsSquare,
  Sparkles,
  Square,
  StickyNote,
  Trash2,
  Type,
  Upload
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageEditor } from '@/components/editor-pdf/page-editor';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { buildPrecisouTaProntoDownloadName } from '@/lib/download-filename';
import {
  PAGE_PRESETS,
  blankPageThumbnail,
  buildFinalPdf,
  defaultPageSize,
  downloadBytes,
  loadPdfIntoPages,
  nextId,
  type PageFitMode,
  type PageItem,
  type PageSizePreset,
  type SourceFile
} from '@/lib/editor-pdf/pdf-engine';

type Locale = 'pt-BR' | 'en' | 'es';

const MAX_FILE_MB = 40;

const COPY: Record<
  Locale,
  {
    authTitle: string;
    authDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    insightEdit: string;
    insightResize: string;
    insightLocal: string;
    dropzoneLoading: string;
    dropzoneTitle: string;
    dropzoneSubtitlePrefix: string;
    dropzoneSubtitleWord: string;
    dropzoneSubtitleSuffix: (mb: number) => string;
    selectFiles: string;
    addPdf: string;
    blankPage: string;
    clearSelection: string;
    selectAll: string;
    rotate: string;
    extract: string;
    deleteSelected: (count: number) => string;
    restart: string;
    editedBadge: string;
    pageAlt: (idx: number) => string;
    selectPageAria: string;
    editContentAria: string;
    editButton: string;
    rotateAria: string;
    duplicateAria: string;
    moveUpAria: string;
    moveDownAria: string;
    removeAria: string;
    finalizeTitle: string;
    resizeSelectedTitle: string;
    formatLabel: string;
    formatOriginal: string;
    formatA4: string;
    formatLetter: string;
    formatA5: string;
    formatSquare: string;
    fitLabel: string;
    fitContain: string;
    fitCover: string;
    fitStretch: string;
    fitNone: string;
    applyToSelected: string;
    pageNumbersLabel: string;
    watermarkLabel: string;
    watermarkHint: string;
    watermarkPlaceholder: string;
    opacityLabel: (pct: number) => string;
    summarySuffix: string;
    summaryMerged: (count: number) => string;
    downloadFinal: string;
    toastInvalidFiles: string;
    toastTooBig: (name: string, mb: number) => string;
    toastMultipleLoaded: (count: number) => string;
    toastSingleLoaded: string;
    toastLoadError: string;
    toastRemoved: (count: number) => string;
    toastSelectToResize: string;
    toastResizeApplied: (count: number) => string;
    toastSelectAtLeastOne: string;
    toastAddPdfFirst: string;
    toastPdfSuccess: string;
    toastPdfError: string;
    toastPageSavedWithEdits: (count: number) => string;
    toastPageSaved: string;
  }
> = {
  'pt-BR': {
    authTitle: 'Editor de PDF',
    authDescription: 'Cadastre-se gratuitamente para editar seus PDFs.',
    heroTitle: 'Editor de PDF',
    heroSubtitle:
      'Clique no texto da página para editar, redimensione o formato, junte arquivos e finalize. Tudo no navegador, sem enviar o PDF para servidor.',
    insightEdit: 'Clique em qualquer letra ou número da página para editar.',
    insightResize: 'Redimensione para A4, Letter, A5 ou tamanho personalizado.',
    insightLocal: '100% local: seus arquivos nunca saem do navegador.',
    dropzoneLoading: 'Carregando páginas…',
    dropzoneTitle: 'Arraste seus PDFs aqui ou clique para selecionar',
    dropzoneSubtitlePrefix: 'Envie um ou vários arquivos. Depois clique em',
    dropzoneSubtitleWord: 'Editar',
    dropzoneSubtitleSuffix: (mb) => `em cada página para alterar o conteúdo. Máx. ${mb}MB por arquivo.`,
    selectFiles: 'Selecionar arquivos',
    addPdf: 'Adicionar PDF',
    blankPage: 'Página em branco',
    clearSelection: 'Limpar seleção',
    selectAll: 'Selecionar tudo',
    rotate: 'Girar',
    extract: 'Extrair',
    deleteSelected: (count) => `Excluir (${count})`,
    restart: 'Recomeçar',
    editedBadge: 'Editada',
    pageAlt: (idx) => `Página ${idx}`,
    selectPageAria: 'Selecionar página',
    editContentAria: 'Editar conteúdo da página',
    editButton: 'Editar',
    rotateAria: 'Girar',
    duplicateAria: 'Duplicar',
    moveUpAria: 'Mover para cima',
    moveDownAria: 'Mover para baixo',
    removeAria: 'Remover',
    finalizeTitle: 'Finalizar documento',
    resizeSelectedTitle: 'Redimensionar selecionadas',
    formatLabel: 'Formato',
    formatOriginal: 'Original',
    formatA4: 'A4',
    formatLetter: 'Letter',
    formatA5: 'A5',
    formatSquare: 'Quadrado',
    fitLabel: 'Encaixe',
    fitContain: 'Conter',
    fitCover: 'Cobrir',
    fitStretch: 'Esticar',
    fitNone: 'Original',
    applyToSelected: 'Aplicar às selecionadas',
    pageNumbersLabel: 'Numerar páginas (rodapé)',
    watermarkLabel: "Marca d'água (opcional)",
    watermarkHint: 'Texto diagonal aplicado em todas as páginas.',
    watermarkPlaceholder: 'Ex.: CONFIDENCIAL',
    opacityLabel: (pct) => `Opacidade (${pct}%)`,
    summarySuffix: 'página(s) no documento final',
    summaryMerged: (count) => ` · ${count} arquivos mesclados`,
    downloadFinal: 'Baixar PDF final',
    toastInvalidFiles: 'Selecione arquivos PDF válidos.',
    toastTooBig: (name, mb) => `"${name}" excede ${mb}MB.`,
    toastMultipleLoaded: (count) => `${count} PDFs carregados e mesclados.`,
    toastSingleLoaded: 'PDF carregado.',
    toastLoadError: 'Não foi possível ler um dos PDFs. Verifique se não está protegido por senha.',
    toastRemoved: (count) => `${count} página(s) removida(s).`,
    toastSelectToResize: 'Selecione ao menos uma página para redimensionar.',
    toastResizeApplied: (count) => `Tamanho aplicado a ${count} página(s).`,
    toastSelectAtLeastOne: 'Selecione ao menos uma página.',
    toastAddPdfFirst: 'Adicione um PDF primeiro.',
    toastPdfSuccess: 'PDF gerado com sucesso!',
    toastPdfError: 'Erro ao gerar o PDF. Tente novamente.',
    toastPageSavedWithEdits: (count) => `Página salva com ${count} texto(s) alterado(s).`,
    toastPageSaved: 'Página salva.'
  },
  en: {
    authTitle: 'PDF Editor',
    authDescription: 'Sign up for free to edit your PDFs.',
    heroTitle: 'PDF Editor',
    heroSubtitle:
      'Click the text on the page to edit it, resize the format, merge files and finish. All in the browser, without sending the PDF to a server.',
    insightEdit: 'Click any letter or number on the page to edit it.',
    insightResize: 'Resize to A4, Letter, A5 or a custom size.',
    insightLocal: '100% local: your files never leave the browser.',
    dropzoneLoading: 'Loading pages...',
    dropzoneTitle: 'Drag your PDFs here or click to select',
    dropzoneSubtitlePrefix: 'Upload one or several files. Then click',
    dropzoneSubtitleWord: 'Edit',
    dropzoneSubtitleSuffix: (mb) => `on each page to change the content. Max. ${mb}MB per file.`,
    selectFiles: 'Select files',
    addPdf: 'Add PDF',
    blankPage: 'Blank page',
    clearSelection: 'Clear selection',
    selectAll: 'Select all',
    rotate: 'Rotate',
    extract: 'Extract',
    deleteSelected: (count) => `Delete (${count})`,
    restart: 'Start over',
    editedBadge: 'Edited',
    pageAlt: (idx) => `Page ${idx}`,
    selectPageAria: 'Select page',
    editContentAria: 'Edit page content',
    editButton: 'Edit',
    rotateAria: 'Rotate',
    duplicateAria: 'Duplicate',
    moveUpAria: 'Move up',
    moveDownAria: 'Move down',
    removeAria: 'Remove',
    finalizeTitle: 'Finish document',
    resizeSelectedTitle: 'Resize selected',
    formatLabel: 'Format',
    formatOriginal: 'Original',
    formatA4: 'A4',
    formatLetter: 'Letter',
    formatA5: 'A5',
    formatSquare: 'Square',
    fitLabel: 'Fit',
    fitContain: 'Contain',
    fitCover: 'Cover',
    fitStretch: 'Stretch',
    fitNone: 'Original',
    applyToSelected: 'Apply to selected',
    pageNumbersLabel: 'Number pages (footer)',
    watermarkLabel: 'Watermark (optional)',
    watermarkHint: 'Diagonal text applied to every page.',
    watermarkPlaceholder: 'E.g.: CONFIDENTIAL',
    opacityLabel: (pct) => `Opacity (${pct}%)`,
    summarySuffix: 'page(s) in the final document',
    summaryMerged: (count) => `, ${count} files merged`,
    downloadFinal: 'Download final PDF',
    toastInvalidFiles: 'Select valid PDF files.',
    toastTooBig: (name, mb) => `"${name}" exceeds ${mb}MB.`,
    toastMultipleLoaded: (count) => `${count} PDFs loaded and merged.`,
    toastSingleLoaded: 'PDF loaded.',
    toastLoadError: 'Could not read one of the PDFs. Check if it is password protected.',
    toastRemoved: (count) => `${count} page(s) removed.`,
    toastSelectToResize: 'Select at least one page to resize.',
    toastResizeApplied: (count) => `Size applied to ${count} page(s).`,
    toastSelectAtLeastOne: 'Select at least one page.',
    toastAddPdfFirst: 'Add a PDF first.',
    toastPdfSuccess: 'PDF generated successfully!',
    toastPdfError: 'Error generating the PDF. Try again.',
    toastPageSavedWithEdits: (count) => `Page saved with ${count} edited text(s).`,
    toastPageSaved: 'Page saved.'
  },
  es: {
    authTitle: 'Editor de PDF',
    authDescription: 'Registrate gratis para editar tus PDFs.',
    heroTitle: 'Editor de PDF',
    heroSubtitle:
      'Haz clic en el texto de la pagina para editarlo, cambia el tamano, une archivos y finaliza. Todo en el navegador, sin enviar el PDF a un servidor.',
    insightEdit: 'Haz clic en cualquier letra o numero de la pagina para editarlo.',
    insightResize: 'Cambia el tamano a A4, Letter, A5 o un tamano personalizado.',
    insightLocal: '100% local: tus archivos nunca salen del navegador.',
    dropzoneLoading: 'Cargando paginas...',
    dropzoneTitle: 'Arrastra tus PDFs aqui o haz clic para seleccionar',
    dropzoneSubtitlePrefix: 'Sube uno o varios archivos. Despues haz clic en',
    dropzoneSubtitleWord: 'Editar',
    dropzoneSubtitleSuffix: (mb) => `en cada pagina para cambiar el contenido. Max. ${mb}MB por archivo.`,
    selectFiles: 'Seleccionar archivos',
    addPdf: 'Agregar PDF',
    blankPage: 'Pagina en blanco',
    clearSelection: 'Limpiar seleccion',
    selectAll: 'Seleccionar todo',
    rotate: 'Girar',
    extract: 'Extraer',
    deleteSelected: (count) => `Eliminar (${count})`,
    restart: 'Volver a empezar',
    editedBadge: 'Editada',
    pageAlt: (idx) => `Pagina ${idx}`,
    selectPageAria: 'Seleccionar pagina',
    editContentAria: 'Editar contenido de la pagina',
    editButton: 'Editar',
    rotateAria: 'Girar',
    duplicateAria: 'Duplicar',
    moveUpAria: 'Mover hacia arriba',
    moveDownAria: 'Mover hacia abajo',
    removeAria: 'Quitar',
    finalizeTitle: 'Finalizar documento',
    resizeSelectedTitle: 'Redimensionar seleccionadas',
    formatLabel: 'Formato',
    formatOriginal: 'Original',
    formatA4: 'A4',
    formatLetter: 'Letter',
    formatA5: 'A5',
    formatSquare: 'Cuadrado',
    fitLabel: 'Ajuste',
    fitContain: 'Contener',
    fitCover: 'Cubrir',
    fitStretch: 'Estirar',
    fitNone: 'Original',
    applyToSelected: 'Aplicar a las seleccionadas',
    pageNumbersLabel: 'Numerar paginas (pie de pagina)',
    watermarkLabel: 'Marca de agua (opcional)',
    watermarkHint: 'Texto diagonal aplicado en todas las paginas.',
    watermarkPlaceholder: 'Ej.: CONFIDENCIAL',
    opacityLabel: (pct) => `Opacidad (${pct}%)`,
    summarySuffix: 'pagina(s) en el documento final',
    summaryMerged: (count) => `, ${count} archivos combinados`,
    downloadFinal: 'Descargar PDF final',
    toastInvalidFiles: 'Selecciona archivos PDF validos.',
    toastTooBig: (name, mb) => `"${name}" supera ${mb}MB.`,
    toastMultipleLoaded: (count) => `${count} PDFs cargados y combinados.`,
    toastSingleLoaded: 'PDF cargado.',
    toastLoadError: 'No se pudo leer uno de los PDFs. Verifica que no este protegido con contrasena.',
    toastRemoved: (count) => `${count} pagina(s) eliminada(s).`,
    toastSelectToResize: 'Selecciona al menos una pagina para redimensionar.',
    toastResizeApplied: (count) => `Tamano aplicado a ${count} pagina(s).`,
    toastSelectAtLeastOne: 'Selecciona al menos una pagina.',
    toastAddPdfFirst: 'Agrega un PDF primero.',
    toastPdfSuccess: 'PDF generado con exito!',
    toastPdfError: 'Error al generar el PDF. Intenta de nuevo.',
    toastPageSavedWithEdits: (count) => `Pagina guardada con ${count} texto(s) modificado(s).`,
    toastPageSaved: 'Pagina guardada.'
  }
};

export function EditorPdfApp({
  locale = 'pt-BR',
  publicLanding = false
}: {
  locale?: Locale;
  publicLanding?: boolean;
} = {}) {
  const t = COPY[locale];
  const { toast } = useToast();
  const [sources, setSources] = useState<Map<string, SourceFile>>(new Map());
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pageNumbers, setPageNumbers] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.18);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [bulkPreset, setBulkPreset] = useState<PageSizePreset>('a4');
  const [bulkFit, setBulkFit] = useState<PageFitMode>('contain');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCount = useMemo(() => pages.filter((p) => p.selected).length, [pages]);
  const allSelected = pages.length > 0 && selectedCount === pages.length;
  const editingPage = editingPageId ? pages.find((p) => p.id === editingPageId) : null;

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (files.length === 0) {
        toast(t.toastInvalidFiles);
        return;
      }
      const tooBig = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
      if (tooBig) {
        toast(t.toastTooBig(tooBig.name, MAX_FILE_MB));
        return;
      }
      setLoading(true);
      try {
        for (const file of files) {
          const { source, pages: newPages } = await loadPdfIntoPages(file);
          setSources((prev) => new Map(prev).set(source.id, source));
          setPages((prev) => [...prev, ...newPages]);
        }
        toast(files.length > 1 ? t.toastMultipleLoaded(files.length) : t.toastSingleLoaded);
      } catch (err) {
        console.error(err);
        toast(t.toastLoadError);
      } finally {
        setLoading(false);
      }
    },
    [toast, t]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
  }

  function toggleSelectAll() {
    setPages((prev) => prev.map((p) => ({ ...p, selected: !allSelected })));
  }

  function toggleSelect(id: string) {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  }

  function rotate(id: string, delta: number) {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p))
    );
  }

  function rotateSelected(delta: number) {
    setPages((prev) =>
      prev.map((p) => (p.selected ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p))
    );
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function removeSelected() {
    if (selectedCount === 0) return;
    setPages((prev) => prev.filter((p) => !p.selected));
    toast(t.toastRemoved(selectedCount));
  }

  function duplicatePage(id: string) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const clone: PageItem = {
        ...prev[idx],
        id: nextId('page'),
        selected: false,
        overlays: prev[idx].overlays.map((o) => ({ ...o, id: nextId('ov') })),
        pageSize: { ...prev[idx].pageSize }
      };
      const copy = [...prev];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
  }

  function insertBlankPage() {
    const width = 595.28;
    const height = 841.89;
    const blank: PageItem = {
      id: nextId('blank'),
      sourceId: 'blank',
      sourcePageIndex: 0,
      rotation: 0,
      thumbnail: blankPageThumbnail(width, height),
      selected: false,
      isBlank: true,
      originalWidth: width,
      originalHeight: height,
      pageSize: defaultPageSize(width, height),
      overlays: []
    };
    setPages((prev) => [...prev, blank]);
  }

  function move(id: string, direction: -1 | 1) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  }

  function applySizeToSelected() {
    const targets = pages.filter((p) => p.selected);
    if (targets.length === 0) {
      toast(t.toastSelectToResize);
      return;
    }
    setPages((prev) =>
      prev.map((p) => {
        if (!p.selected) return p;
        if (bulkPreset === 'original') {
          return {
            ...p,
            pageSize: {
              preset: 'original',
              width: p.originalWidth,
              height: p.originalHeight,
              fit: bulkFit
            },
            thumbnail: p.isBlank ? blankPageThumbnail(p.originalWidth, p.originalHeight) : p.thumbnail
          };
        }
        if (bulkPreset === 'custom') return { ...p, pageSize: { ...p.pageSize, fit: bulkFit } };
        const meta = PAGE_PRESETS[bulkPreset];
        return {
          ...p,
          pageSize: {
            preset: bulkPreset,
            width: meta.width,
            height: meta.height,
            fit: bulkFit
          },
          thumbnail: p.isBlank ? blankPageThumbnail(meta.width, meta.height) : p.thumbnail
        };
      })
    );
    toast(t.toastResizeApplied(targets.length));
  }

  async function handleDownload(onlySelected: boolean) {
    const list = onlySelected ? pages.filter((p) => p.selected) : pages;
    if (list.length === 0) {
      toast(onlySelected ? t.toastSelectAtLeastOne : t.toastAddPdfFirst);
      return;
    }
    setBuilding(true);
    try {
      const bytes = await buildFinalPdf(list, sources, {
        pageNumbers,
        watermarkText,
        watermarkOpacity
      });
      downloadBytes(bytes as Uint8Array, buildPrecisouTaProntoDownloadName('pdf'));
      toast(t.toastPdfSuccess);
    } catch (err) {
      console.error(err);
      toast(t.toastPdfError);
    } finally {
      setBuilding(false);
    }
  }

  function resetAll() {
    setSources(new Map());
    setPages([]);
    setWatermarkText('');
    setPageNumbers(false);
    setEditingPageId(null);
  }

  function saveEditedPage(next: PageItem) {
    setPages((prev) =>
      prev.map((p) =>
        p.id === next.id
          ? {
              ...next,
              textLayerReady: true,
              thumbnail: next.isBlank
                ? blankPageThumbnail(next.pageSize.width, next.pageSize.height)
                : next.thumbnail
            }
          : p
      )
    );
    setEditingPageId(null);
    const editedTexts = next.overlays.filter(
      (o) => o.kind === 'text' && o.fromPdf && o.text !== o.originalText
    ).length;
    toast(editedTexts > 0 ? t.toastPageSavedWithEdits(editedTexts) : t.toastPageSaved);
  }

  return (
    <AuthGate title={t.authTitle} description={t.authDescription}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton href={publicLanding ? '/recursos' : undefined} />
        </div>

        <PageHero
          title={t.heroTitle}
          subtitle={t.heroSubtitle}
          icon={FileStack}
          headingLevel={publicLanding ? 'h2' : 'h1'}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight icon={Type} text={t.insightEdit} />
          <Insight icon={Maximize2} text={t.insightResize} />
          <Insight icon={Lock} text={t.insightLocal} />
        </div>

        {pages.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
              dragOver
                ? 'border-sky-500 bg-sky-50'
                : 'border-slate-300 bg-white hover:border-sky-300 hover:bg-sky-50/50'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && void handleFiles(e.target.files)}
            />
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin text-sky-600" aria-hidden />
            ) : (
              <Upload className="h-10 w-10 text-sky-600" aria-hidden />
            )}
            <p className="text-base font-bold text-slate-900">
              {loading ? t.dropzoneLoading : t.dropzoneTitle}
            </p>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              {t.dropzoneSubtitlePrefix} <strong>{t.dropzoneSubtitleWord}</strong>{' '}
              {t.dropzoneSubtitleSuffix(MAX_FILE_MB)}
            </p>
            <Button variant="outline" size="sm" icon={FileUp} disabled={loading}>
              {t.selectFiles}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <Button
                variant="outline"
                size="sm"
                icon={FileUp}
                onClick={() => inputRef.current?.click()}
                disabled={loading}
              >
                {t.addPdf}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && void handleFiles(e.target.files)}
              />
              <Button variant="outline" size="sm" icon={StickyNote} onClick={insertBlankPage}>
                {t.blankPage}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={allSelected ? Square : CheckSquare}
                onClick={toggleSelectAll}
              >
                {allSelected ? t.clearSelection : t.selectAll}
              </Button>
              <div className="mx-1 h-6 w-px bg-slate-200" />
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                disabled={!selectedCount}
                onClick={() => rotateSelected(-90)}
              >
                {t.rotate}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCw}
                disabled={!selectedCount}
                onClick={() => rotateSelected(90)}
              >
                {t.rotate}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ScissorsSquare}
                disabled={!selectedCount}
                onClick={() => handleDownload(true)}
              >
                {t.extract}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                disabled={!selectedCount}
                onClick={removeSelected}
              >
                {t.deleteSelected(selectedCount)}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetAll} className="ml-auto">
                {t.restart}
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    className={cn(
                      'group relative rounded-xl border bg-white p-2 shadow-sm transition-all',
                      p.selected
                        ? 'border-sky-500 ring-2 ring-sky-200'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSelect(p.id)}
                      className="absolute left-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-md border border-slate-300 bg-white/90 text-sky-600 shadow-sm"
                      aria-label={t.selectPageAria}
                    >
                      {p.selected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    <span className="absolute right-3 top-3 z-10 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                      {idx + 1}
                    </span>
                    {p.overlays.length > 0 || p.pageSize.preset !== 'original' ? (
                      <span className="absolute bottom-14 left-3 z-10 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[0.6rem] font-bold text-white">
                        {t.editedBadge}
                      </span>
                    ) : null}
                    <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnail}
                        alt={t.pageAlt(idx + 1)}
                        style={{ transform: `rotate(${p.rotation}deg)` }}
                        className="max-h-full max-w-full object-contain transition-transform"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingPageId(p.id)}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-sky-600 px-2 text-[0.7rem] font-bold text-white hover:bg-sky-700"
                        aria-label={t.editContentAria}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t.editButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => rotate(p.id, 90)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label={t.rotateAria}
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicatePage(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label={t.duplicateAria}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(p.id, -1)}
                        disabled={idx === 0}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                        aria-label={t.moveUpAria}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(p.id, 1)}
                        disabled={idx === pages.length - 1}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                        aria-label={t.moveDownAria}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePage(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"
                        aria-label={t.removeAria}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
                <h2 className="precisoutapronto-display text-base font-bold text-slate-900">{t.finalizeTitle}</h2>

                <div className="space-y-2 rounded-xl border border-sky-100 bg-sky-50/80 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-800">
                    {t.resizeSelectedTitle}
                  </p>
                  <FormField label={t.formatLabel} htmlFor="bulk-preset">
                    <Select
                      id="bulk-preset"
                      value={bulkPreset}
                      onChange={(e) => setBulkPreset(e.target.value as PageSizePreset)}
                    >
                      <option value="original">{t.formatOriginal}</option>
                      <option value="a4">{t.formatA4}</option>
                      <option value="letter">{t.formatLetter}</option>
                      <option value="a5">{t.formatA5}</option>
                      <option value="square">{t.formatSquare}</option>
                    </Select>
                  </FormField>
                  <FormField label={t.fitLabel} htmlFor="bulk-fit">
                    <Select
                      id="bulk-fit"
                      value={bulkFit}
                      onChange={(e) => setBulkFit(e.target.value as PageFitMode)}
                    >
                      <option value="contain">{t.fitContain}</option>
                      <option value="cover">{t.fitCover}</option>
                      <option value="stretch">{t.fitStretch}</option>
                      <option value="none">{t.fitNone}</option>
                    </Select>
                  </FormField>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    icon={Maximize2}
                    onClick={applySizeToSelected}
                  >
                    {t.applyToSelected}
                  </Button>
                </div>

                <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    checked={pageNumbers}
                    onChange={(e) => setPageNumbers(e.target.checked)}
                  />
                  {t.pageNumbersLabel}
                </label>

                <FormField
                  label={t.watermarkLabel}
                  htmlFor="watermark"
                  hint={t.watermarkHint}
                >
                  <Input
                    id="watermark"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder={t.watermarkPlaceholder}
                  />
                </FormField>

                {watermarkText.trim() ? (
                  <FormField
                    label={t.opacityLabel(Math.round(watermarkOpacity * 100))}
                    htmlFor="opacity"
                  >
                    <input
                      id="opacity"
                      type="range"
                      min={0.05}
                      max={0.5}
                      step={0.01}
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </FormField>
                ) : null}

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  <span className="font-bold text-slate-700">{pages.length}</span> {t.summarySuffix}
                  {sources.size > 1 ? t.summaryMerged(sources.size) : ''}.
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  icon={Download}
                  loading={building}
                  onClick={() => handleDownload(false)}
                >
                  {t.downloadFinal}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {editingPage ? (
        <PageEditor
          page={editingPage}
          source={sources.get(editingPage.sourceId)}
          onClose={() => setEditingPageId(null)}
          onSave={saveEditedPage}
        />
      ) : null}
    </AuthGate>
  );
}

function Insight({ icon: Icon, text }: { icon: typeof Lock; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-xs font-semibold leading-5 text-slate-700">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-600 text-white">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span>{text}</span>
      <Sparkles className="ml-auto hidden h-4 w-4 shrink-0 text-sky-500 sm:block" aria-hidden />
    </div>
  );
}
