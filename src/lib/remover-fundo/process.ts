export interface RemoveBackgroundResult {
  blob: Blob;
  url: string;
}

/** Limite alto o bastante para preservar detalhes finos (capa, cabelo, joias). */
const MAX_DIMENSION = 3600;

type ImglyModule = typeof import("@imgly/background-removal");

/** Redimensiona só se a imagem for enorme (evita OOM no WASM). */
async function normalizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  if (bitmap.width <= MAX_DIMENSION && bitmap.height <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }
  const scale = MAX_DIMENSION / Math.max(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas indisponível");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao processar imagem"))),
      "image/png",
    );
  });
}

function loadImgly(): Promise<ImglyModule> {
  const dynamicImport = new Function(
    "specifier",
    "return import(specifier)",
  ) as <T>(specifier: string) => Promise<T>;
  return dynamicImport<ImglyModule>(
    "https://esm.sh/@imgly/background-removal@1.7.0",
  );
}

function blobToImageData(blob: Blob): Promise<{
  data: ImageData;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}> {
  return createImageBitmap(blob).then((bitmap) => {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      bitmap.close();
      throw new Error("Canvas indisponível");
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return { data: ctx.getImageData(0, 0, canvas.width, canvas.height), canvas, ctx };
  });
}

function imageDataToPngBlob(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, data: ImageData) {
  ctx.putImageData(data, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar PNG"))),
      "image/png",
    );
  });
}

/** Dilatação binária separável (max-filter) em raio `r`. */
function dilateBinary(src: Uint8Array, w: number, h: number, r: number): Uint8Array {
  if (r <= 0) return src;
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let max = 0;
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(w - 1, x + r);
      for (let xx = x0; xx <= x1; xx++) {
        if (src[row + xx]) {
          max = 1;
          break;
        }
      }
      tmp[row + x] = max;
    }
  }

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let max = 0;
      const y0 = Math.max(0, y - r);
      const y1 = Math.min(h - 1, y + r);
      for (let yy = y0; yy <= y1; yy++) {
        if (tmp[yy * w + x]) {
          max = 1;
          break;
        }
      }
      out[y * w + x] = max;
    }
  }

  return out;
}

/**
 * Recupera partes do sujeito cortadas demais (capa, cabelo) e remove
 * franja/branqueamento nas bordas (ex.: coroa dourada lavada).
 */
async function refineCutout(blob: Blob): Promise<Blob> {
  const { data: imageData, canvas, ctx } = await blobToImageData(blob);
  const { data, width: w, height: h } = imageData;
  const n = w * h;
  const alpha = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++) alpha[i] = data[i * 4 + 3];

  // Estima cor do fundo a partir da franja semitransparente.
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let bgW = 0;
  for (let i = 0; i < n; i++) {
    const a = alpha[i];
    if (a > 0 && a < 48) {
      const o = i * 4;
      const weight = 48 - a;
      bgR += data[o] * weight;
      bgG += data[o + 1] * weight;
      bgB += data[o + 2] * weight;
      bgW += weight;
    }
  }
  if (bgW > 0) {
    bgR /= bgW;
    bgG /= bgW;
    bgB /= bgW;
  } else {
    // Cantos costumam ser fundo em fotos de produto / ilustrações.
    const corners = [0, w - 1, (h - 1) * w, (h - 1) * w + (w - 1)];
    for (const i of corners) {
      const o = i * 4;
      bgR += data[o];
      bgG += data[o + 1];
      bgB += data[o + 2];
    }
    bgR /= 4;
    bgG /= 4;
    bgB /= 4;
  }

  // Núcleo sólido do sujeito → dilata para recuperar capa/tecidos cortados.
  const core = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    core[i] = alpha[i] >= 208 ? 1 : 0;
  }
  const radius = Math.max(3, Math.min(18, Math.round(Math.min(w, h) * 0.01)));
  const nearSubject = dilateBinary(core, w, h, radius);
  const recovered = new Uint8ClampedArray(alpha);

  for (let i = 0; i < n; i++) {
    if (!nearSubject[i] || alpha[i] >= 140) continue;

    const o = i * 4;
    const pr = data[o];
    const pg = data[o + 1];
    const pb = data[o + 2];

    // Média local do núcleo (amostra em cruz — barato e suficiente).
    const x = i % w;
    const y = (i - x) / w;
    let nearR = 0;
    let nearG = 0;
    let nearB = 0;
    let nearC = 0;
    const span = radius;
    for (let d = 1; d <= span; d++) {
      const samples = [
        [x + d, y],
        [x - d, y],
        [x, y + d],
        [x, y - d],
        [x + d, y + d],
        [x - d, y - d],
        [x + d, y - d],
        [x - d, y + d],
      ];
      for (const [sx, sy] of samples) {
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
        const j = sy * w + sx;
        if (alpha[j] < 208) continue;
        const jo = j * 4;
        nearR += data[jo];
        nearG += data[jo + 1];
        nearB += data[jo + 2];
        nearC++;
      }
      if (nearC >= 4) break;
    }
    if (nearC === 0) continue;
    nearR /= nearC;
    nearG /= nearC;
    nearB /= nearC;

    const dSub =
      (pr - nearR) * (pr - nearR) +
      (pg - nearG) * (pg - nearG) +
      (pb - nearB) * (pb - nearB);
    const dBg =
      (pr - bgR) * (pr - bgR) +
      (pg - bgG) * (pg - bgG) +
      (pb - bgB) * (pb - bgB);

    // Só restaura se a cor parecer mais sujeito do que fundo.
    if (dSub <= dBg * 0.9 && dSub < 85 * 85) {
      const similarity = 1 - Math.sqrt(dSub) / 95;
      const boost = Math.round(140 + 115 * Math.max(0, similarity));
      recovered[i] = Math.max(alpha[i], boost);
    }
  }

  // Descontaminação de cor + contraste de alpha (remove halo branco/lavado).
  for (let i = 0; i < n; i++) {
    let a = recovered[i] / 255;
    // Curva suave: empurra semi-transparências para 0 ou 1.
    const t = Math.max(0, Math.min(1, (a - 0.06) / 0.88));
    a = t * t * (3 - 2 * t);
    a = a * a * (3 - 2 * a);

    const o = i * 4;
    if (a <= 0.004) {
      data[o] = 0;
      data[o + 1] = 0;
      data[o + 2] = 0;
      data[o + 3] = 0;
      continue;
    }
    if (a >= 0.995) {
      data[o + 3] = 255;
      continue;
    }

    const inv = 1 - a;
    data[o] = Math.max(0, Math.min(255, Math.round((data[o] - bgR * inv) / a)));
    data[o + 1] = Math.max(
      0,
      Math.min(255, Math.round((data[o + 1] - bgG * inv) / a)),
    );
    data[o + 2] = Math.max(
      0,
      Math.min(255, Math.round((data[o + 2] - bgB * inv) / a)),
    );
    data[o + 3] = Math.round(a * 255);
  }

  return imageDataToPngBlob(canvas, ctx, imageData);
}

async function runRemoval(
  removeBackground: ImglyModule["removeBackground"],
  image: Blob,
  device: "gpu" | "cpu",
  onProgress?: (label: string, current: number, total: number) => void,
) {
  return removeBackground(image, {
    model: "isnet",
    device,
    output: { format: "image/png", quality: 1 },
    progress: (key, current, total) => {
      onProgress?.(key, current, total);
    },
  });
}

/** Remove o fundo no navegador (IS-Net large + pós-processamento de borda). */
export async function removeImageBackground(
  file: File,
  onProgress?: (label: string, current: number, total: number) => void,
): Promise<RemoveBackgroundResult> {
  const { removeBackground } = await loadImgly();
  const normalized = await normalizeImage(file);

  let raw: Blob;
  try {
    raw = await runRemoval(removeBackground, normalized, "gpu", onProgress);
  } catch {
    raw = await runRemoval(removeBackground, normalized, "cpu", onProgress);
  }

  onProgress?.("compute:refine", 0, 1);
  const blob = await refineCutout(raw);
  onProgress?.("compute:refine", 1, 1);

  return { blob, url: URL.createObjectURL(blob) };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
