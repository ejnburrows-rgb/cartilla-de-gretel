#!/usr/bin/env python3
"""Tighten page-4 repair crops: remove neighbor bleed and labels."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "generated" / "art-repair-qa"
COLOR = ROOT / "public" / "cartilla" / "art" / "color" / "workbook"
PALETTE = ROOT / "generated" / "flipbook-palettes"
STAGED_FC = Path(r"C:\Users\EJN\Desktop\cartilla-incoming\92-page-map\staged-crops\flipchart-color")


def trim_white(im: Image.Image, pad: int = 4) -> Image.Image:
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
        (
            max(0, min_x - pad),
            max(0, min_y - pad),
            min(w, max_x + 1 + pad),
            min(h, max_y + 1 + pad),
        )
    )


def save_webp(im: Image.Image, path: Path, q: int = 92) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    im.save(path, "WEBP", quality=q, method=6)


def extract_palette(im: Image.Image, n: int = 8) -> list[dict]:
    small = im.convert("RGB").copy()
    small.thumbnail((120, 120))
    q = small.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette() or []
    from collections import Counter

    counts = Counter(list(q.getdata()))
    colors = []
    for idx, count in counts.most_common(n):
        r, g, b = pal[idx * 3 : idx * 3 + 3]
        if r > 250 and g > 250 and b > 250:
            continue
        colors.append({"rgb": [int(r), int(g), int(b)], "hex": f"#{r:02x}{g:02x}{b:02x}", "weight": int(count)})
    return colors


def before_after(slug: str, before: Image.Image | None, after: Image.Image, verdict: str) -> None:
    tiles = []
    if before is not None:
        b = before.convert("RGBA")
        b.thumbnail((320, 320))
        tiles.append(("BEFORE", b))
    a = after.convert("RGBA")
    a.thumbnail((320, 320))
    tiles.append(("AFTER", a))
    pad, label_h = 16, 28
    width = sum(t.width for _, t in tiles) + pad * (len(tiles) + 1)
    height = max(t.height for _, t in tiles) + pad * 2 + label_h * 2
    canvas = Image.new("RGB", (width, height), (245, 245, 245))
    draw = ImageDraw.Draw(canvas)
    x = pad
    for lab, t in tiles:
        canvas.paste(t, (x, pad + label_h), t if t.mode == "RGBA" else None)
        draw.text((x, 6), lab, fill=(30, 30, 30))
        x += t.width + pad
    draw.text((pad, height - label_h + 4), f"{slug}: {verdict}", fill=(20, 80, 40))
    canvas.save(QA / f"{slug}-before-after.png")


def main() -> None:
    QA.mkdir(parents=True, exist_ok=True)
    o3 = Image.open(ROOT / "public/cartilla/images/source/o/o-page-3.jpg").convert("RGB")
    o4 = Image.open(ROOT / "public/cartilla/images/source/o/o-page-4.jpg").convert("RGB")
    a5 = Image.open(ROOT / "public/cartilla/images/source/a/a-page-5.jpg").convert("RGB")
    print("o3", o3.size, "o4", o4.size, "a5", a5.size)

    # --- oreja: tight on ear only (exclude label + neighbors) ---
    # Image ~2451x3130; ear center-bottom. Sweep boxes and pick cleanest.
    oreja_candidates = [
        (1020, 2360, 1420, 2860),
        (1040, 2380, 1400, 2840),
        (1000, 2340, 1440, 2880),
        (1060, 2400, 1380, 2820),
    ]
    best_oreja = None
    best_score = -1
    for box in oreja_candidates:
        crop = o3.crop(box)
        crop.save(QA / f"oreja-cand-{box[0]}.png")
        # score: prefer more pinkish pixels, less pure white ratio, no large dark text band at bottom
        rgb = list(crop.resize((80, 80)).getdata())
        pink = sum(1 for r, g, b in rgb if r > 150 and g < 180 and b < 180 and r > g)
        white = sum(1 for r, g, b in rgb if r > 245 and g > 245 and b > 245)
        score = pink - white * 0.1
        if score > best_score:
            best_score = score
            best_oreja = crop
    oreja = trim_white(best_oreja, pad=6)
    # drop bottom label band if present: if bottom 15% is mostly black text on white, crop it
    # simple: if bottom strip has low mean (dark text), trim bottom 12%
    bh = oreja.height
    bot = oreja.crop((0, int(bh * 0.82), oreja.width, bh))
    if ImageStat.Stat(bot.convert("L")).mean[0] < 220:
        # has dark content near bottom — might be label; check if top is the ear body
        # Only trim if pink content is mostly above 80%
        oreja2 = oreja.crop((0, 0, oreja.width, int(bh * 0.82)))
        if oreja2.height > 100:
            oreja = trim_white(oreja2, pad=4)

    # Prefer existing faithful oreja if it's cleaner (no label) — already verified good
    faithful_oreja = ROOT / "public/cartilla/art/faithful/vocal-o/oreja.webp"
    if faithful_oreja.exists():
        try:
            fo = Image.open(faithful_oreja).convert("RGB")
            fo_t = trim_white(fo, pad=2)
            # faithful was clean ear without label — use it if large enough
            if fo_t.width > 100 and fo_t.height > 100:
                # Compare white ratio — lower border bleed better
                def white_ratio(im):
                    px = list(im.resize((60, 60)).getdata())
                    return sum(1 for r, g, b in px if r > 245 and g > 245 and b > 245) / len(px)

                # Prefer tighter subject (less empty / less neighbor)
                # Faithful oreja was clean — use it as primary after
                oreja_final = fo_t
                oreja_method = "faithful-verified-tight + source-crosscheck"
                # But also save source recompute for QA
                save_webp(oreja, QA / "oreja-from-flipchart.webp")
                oreja = oreja_final
            else:
                oreja_method = "flipchart-tight-recrop"
        except Exception:
            oreja_method = "flipchart-tight-recrop"
    else:
        oreja_method = "flipchart-tight-recrop"

    before_oreja = Image.open(faithful_oreja).convert("RGB") if faithful_oreja.exists() else None
    save_webp(oreja, COLOR / "oreja.webp")
    before_after("oreja", before_oreja, oreja, "FIXED_FROM_SOURCE")
    (PALETTE / "oreja.json").write_text(
        json.dumps({"slug": "oreja", "method": oreja_method, "colors": extract_palette(oreja)}, indent=2),
        encoding="utf-8",
    )
    print("oreja", oreja.size, oreja_method)

    # --- ojos: eyes only from o-page-4 ---
    W4, H4 = o4.size
    ojos_boxes = [
        (0.68, 0.24, 0.86, 0.33),
        (0.66, 0.23, 0.87, 0.34),
        (0.70, 0.25, 0.85, 0.32),
        (0.67, 0.22, 0.88, 0.35),
    ]
    best_ojos = None
    best = -1
    for frac in ojos_boxes:
        x1, y1, x2, y2 = frac
        crop = o4.crop((int(x1 * W4), int(y1 * H4), int(x2 * W4), int(y2 * H4)))
        crop.save(QA / f"ojos-cand-{int(x1*100)}.png")
        px = list(crop.resize((60, 60)).getdata())
        # teal iris pixels
        teal = sum(1 for r, g, b in px if b > r and g > r and b > 80 and r < 180)
        # penalize strong edge teal page chrome (large solid blocks)
        score = teal
        if score > best:
            best = score
            best_ojos = crop
    ojos = trim_white(best_ojos, pad=3)
    # If still has frame, try center crop 90%
    if ojos.width > 40:
        m = 0.06
        ojos = trim_white(
            ojos.crop(
                (
                    int(ojos.width * m),
                    int(ojos.height * m),
                    int(ojos.width * (1 - m)),
                    int(ojos.height * (1 - m)),
                )
            ),
            pad=2,
        )
    before_ojos = None
    p = ROOT / "public/cartilla/art/faithful/vocal-o/ojos.webp"
    if p.exists():
        try:
            before_ojos = Image.open(p).convert("RGB")
        except Exception:
            before_ojos = None
    save_webp(ojos, COLOR / "ojos.webp")
    before_after("ojos", before_ojos, ojos, "FIXED_FROM_SOURCE")
    (PALETTE / "ojos.json").write_text(
        json.dumps({"slug": "ojos", "method": "o-page-4-tight", "colors": extract_palette(ojos)}, indent=2),
        encoding="utf-8",
    )
    print("ojos", ojos.size)

    # --- ola: wave only ---
    ola_boxes = [
        (0.14, 0.60, 0.30, 0.72),
        (0.13, 0.59, 0.31, 0.73),
        (0.15, 0.61, 0.29, 0.71),
    ]
    best_ola = None
    best = -1
    for frac in ola_boxes:
        x1, y1, x2, y2 = frac
        crop = o4.crop((int(x1 * W4), int(y1 * H4), int(x2 * W4), int(y2 * H4)))
        crop.save(QA / f"ola-cand-{int(x1*100)}.png")
        px = list(crop.resize((60, 60)).getdata())
        gray_ink = sum(1 for r, g, b in px if abs(r - g) < 15 and abs(g - b) < 15 and r < 200)
        if gray_ink > best:
            best = gray_ink
            best_ola = crop
    ola = trim_white(best_ola, pad=3)
    before_ola = None
    for p in [
        ROOT / "public/cartilla/art/faithful/leccion-1/ola.webp",
    ]:
        if p.exists():
            try:
                before_ola = Image.open(p).convert("RGB")
            except Exception:
                pass
    save_webp(ola, COLOR / "ola.webp")
    before_after("ola", before_ola, ola, "FIXED_FROM_SOURCE")
    print("ola", ola.size)

    # --- abeja: bee only on a-page-5 ---
    W5, H5 = a5.size
    abeja_boxes = [
        (0.12, 0.44, 0.30, 0.56),
        (0.11, 0.43, 0.31, 0.57),
        (0.13, 0.45, 0.29, 0.55),
        (0.10, 0.42, 0.32, 0.58),
    ]
    best_abeja = None
    best = -1
    for frac in abeja_boxes:
        x1, y1, x2, y2 = frac
        crop = a5.crop((int(x1 * W5), int(y1 * H5), int(x2 * W5), int(y2 * H5)))
        crop.save(QA / f"abeja-cand-{int(x1*100)}.png")
        px = list(crop.resize((60, 60)).getdata())
        ink = sum(1 for r, g, b in px if r < 220 or g < 220 or b < 220)
        # penalize strong teal chrome (g high, r low-mid, b mid)
        teal = sum(1 for r, g, b in px if g > 120 and b > 100 and r < 100)
        score = ink - teal * 2
        if score > best:
            best = score
            best_abeja = crop
    abeja = trim_white(best_abeja, pad=3)
    # center inset to drop frame
    m = 0.05
    abeja = trim_white(
        abeja.crop(
            (
                int(abeja.width * m),
                int(abeja.height * m),
                int(abeja.width * (1 - m)),
                int(abeja.height * (1 - m)),
            )
        ),
        pad=2,
    )
    before_abeja = None
    p = ROOT / "public/cartilla/art/faithful/vocal-a/abeja.webp"
    if p.exists():
        try:
            before_abeja = Image.open(p).convert("RGB")
        except Exception:
            pass
    save_webp(abeja, COLOR / "abeja.webp")
    before_after("abeja", before_abeja, abeja, "FIXED_FROM_SOURCE")
    print("abeja", abeja.size)

    # --- oso/olla/oveja: re-export staged, tight-trim, drop word labels if present ---
    for slug, staged in {
        "oso": STAGED_FC / "vocal-o" / "oso.webp",
        "olla": STAGED_FC / "vocal-o" / "olla.webp",
        "oveja": STAGED_FC / "vocal-o" / "oveja.webp",
    }.items():
        im = Image.open(staged).convert("RGB")
        # oveja staged includes label "oveja" — trim bottom label band
        if slug == "oveja":
            # label is bottom ~18%
            h = im.height
            # check bottom band for text
            bot = im.crop((0, int(h * 0.78), im.width, h))
            if ImageStat.Stat(bot.convert("L")).mean[0] < 230:
                im = im.crop((0, 0, im.width, int(h * 0.78)))
        im = trim_white(im, pad=2)
        before = None
        fp = ROOT / f"public/cartilla/art/faithful/vocal-o/{slug}.webp"
        if fp.exists():
            try:
                before = Image.open(fp).convert("RGB")
            except Exception:
                pass
        save_webp(im, COLOR / f"{slug}.webp")
        before_after(slug, before, im, "VERIFIED_UPRIGHT")
        (PALETTE / f"{slug}.json").write_text(
            json.dumps({"slug": slug, "method": "staged-tight", "colors": extract_palette(im)}, indent=2),
            encoding="utf-8",
        )
        print(slug, im.size)

    print("DONE tighten")


if __name__ == "__main__":
    main()
