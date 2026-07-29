"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Download,
  ImageOff,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PageHero } from "@/components/shared/page-hero";
import { ToolsBackButton } from "@/components/shared/tools-back-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { buildResolvaJatoDownloadName } from "@/lib/download-filename";
import { cn } from "@/lib/utils";
import {
  downloadBlob,
  isSupportedImageFile,
  removeImageBackground,
} from "@/lib/remover-fundo/process";

type Locale = "pt-BR" | "en" | "es";

const MAX_FILE_MB = 15;
const PRESET_COLORS = [
  "transparent",
  "#ffffff",
  "#000000",
  "#0ea5e9",
  "#22c55e",
  "#f43f5e",
  "#eab308",
];

const COPY: Record<
  Locale,
  {
    authTitle: string;
    authDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    insightLocal: string;
    insightIA: string;
    insightPng: string;
    dropzoneTitle: string;
    dropzoneSubtitle: string;
    selectImage: string;
    originalLabel: string;
    semFundoLabel: string;
    originalAlt: string;
    semFundoAlt: string;
    chooseAnother: string;
    outputTitle: string;
    waitingTitle: string;
    waitingText: string;
    transparentBg: string;
    customBg: (color: string) => string;
    presetHint: string;
    downloadButton: string;
    toastInvalidImage: string;
    toastMaxSize: (mb: number) => string;
    toastSuccess: string;
    toastError: string;
    progressPreparing: string;
    progressDownloadingModel: string;
    progressRefining: string;
    progressRemoving: string;
  }
> = {
  "pt-BR": {
    authTitle: "Removedor de Fundo de Imagem",
    authDescription: "Cadastre-se gratuitamente para remover fundos de imagens.",
    heroTitle: "Removedor de Fundo de Imagem",
    heroSubtitle:
      "Recorte pessoas, produtos e objetos automaticamente e baixe em PNG transparente. O processamento roda no seu navegador, a imagem não é enviada a nenhum servidor.",
    insightLocal: "100% local: a imagem nunca sai do seu dispositivo.",
    insightIA: "Recorte automático por IA em segundos.",
    insightPng: "Baixe em PNG com fundo transparente ou colorido.",
    dropzoneTitle: "Arraste uma imagem aqui ou clique para selecionar",
    dropzoneSubtitle: `JPG, JPEG, JFIF, PNG ou WEBP · até ${MAX_FILE_MB}MB.`,
    selectImage: "Selecionar imagem",
    originalLabel: "Original",
    semFundoLabel: "Sem fundo",
    originalAlt: "Imagem original",
    semFundoAlt: "Imagem sem fundo",
    chooseAnother: "Escolher outra imagem",
    outputTitle: "Fundo de saída",
    waitingTitle: "Aguarde o processamento.",
    waitingText:
      "Na primeira vez o modelo de alta qualidade é baixado (um pouco maior); depois fica em cache. Bordas e cores são refinadas automaticamente.",
    transparentBg: "Fundo transparente",
    customBg: (color) => `Fundo ${color}`,
    presetHint:
      "Escolha um fundo sólido ou mantenha transparente para usar em qualquer lugar (apresentações, editores de imagem, catálogos).",
    downloadButton: "Baixar PNG",
    toastInvalidImage: "Selecione uma imagem (JPG, JFIF, PNG ou WEBP).",
    toastMaxSize: (mb) => `A imagem excede ${mb}MB.`,
    toastSuccess: "Fundo removido com sucesso!",
    toastError: "Não foi possível remover o fundo dessa imagem. Tente outro arquivo.",
    progressPreparing: "Preparando imagem…",
    progressDownloadingModel: "Baixando modelo de alta qualidade (só na primeira vez)…",
    progressRefining: "Refinando bordas e cores…",
    progressRemoving: "Removendo o fundo…",
  },
  en: {
    authTitle: "Image Background Remover",
    authDescription: "Sign up for free to remove image backgrounds.",
    heroTitle: "Image Background Remover",
    heroSubtitle:
      "Cut out people, products and objects automatically and download a transparent PNG. Processing runs in your browser, the image is never sent to any server.",
    insightLocal: "100% local: the image never leaves your device.",
    insightIA: "Automatic AI cutout in seconds.",
    insightPng: "Download as PNG with a transparent or solid background.",
    dropzoneTitle: "Drag an image here or click to select",
    dropzoneSubtitle: `JPG, JPEG, JFIF, PNG or WEBP, up to ${MAX_FILE_MB}MB.`,
    selectImage: "Select image",
    originalLabel: "Original",
    semFundoLabel: "No background",
    originalAlt: "Original image",
    semFundoAlt: "Image without background",
    chooseAnother: "Choose another image",
    outputTitle: "Output background",
    waitingTitle: "Please wait while processing.",
    waitingText:
      "The first time, the high-quality model is downloaded (slightly larger); after that it stays cached. Edges and colors are refined automatically.",
    transparentBg: "Transparent background",
    customBg: (color) => `Background ${color}`,
    presetHint:
      "Choose a solid background or keep it transparent to use anywhere (presentations, image editors, catalogs).",
    downloadButton: "Download PNG",
    toastInvalidImage: "Select an image (JPG, JFIF, PNG or WEBP).",
    toastMaxSize: (mb) => `The image exceeds ${mb}MB.`,
    toastSuccess: "Background removed successfully!",
    toastError: "Could not remove the background from that image. Try another file.",
    progressPreparing: "Preparing image...",
    progressDownloadingModel: "Downloading high-quality model (first time only)...",
    progressRefining: "Refining edges and colors...",
    progressRemoving: "Removing the background...",
  },
  es: {
    authTitle: "Eliminador de Fondo de Imagen",
    authDescription: "Registrate gratis para eliminar fondos de imagenes.",
    heroTitle: "Eliminador de Fondo de Imagen",
    heroSubtitle:
      "Recorta personas, productos y objetos automaticamente y descarga en PNG transparente. El procesamiento corre en tu navegador, la imagen no se envia a ningun servidor.",
    insightLocal: "100% local: la imagen nunca sale de tu dispositivo.",
    insightIA: "Recorte automatico por IA en segundos.",
    insightPng: "Descarga en PNG con fondo transparente o de color.",
    dropzoneTitle: "Arrastra una imagen aqui o haz clic para seleccionar",
    dropzoneSubtitle: `JPG, JPEG, JFIF, PNG o WEBP, hasta ${MAX_FILE_MB}MB.`,
    selectImage: "Seleccionar imagen",
    originalLabel: "Original",
    semFundoLabel: "Sin fondo",
    originalAlt: "Imagen original",
    semFundoAlt: "Imagen sin fondo",
    chooseAnother: "Elegir otra imagen",
    outputTitle: "Fondo de salida",
    waitingTitle: "Espera mientras se procesa.",
    waitingText:
      "La primera vez se descarga el modelo de alta calidad (un poco mas grande); despues queda en cache. Los bordes y colores se refinan automaticamente.",
    transparentBg: "Fondo transparente",
    customBg: (color) => `Fondo ${color}`,
    presetHint:
      "Elige un fondo solido o mantenlo transparente para usar en cualquier lugar (presentaciones, editores de imagen, catalogos).",
    downloadButton: "Descargar PNG",
    toastInvalidImage: "Selecciona una imagen (JPG, JFIF, PNG o WEBP).",
    toastMaxSize: (mb) => `La imagen supera ${mb}MB.`,
    toastSuccess: "Fondo eliminado con exito!",
    toastError: "No se pudo eliminar el fondo de esa imagen. Prueba con otro archivo.",
    progressPreparing: "Preparando imagen...",
    progressDownloadingModel: "Descargando modelo de alta calidad (solo la primera vez)...",
    progressRefining: "Refinando bordes y colores...",
    progressRemoving: "Eliminando el fondo...",
  },
};

export function RemoverFundoApp({ locale = "pt-BR" }: { locale?: Locale } = {}) {
  const t = COPY[locale];
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [bgColor, setBgColor] = useState("transparent");
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isSupportedImageFile(file)) {
        toast(t.toastInvalidImage, {
          variant: "error",
        });
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast(t.toastMaxSize(MAX_FILE_MB), { variant: "error" });
        return;
      }
      setOriginalUrl(URL.createObjectURL(file));
      setResultBlob(null);
      setResultUrl(null);
      setCompositeUrl(null);
      setBgColor("transparent");
      setProcessing(true);
      setProgressLabel(t.progressPreparing);
      setProgressPct(0);
      try {
        const { blob, url } = await removeImageBackground(
          file,
          (label, current, total) => {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
            setProgressPct(pct);
            setProgressLabel(
              label.startsWith("fetch")
                ? t.progressDownloadingModel
                : label.startsWith("prepare")
                  ? t.progressPreparing
                  : label.includes("refine")
                    ? t.progressRefining
                    : t.progressRemoving,
            );
          },
        );
        setResultBlob(blob);
        setResultUrl(url);
        toast(t.toastSuccess);
      } catch (err) {
        console.error(err);
        toast(t.toastError, { variant: "error" });
      } finally {
        setProcessing(false);
      }
    },
    [toast, t],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const previewUrl = useMemo(
    () => compositeUrl ?? resultUrl,
    [compositeUrl, resultUrl],
  );

  async function applyBackground(color: string) {
    setBgColor(color);
    if (!resultUrl) return;
    if (color === "transparent") {
      setCompositeUrl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = resultUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    setCompositeUrl(canvas.toDataURL("image/png"));
  }

  async function handleDownload() {
    const name = buildResolvaJatoDownloadName("picture");
    if (compositeUrl) {
      const res = await fetch(compositeUrl);
      const blob = await res.blob();
      downloadBlob(blob, name);
      return;
    }
    if (resultBlob) {
      downloadBlob(resultBlob, name);
    }
  }

  function reset() {
    setOriginalUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setCompositeUrl(null);
    setBgColor("transparent");
  }

  return (
    <AuthGate
      title={t.authTitle}
      description={t.authDescription}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton />
        </div>

        <PageHero
          title={t.heroTitle}
          subtitle={t.heroSubtitle}
          icon={ImageOff}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <Insight
            icon={Lock}
            text={t.insightLocal}
          />
          <Insight icon={Wand2} text={t.insightIA} />
          <Insight
            icon={ShieldCheck}
            text={t.insightPng}
          />
        </div>

        {!originalUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
              dragOver
                ? "border-sky-500 bg-sky-50"
                : "border-slate-300 bg-white hover:border-sky-300 hover:bg-sky-50/50",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/jfif,.jpg,.jpeg,.jfif,.png,.webp"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && void handleFile(e.target.files[0])
              }
            />
            <Upload className="h-10 w-10 text-sky-600" aria-hidden />
            <p className="text-base font-bold text-slate-900">
              {t.dropzoneTitle}
            </p>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              {t.dropzoneSubtitle}
            </p>
            <Button variant="outline" size="sm" icon={Upload}>
              {t.selectImage}
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {t.originalLabel}
                  </p>
                  <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={originalUrl}
                      alt={t.originalAlt}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {t.semFundoLabel}
                  </p>
                  <div
                    className="flex h-72 items-center justify-center overflow-hidden rounded-xl"
                    style={{
                      backgroundImage:
                        bgColor === "transparent"
                          ? "conic-gradient(#e2e8f0 90deg, #f8fafc 90deg 180deg, #e2e8f0 180deg 270deg, #f8fafc 270deg)"
                          : undefined,
                      backgroundSize:
                        bgColor === "transparent" ? "20px 20px" : undefined,
                      backgroundColor:
                        bgColor !== "transparent" ? bgColor : undefined,
                    }}
                  >
                    {processing ? (
                      <div className="flex flex-col items-center gap-2 px-6 text-center">
                        <Loader2
                          className="h-8 w-8 animate-spin text-sky-600"
                          aria-hidden
                        />
                        <p className="text-sm font-semibold text-slate-700">
                          {progressLabel}
                        </p>
                        {progressPct > 0 ? (
                          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full bg-sky-600 transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={t.semFundoAlt}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCcw}
                onClick={reset}
              >
                {t.chooseAnother}
              </Button>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
              <h2 className="rj-display text-base font-bold text-slate-900">
                {t.outputTitle}
              </h2>
              {!resultUrl ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-800">
                    {t.waitingTitle}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {t.waitingText}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => applyBackground(color)}
                        aria-label={
                          color === "transparent"
                            ? t.transparentBg
                            : t.customBg(color)
                        }
                        className={cn(
                          "h-9 w-9 rounded-lg border-2 transition-all",
                          bgColor === color
                            ? "border-sky-600 ring-2 ring-sky-200"
                            : "border-slate-200",
                        )}
                        style={{
                          backgroundImage:
                            color === "transparent"
                              ? "conic-gradient(#e2e8f0 90deg, #f8fafc 90deg 180deg, #e2e8f0 180deg 270deg, #f8fafc 270deg)"
                              : undefined,
                          backgroundSize:
                            color === "transparent" ? "10px 10px" : undefined,
                          backgroundColor:
                            color !== "transparent" ? color : undefined,
                        }}
                      />
                    ))}
                    <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border-2 border-slate-200 bg-white text-slate-400">
                      <input
                        type="color"
                        className="h-0 w-0 opacity-0"
                        onChange={(e) => applyBackground(e.target.value)}
                      />
                      <Sparkles className="h-4 w-4" aria-hidden />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    {t.presetHint}
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    icon={Download}
                    onClick={handleDownload}
                  >
                    {t.downloadButton}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
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
      <Sparkles
        className="ml-auto hidden h-4 w-4 shrink-0 text-sky-500 sm:block"
        aria-hidden
      />
    </div>
  );
}
