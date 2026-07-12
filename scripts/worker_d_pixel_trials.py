#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "generated" / "art-repair-qa"
COLOR = ROOT / "public" / "cartilla" / "art" / "color" / "workbook"
QA.mkdir(parents=True, exist_ok=True)

o4 = Image.open(ROOT / "public/cartilla/images/source/o/o-page-4.jpg").convert("RGB")
a5 = Image.open(ROOT / "public/cartilla/images/source/a/a-page-5.jpg").convert("RGB")
print("o4", o4.size, "a5", a5.size)


def trim(im, pad=2):
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r < 248 or g < 248 or b < 248:
                found = True
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if not found:
        return im
    return im.crop((max(0, minx - pad), max(0, miny - pad), min(w, maxx + 1 + pad), min(h, maxy + 1 + pad)))


def save_webp(im, path):
    im.convert("RGB").save(path, "WEBP", quality=92, method=6)


# Sweep ola (wave bottom-left)
ola_boxes = [
    (140, 980, 400, 1280),
    (150, 1000, 390, 1260),
    (160, 1020, 380, 1250),
    (170, 1030, 370, 1240),
    (145, 1010, 385, 1270),
    (200, 1050, 360, 1230),
]
for i, box in enumerate(ola_boxes):
    c = o4.crop(box)
    c.save(QA / f"ola-px-{i}.png")
    print("ola", i, box, c.size)

# Sweep abeja
abeja_boxes = [
    (140, 700, 420, 1000),
    (160, 720, 400, 980),
    (180, 740, 390, 970),
    (150, 710, 410, 1000),
    (170, 730, 400, 990),
    (190, 750, 385, 960),
]
for i, box in enumerate(abeja_boxes):
    c = a5.crop(box)
    c.save(QA / f"abeja-px-{i}.png")
    print("abeja", i, box, c.size)

# Sweep ojos - both eyes, minimal frame
ojos_boxes = [
    (820, 340, 1100, 520),
    (830, 360, 1080, 510),
    (800, 320, 1120, 530),
    (840, 370, 1070, 500),
    (810, 350, 1090, 515),
]
for i, box in enumerate(ojos_boxes):
    c = o4.crop(box)
    c.save(QA / f"ojos-px-{i}.png")
    print("ojos", i, box, c.size)

# Pick best by visual content heuristics and export finals
# ola: prefer box with wave content concentrated, less diagonal line
# Use ola box index 5 as starting (more inset), verify files exist then export several

# Based on layout: wave illustration fills lower-left cell interior
# Export best candidates as final after visual pick defaults:
# Prefer more inset crops

ola = trim(o4.crop((175, 1045, 365, 1235)), pad=2)
abeja = trim(a5.crop((185, 755, 380, 955)), pad=2)
ojos = trim(o4.crop((835, 365, 1075, 505)), pad=2)

save_webp(ola, COLOR / "ola.webp")
save_webp(abeja, COLOR / "abeja.webp")
save_webp(ojos, COLOR / "ojos.webp")
ola.save(QA / "ola-final-pick.png")
abeja.save(QA / "abeja-final-pick.png")
ojos.save(QA / "ojos-final-pick.png")
print("exported finals", ola.size, abeja.size, ojos.size)

# before/after for QA
for slug, before_path, after in [
    ("ola", ROOT / "public/cartilla/art/faithful/leccion-1/ola.webp", ola),
    ("abeja", ROOT / "public/cartilla/art/faithful/vocal-a/abeja.webp", abeja),
    ("ojos", ROOT / "public/cartilla/art/faithful/vocal-o/ojos.webp", ojos),
]:
    tiles = []
    try:
        b = Image.open(before_path).convert("RGBA")
        b.thumbnail((300, 300))
        tiles.append(("BEFORE", b))
    except Exception:
        pass
    a = after.convert("RGBA")
    a.thumbnail((300, 300))
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
    draw.text((pad, height - lh + 4), f"{slug}: FIXED_FROM_SOURCE", fill=(20, 80, 40))
    canvas.save(QA / f"{slug}-before-after.png")

print("done")
