#!/usr/bin/env python3
"""Compõe artes 9:16 premium (dor / solução / CTA) no visual language Frota."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "docs" / "divulgacao" / "assets"
OUT_ROOT = ROOT / "docs" / "divulgacao" / "reel" / "nichos"
W, H = 1080, 1920

TOOL_ART = {
    "orcamento": ASSETS / "promo-orcamento-pix-stories.png",
    "proposta": ASSETS / "promo-proposta-stories.png",
    "recibo": ASSETS / "promo-recibo-stories.png",
    "contrato": ASSETS / "promo-proposta-stories.png",
    "pix": ASSETS / "promo-orcamento-pix-stories.png",
}

DOR_SCENES = {
    "01-cabeleireiro": "salon chair empty, smartphone with WhatsApp voice note UI on mirror shelf, warm salon lights, cinematic night, shallow depth of field, photorealistic, vertical 9:16, no text no logos no watermark",
    "02-pedreiro": "construction site notebook with messy handwritten budget, dirty work gloves, measuring tape, dusty daylight, photorealistic vertical 9:16, no text no logos",
    "03-personal": "gym locker room phone showing chat about monthly training package, dumbbells blurred, photorealistic vertical 9:16, no text no logos",
    "04-manicure": "nail salon table with price list sticky notes and Instagram open on phone, soft pink warm light, photorealistic vertical 9:16, no text no logos",
    "05-fotografo": "camera bag and laptop with client brief in DMs on phone, studio softbox bokeh, photorealistic vertical 9:16, no text no logos",
    "06-eletricista": "electrical panel open, handwritten notes on clipboard, van tools, daylight photorealistic vertical 9:16, no text no logos",
    "07-contador": "office desk calculator and unpaid client chat on phone asking for receipt, papers stacked, photorealistic vertical 9:16, no text no logos",
    "08-advogado": "law desk with WhatsApp open discussing fees, no signed contract papers, dark wood cinematic, photorealistic vertical 9:16, no text no logos",
    "09-delivery": "delivery motorcycle helmet and food bag, phone showing 'me passa a chave pix' chat, night street bokeh, photorealistic vertical 9:16, no text no logos",
    "10-aulas": "study desk books and phone with long voice message waveform to parents, warm lamp, photorealistic vertical 9:16, no text no logos",
    "11-petsitter": "cute dog crate weekend boarding notes and phone calculator, cozy home, photorealistic vertical 9:16, no text no logos",
    "12-dj": "DJ booth party lights, phone with urgent event quote request, nightclub bokeh, photorealistic vertical 9:16, no text no logos",
}


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    path = Path(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf")
    return ImageFont.truetype(str(path), size=size)


def fit_cover(img: Image.Image, tw: int, th: int) -> Image.Image:
    img = img.convert("RGB")
    scale = max(tw / img.width, th / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return img.crop((left, top, left + tw, top + th))


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    box: tuple[int, int, int, int],
    fnt: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int] = (255, 255, 255),
    align: str = "center",
    line_gap: int = 12,
) -> None:
    x0, y0, x1, y1 = box
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        cur = ""
        for w in words:
            trial = f"{cur} {w}".strip()
            if draw.textlength(trial, font=fnt) <= (x1 - x0):
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        elif not paragraph:
            lines.append("")
    total_h = sum(fnt.getbbox(l)[3] - fnt.getbbox(l)[1] for l in lines) + line_gap * (len(lines) - 1)
    y = y0 + max(0, (y1 - y0 - total_h) // 2)
    for line in lines:
        tw = draw.textlength(line, font=fnt)
        x = x0 + ((x1 - x0) - tw) / 2 if align == "center" else x0
        draw.text((x, y), line, font=fnt, fill=fill)
        y += (fnt.getbbox(line)[3] - fnt.getbbox(line)[1]) + line_gap


def make_dor(bg_path: Path, headline: str, out: Path) -> None:
    base = fit_cover(Image.open(bg_path), W, H)
    base = ImageEnhance.Contrast(base).enhance(1.08)
    base = ImageEnhance.Color(base).enhance(1.05)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, 0, W, 520), fill=(8, 12, 22, 210))
    d.rectangle((0, 520, W, 620), fill=(8, 12, 22, 120))
    # gold accent line
    d.rectangle((120, 500, W - 120, 506), fill=(232, 184, 74, 230))
    composed = Image.alpha_composite(base.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(composed)
    draw_wrapped(draw, headline, (70, 80, W - 70, 470), font(58), fill=(255, 255, 255))
    brand = font(26, bold=False)
    label = "Resolva Jato"
    tw = draw.textlength(label, font=brand)
    draw.text(((W - tw) / 2, 1780), label, font=brand, fill=(232, 184, 74))
    composed.convert("RGB").save(out, "PNG", optimize=True)


def make_solucao(tool_art: Path, headline: str, out: Path) -> None:
    base = fit_cover(Image.open(tool_art), W, H)
    # darken top for headline readability
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, 0, W, 480), fill=(8, 12, 22, 185))
    d.rectangle((80, 470, W - 80, 476), fill=(232, 184, 74, 230))
    composed = Image.alpha_composite(base.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(composed)
    # highlight last line in gold when multiline
    lines = headline.split("\n")
    if len(lines) >= 2:
        draw_wrapped(draw, lines[0], (70, 70, W - 70, 250), font(52), fill=(255, 255, 255))
        draw_wrapped(draw, "\n".join(lines[1:]), (70, 250, W - 70, 430), font(52), fill=(232, 184, 74))
    else:
        draw_wrapped(draw, headline, (70, 90, W - 70, 420), font(52), fill=(255, 255, 255))
    composed.convert("RGB").save(out, "PNG", optimize=True)


def make_cta(cta_base: Path, url: str, out: Path) -> None:
    base = fit_cover(Image.open(cta_base), W, H)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    # bottom URL pill
    pad_x, pad_y = 48, 22
    fnt = font(34, bold=False)
    tw = d.textlength(url, font=fnt)
    bw, bh = tw + pad_x * 2, 70
    bx, by = (W - bw) / 2, 1680
    d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=35, outline=(232, 184, 74, 255), width=3)
    d.rounded_rectangle((bx + 3, by + 3, bx + bw - 3, by + bh - 3), radius=32, fill=(8, 12, 22, 200))
    composed = Image.alpha_composite(base.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(composed)
    draw.text((bx + pad_x, by + pad_y - 2), url, font=fnt, fill=(255, 255, 255))
    composed.convert("RGB").save(out, "PNG", optimize=True)


def compose(niche_id: str, dor_bg: Path | None = None) -> None:
    meta_path = OUT_ROOT / niche_id / "meta.json"
    if not meta_path.exists():
        raise SystemExit(f"Rode a narração antes: falta {meta_path}")
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    out_dir = OUT_ROOT / niche_id / "arts"
    out_dir.mkdir(parents=True, exist_ok=True)

    if dor_bg is None:
        dor_bg = out_dir / "dor-bg.png"
    if not dor_bg.exists():
        # fallback: frota dor photo cropped without relying on its baked text
        dor_bg = ASSETS / "reel-frota-style-dor.png"
    make_dor(dor_bg, meta["screen"][0], out_dir / "dor.png")
    tool = TOOL_ART[meta["tool"]]
    # Nao usar frota-meio (texto ja bakeado). Overlay limpo nas promo stories.
    make_solucao(tool, meta["screen"][1], out_dir / "solucao.png")
    cta_base = ASSETS / "reel-frota-style-cta-marca.png"
    if not cta_base.exists():
        cta_base = ASSETS / "promo-marca-site-stories.png"
    make_cta(cta_base, meta["cta_url"], out_dir / "cta.png")
    print(f"ok arts {niche_id}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", required=True)
    parser.add_argument("--dor-bg", type=Path)
    args = parser.parse_args()
    compose(args.id, args.dor_bg)


if __name__ == "__main__":
    main()
