#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "generated" / "art-repair-qa"
COLOR = ROOT / "public" / "cartilla" / "art" / "color" / "workbook"

o4 = Image.open(ROOT / "public/cartilla/images/source/o/o-page-4.jpg").convert("RGB")
a5 = Image.open(ROOT / "public/cartilla/images/source/a/a-page-5.jpg").convert("RGB")


def is_teal(r, g, b):
    return g > 90 and b > 80 and r < 130 and g > r + 25


def trim(im, pad=2):
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            # ignore pure teal frame lines for bbox of subject? keep for now
            if r < 248 or g < 248 or b < 248:
                found = True
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if not found:
        return im
    return im.crop((max(0, minx - pad), max(0, miny - pad), min(w, maxx + 1 + pad), min(h, maxy + 1 + pad)))


def remove_teal_rows(im, max_frac=0.15):
    """Remove horizontal rows that are mostly teal frame lines."""
    w, h = im.size
    px = im.load()
    keep = []
    for y in range(h):
        teal = sum(1 for x in range(w) if is_teal(*px[x, y]))
        # A thin frame line: high teal fraction, low other content diversity
        if teal > w * 0.35:
            continue
        keep.append(y)
    if not keep:
        return im
    # rebuild by cropping continuous span of keep
    top, bot = keep[0], keep[-1]
    # also drop large empty white bands at ends already handled by trim
    return im.crop((0, top, w, bot + 1))


def content_bbox_ignore_teal(im, pad=3):
    w, h = im.size
    px = im.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if is_teal(r, g, b):
                continue
            if r < 248 or g < 248 or b < 248:
                found = True
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if not found:
        return im
    return im.crop(
        (max(0, minx - pad), max(0, miny - pad), min(w, maxx + 1 + pad), min(h, maxy + 1 + pad))
    )


# Precise boxes from frame detector, then clean
# ojos: (772,402,240,360) interior - eyes are upper portion
ojos = o4.crop((778, 408, 778 + 228, 408 + 200))  # tighter height to eyes only
ojos = content_bbox_ignore_teal(remove_teal_rows(ojos), pad=4)

# ola: frame 4 (46,995,225,355) - wave is bottom portion of that cell
# From o4-frame-4, wave sits in lower half below a teal divider artifact
ola = o4.crop((52, 1100, 52 + 213, 1100 + 240))
ola = content_bbox_ignore_teal(remove_teal_rows(ola), pad=4)

# abeja: (265,768,200,370)
abeja = a5.crop((271, 774, 271 + 188, 774 + 250))
abeja = content_bbox_ignore_teal(remove_teal_rows(abeja), pad=4)

for slug, im in [("ojos", ojos), ("ola", ola), ("abeja", abeja)]:
    im.convert("RGB").save(COLOR / f"{slug}.webp", "WEBP", quality=92, method=6)
    im.save(QA / f"{slug}-clean.png")
    print(slug, im.size)

for slug, bp in [
    ("ojos", ROOT / "public/cartilla/art/faithful/vocal-o/ojos.webp"),
    ("ola", ROOT / "public/cartilla/art/faithful/leccion-1/ola.webp"),
    ("abeja", ROOT / "public/cartilla/art/faithful/vocal-a/abeja.webp"),
]:
    after = Image.open(COLOR / f"{slug}.webp").convert("RGBA")
    after.thumbnail((300, 300))
    tiles = [("AFTER", after)]
    try:
        b = Image.open(bp).convert("RGBA")
        b.thumbnail((300, 300))
        tiles = [("BEFORE", b), ("AFTER", after)]
    except Exception:
        pass
    pad, lh = 16, 28
    width = sum(t.width for _, t in tiles) + pad * (len(tiles) + 1)
    height = max(t.height for _, t in tiles) + pad * 2 + lh * 2
    canvas = Image.new("RGB", (width, height), (245, 245, 245))
    d = ImageDraw.Draw(canvas)
    x = pad
    for lab, t in tiles:
        canvas.paste(t, (x, pad + lh), t)
        d.text((x, 6), lab, fill=(0, 0, 0))
        x += t.width + pad
    d.text((pad, height - lh + 4), f"{slug}: FIXED_FROM_SOURCE", fill=(20, 80, 40))
    canvas.save(QA / f"{slug}-before-after.png")

print("clean ok")
