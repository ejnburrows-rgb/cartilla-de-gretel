#!/usr/bin/env python3
"""Final manual-tuned tight crops for ojos, ola, abeja from known source pages."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "generated" / "art-repair-qa"
COLOR = ROOT / "public" / "cartilla" / "art" / "color" / "workbook"
PALETTE = ROOT / "generated" / "flipbook-palettes"


def trim_white(im: Image.Image, pad: int = 3) -> Image.Image:
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r < 248 or g < 248 or b < 248:
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return im
    return im.crop(
        (max(0, min_x - pad), max(0, min_y - pad), min(w, max_x + 1 + pad), min(h, max_y + 1 + pad))
    )


def save_webp(im: Image.Image, path: Path) -> None:
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    im.save(path, "WEBP", quality=92, method=6)


def ba(slug: str, before: Image.Image | None, after: Image.Image, verdict: str) -> None:
    tiles = []
    if before is not None:
        b = before.convert("RGBA")
        b.thumbnail((320, 320))
        tiles.append(("BEFORE", b))
    a = after.convert("RGBA")
    a.thumbnail((320, 320))
    tiles.append(("AFTER", a))
    pad, lh = 16, 28
    width = sum(t.width for _, t in tiles) + pad * (len(tiles) + 1)
    height = max(t.height for _, t in tiles) + pad * 2 + lh * 2
    canvas = Image.new("RGB", (width, height), (245, 245, 245))
    draw = ImageDraw.Draw(canvas)
    x = pad
    for lab, t in tiles:
        canvas.paste(t, (x, pad + lh), t if t.mode == "RGBA" else None)
        draw.text((x, 6), lab, fill=(0, 0, 0))
        x += t.width + pad
    draw.text((pad, height - lh + 4), f"{slug}: {verdict}", fill=(20, 80, 40))
    canvas.save(QA / f"{slug}-before-after.png")


def main() -> None:
    o4 = Image.open(ROOT / "public/cartilla/images/source/o/o-page-4.jpg").convert("RGB")
    a5 = Image.open(ROOT / "public/cartilla/images/source/a/a-page-5.jpg").convert("RGB")
    print("o4", o4.size, "a5", a5.size)
    # Save annotated preview grids for QA
    o4_prev = o4.copy()
    o4_prev.thumbnail((600, 800))
    o4_prev.save(QA / "o4-for-manual.jpg", quality=90)
    a5_prev = a5.copy()
    a5_prev.thumbnail((600, 800))
    a5_prev.save(QA / "a5-for-manual.jpg", quality=90)

    W, H = o4.size  # 1275 x 1650
    # From visual of o-page-4:
    # Top row cells approx y ~ 0.18-0.36 of page; eyes in right cell
    # Looking at image structure: cells are roughly
    # Row1: iglu, oveja, ojos around y=280-520
    # From earlier good crop that had BOTH eyes with frame at ~top-right:
    # The first pipeline crop (0.62,0.18,0.28,0.18) had both eyes - use that then trim frame

    ojos_raw = o4.crop(
        (
            int(0.62 * W),
            int(0.18 * H),
            int(0.90 * W),
            int(0.36 * H),
        )
    )
    ojos_raw.save(QA / "ojos-raw-cell.png")

    # Remove teal frame by finding content that is not pure white and not strong teal page chrome
    # Strategy: crop inner 8% margins then trim white
    iw, ih = ojos_raw.size
    ojos = ojos_raw.crop((int(iw * 0.08), int(ih * 0.08), int(iw * 0.92), int(ih * 0.92)))
    ojos = trim_white(ojos, pad=4)
    # Drop remaining right teal strip if present: if rightmost 5% is mostly teal, crop it
    rw, rh = ojos.size
    right = ojos.crop((int(rw * 0.92), 0, rw, rh))
    rpx = list(right.resize((20, 40)).getdata())
    teal_right = sum(1 for r, g, b in rpx if g > 100 and b > 80 and r < 120) / max(1, len(rpx))
    if teal_right > 0.25:
        ojos = ojos.crop((0, 0, int(rw * 0.92), rh))
        ojos = trim_white(ojos, pad=2)
    save_webp(ojos, COLOR / "ojos.webp")
    try:
        before = Image.open(ROOT / "public/cartilla/art/faithful/vocal-o/ojos.webp")
    except Exception:
        before = None
    ba("ojos", before, ojos, "FIXED_FROM_SOURCE")
    print("ojos final", ojos.size)

    # ola: bottom-left cell — wave. From o-page-4 visual: bottom-left around y 0.55-0.78, x 0.08-0.35
    # First pipeline had wave + neighbors; need only wave inside its green box
    ola_raw = o4.crop((int(0.10 * W), int(0.56 * H), int(0.34 * W), int(0.78 * H)))
    ola_raw.save(QA / "ola-raw-cell.png")
    iw, ih = ola_raw.size
    # inset to drop green frame and diagonal line to center
    ola = ola_raw.crop((int(iw * 0.10), int(ih * 0.10), int(iw * 0.90), int(ih * 0.90)))
    ola = trim_white(ola, pad=3)
    # if still has top neighbor fragment, keep lower 85%
    if ola.height > 50:
        # check top 15% for thin box lines only vs content
        ola = trim_white(ola.crop((0, int(ola.height * 0.05), ola.width, ola.height)), pad=2)
    save_webp(ola, COLOR / "ola.webp")
    try:
        before = Image.open(ROOT / "public/cartilla/art/faithful/leccion-1/ola.webp")
    except Exception:
        before = None
    ba("ola", before, ola, "FIXED_FROM_SOURCE")
    print("ola final", ola.size)

    # abeja on a5: mid-left cell with bee. Page 1275x1650
    # From visual: bee roughly left of center Aa, y mid
    # Good full bee: need more vertical room than 0.44-0.56
    Wa, Ha = a5.size
    abeja_raw = a5.crop((int(0.08 * Wa), int(0.38 * Ha), int(0.36 * Wa), int(0.62 * Ha)))
    abeja_raw.save(QA / "abeja-raw-cell.png")
    iw, ih = abeja_raw.size
    abeja = abeja_raw.crop((int(iw * 0.08), int(ih * 0.08), int(iw * 0.92), int(ih * 0.92)))
    abeja = trim_white(abeja, pad=3)
    # drop left teal wave if any
    rw, rh = abeja.size
    left = abeja.crop((0, 0, max(1, int(rw * 0.08)), rh))
    lpx = list(left.resize((10, 40)).getdata())
    teal_left = sum(1 for r, g, b in lpx if g > 100 and b > 80 and r < 120) / max(1, len(lpx))
    if teal_left > 0.3:
        abeja = trim_white(abeja.crop((int(rw * 0.08), 0, rw, rh)), pad=2)
    save_webp(abeja, COLOR / "abeja.webp")
    try:
        before = Image.open(ROOT / "public/cartilla/art/faithful/vocal-a/abeja.webp")
    except Exception:
        before = None
    ba("abeja", before, abeja, "FIXED_FROM_SOURCE")
    print("abeja final", abeja.size)

    # Write palettes for colored ones
    for slug in ("ojos",):
        im = Image.open(COLOR / f"{slug}.webp").convert("RGB")
        small = im.copy()
        small.thumbnail((100, 100))
        q = small.quantize(colors=6, method=Image.Quantize.MEDIANCUT)
        pal = q.getpalette() or []
        from collections import Counter

        counts = Counter(list(q.getdata()))
        colors = []
        for idx, c in counts.most_common(6):
            r, g, b = pal[idx * 3 : idx * 3 + 3]
            if r > 250 and g > 250 and b > 250:
                continue
            colors.append({"rgb": [r, g, b], "hex": f"#{r:02x}{g:02x}{b:02x}", "weight": c})
        (PALETTE / f"{slug}.json").write_text(
            json.dumps({"slug": slug, "method": "final-tight", "colors": colors}, indent=2), encoding="utf-8"
        )

    print("OK")


if __name__ == "__main__":
    main()
