import { getFontOptionById } from './fonts';

const GRID = 16;
const SAMPLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/-.';
const FONT_IDS = ['arial', 'times-new-roman', 'courier-new'];

type Glyph = { aspect: number; cells: Float32Array };
type FontSample = { fontId: string; bold: boolean; glyphs: Glyph[] };
let fontSamples: FontSample[] | undefined;

function describeGlyph(
  ink: Uint8Array,
  stride: number,
  left: number,
  top: number,
  width: number,
  height: number
): Glyph {
  const sums = new Float32Array(GRID * GRID);
  const counts = new Uint32Array(GRID * GRID);
  // Cada célula mede a cobertura de tinta, com amostragem mínima para glifos pequenos.
  const columns = Math.max(width, GRID);
  const rows = Math.max(height, GRID);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const cell = Math.floor(y * GRID / rows) * GRID + Math.floor(x * GRID / columns);
      const offset = (top + Math.floor(y * height / rows)) * stride + left + Math.floor(x * width / columns);
      sums[cell] += ink[offset];
      counts[cell] += 1;
    }
  }
  return { aspect: width / height, cells: sums.map((sum, cell) => sum / counts[cell]) };
}

function loadFontSamples(): FontSample[] {
  if (fontSamples) return fontSamples;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 80;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  fontSamples = FONT_IDS.flatMap((fontId) => [false, true].map((bold) => {
    const font = getFontOptionById(fontId);
    const generic = font.standard === 'Courier' ? 'monospace' : font.standard === 'TimesRoman' ? 'serif' : 'sans-serif';
    ctx.font = `${bold ? 700 : 400} 60px "${font.family}", ${generic}`;
    const glyphs = [...SAMPLE_CHARS].map((character) => {
      const metrics = ctx.measureText(character);
      const width = Math.ceil(metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight);
      const height = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
      ctx.clearRect(0, 0, 80, 80);
      ctx.fillText(character, metrics.actualBoundingBoxLeft, metrics.actualBoundingBoxAscent);
      const rgba = ctx.getImageData(0, 0, width, height).data;
      const ink = Uint8Array.from({ length: width * height }, (_, i) => Number(rgba[i * 4 + 3] >= 128));
      return describeGlyph(ink, width, 0, 0, width, height);
    });
    return { fontId, bold, glyphs };
  }));
  return fontSamples;
}

export function matchRasterFont(ink: Uint8Array, width: number, height: number, lineHeight: number) {
  if (lineHeight < 10) return null;
  const glyphs: Glyph[] = [];
  let left = -1;
  let top = height;
  let bottom = -1;
  for (let x = 0; x <= width && glyphs.length < 20; x += 1) {
    let hasInk = false;
    for (let y = 0; x < width && y < height; y += 1) {
      if (!ink[y * width + x]) continue;
      hasInk = true;
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
    if (hasInk) {
      if (left < 0) left = x;
    } else if (left >= 0) {
      const glyphHeight = bottom - top + 1;
      if (glyphHeight >= lineHeight * 0.55 && x - left <= glyphHeight * 1.25) {
        glyphs.push(describeGlyph(ink, width, left, top, x - left, glyphHeight));
      }
      left = -1;
      top = height;
      bottom = -1;
    }
  }
  if (glyphs.length < 3) return null;

  const scores = loadFontSamples().map(({ fontId, bold, glyphs: samples }) => {
    const distances = glyphs.map((glyph) => Math.min(...samples.map((sample) => {
      const aspect = Math.abs(Math.log(glyph.aspect / sample.aspect)) * 0.16;
      let shape = 0;
      for (let i = 0; i < glyph.cells.length; i += 1) {
        shape += Math.abs(glyph.cells[i] - sample.cells[i]);
      }
      return aspect + shape / glyph.cells.length;
    })));
    // Tolera glifos colados ou parcialmente selecionados.
    distances.sort((a, b) => a - b);
    const reliable = distances.slice(0, Math.ceil(distances.length * 0.8));
    return { fontId, bold, distance: reliable.reduce((sum, value) => sum + value, 0) / reliable.length };
  });
  scores.sort((a, b) => a.distance - b.distance);
  const best = scores[0];
  const nextFamily = scores.find((sample) => sample.fontId !== best?.fontId);
  if (!best || best.distance > 0.24 || !nextFamily || nextFamily.distance - best.distance < 0.008) return null;
  return best;
}
