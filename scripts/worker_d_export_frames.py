#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "generated" / "art-repair-qa"
COLOR = ROOT / "public" / "cartilla" / "art" / "color" / "workbook"

o4 = Image.open(ROOT / "public/cartilla/images/source/o/o-page-4.jpg").convert("RGB")
a5 = Image.open(ROOT / "public/cartilla/images/source/a/a-page-5.jpg").convert("RGB")


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


def crop_frame(im, box, inset=6):
    x, y, w, h = box
    return im.crop((x + inset, y + inset, x + w - inset, y + h - inset))


def drop_bottom_line(im):
    w, h = im.size
    px = im.load()

    def is_teal(r, g, b):
        return g > 90 and b > 80 and r < 120 and g > r + 30

    cut = h
    for y in range(h - 1, max(0, h - 40), -1):
        teal = sum(1 for x in range(w) if is_teal(*px[x, y]))
        ink = sum(1 for x in range(w) if (px[x, y][0] < 245 or px[x, y][1] < 245 or px[x, y][2] < 245))
        if teal > w * 0.25:
            cut = y
        elif ink > w * 0.05:
            break
    if cut < h - 2:
        im = im.crop((0, 0, w, cut))
    return trim(im, 2)


ojos = drop_bottom_line(crop_frame(o4, (772, 402, 240, 360), 6))
ola = drop_bottom_line(crop_frame(o4, (46, 995, 225, 355), 6))
abeja = drop_bottom_line(crop_frame(a5, (265, 768, 200, 370), 6))

for slug, im in [("ojos", ojos), ("ola", ola), ("abeja", abeja)]:
    im.convert("RGB").save(COLOR / f"{slug}.webp", "WEBP", quality=92, method=6)
    im.save(QA / f"{slug}-frame-final.png")
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

print("ok")
