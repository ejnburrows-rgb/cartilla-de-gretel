#!/usr/bin/env python3
"""
Extract illustration content from inside teal rectangular frames on exercise pages.
Also finalize ojos/ola/abeja color assets.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "generated" / "art-repair-qa"
COLOR = ROOT / "public" / "cartilla" / "art" / "color" / "workbook"


def is_teal(r, g, b) -> bool:
    # book teal frame ~ (0-80, 120-180, 120-180)
    return g > 90 and b > 80 and r < 120 and g > r + 30 and b > r + 20


def is_ink(r, g, b) -> bool:
    return r < 245 or g < 245 or b < 245


def find_frames(im: Image.Image, min_w: int = 80, min_h: int = 80) -> list[tuple[int, int, int, int]]:
    """Find axis-aligned teal rectangular frames via horizontal/vertical teal run detection."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    # Mark teal pixels
    teal = [[is_teal(*px[x, y]) for x in range(w)] for y in range(h)]

    # Find horizontal teal segments of length >= min_w
    h_segs = []  # (y, x1, x2)
    for y in range(h):
        x = 0
        while x < w:
            if not teal[y][x]:
                x += 1
                continue
            x0 = x
            while x < w and teal[y][x]:
                x += 1
            if x - x0 >= min_w:
                h_segs.append((y, x0, x - 1))

    # Group into top/bottom pairs forming frames
    frames = []
    # For each pair of horizontal segs with similar x-range and sufficient vertical gap
    for i, (y1, a1, a2) in enumerate(h_segs):
        for y2, b1, b2 in h_segs[i + 1 :]:
            if y2 - y1 < min_h:
                continue
            if y2 - y1 > min(h * 0.5, 400):
                break
            # x-range overlap
            left = max(a1, b1)
            right = min(a2, b2)
            if right - left < min_w:
                continue
            # check vertical teal sides roughly present
            side_hits = 0
            for yy in range(y1, y2 + 1, max(1, (y2 - y1) // 10)):
                if teal[yy][left] or (left + 1 < w and teal[yy][min(w - 1, left + 2)]):
                    side_hits += 1
                if teal[yy][right] or (right - 1 >= 0 and teal[yy][max(0, right - 2)]):
                    side_hits += 1
            if side_hits < 4:
                continue
            # interior content?
            frames.append((left, y1, right - left + 1, y2 - y1 + 1))
    # dedupe similar
    frames.sort(key=lambda f: f[2] * f[3], reverse=True)
    cleaned = []
    for f in frames:
        x, y, fw, fh = f
        overlap = False
        for cx, cy, cw, ch in cleaned:
            # IoU-ish
            ix1, iy1 = max(x, cx), max(y, cy)
            ix2, iy2 = min(x + fw, cx + cw), min(y + fh, cy + ch)
            if ix2 > ix1 and iy2 > iy1:
                inter = (ix2 - ix1) * (iy2 - iy1)
                if inter > 0.5 * fw * fh:
                    overlap = True
                    break
        if not overlap:
            cleaned.append(f)
    return cleaned


def interior_crop(im: Image.Image, frame: tuple[int, int, int, int], inset: int = 4) -> Image.Image:
    x, y, w, h = frame
    return im.crop((x + inset, y + inset, x + w - inset, y + h - inset))


def trim_white(im: Image.Image, pad: int = 2) -> Image.Image:
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


def save_webp(im: Image.Image, path: Path) -> None:
    im.convert("RGB").save(path, "WEBP", quality=92, method=6)


def ba(slug, before_path, after):
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


def main():
    o4 = Image.open(ROOT / "public/cartilla/images/source/o/o-page-4.jpg").convert("RGB")
    a5 = Image.open(ROOT / "public/cartilla/images/source/a/a-page-5.jpg").convert("RGB")
    print("sizes", o4.size, a5.size)

    frames_o4 = find_frames(o4, min_w=70, min_h=70)
    frames_a5 = find_frames(a5, min_w=70, min_h=70)
    print("o4 frames", len(frames_o4))
    for i, f in enumerate(frames_o4[:12]):
        print(" ", i, f)
        interior_crop(o4, f, 5).save(QA / f"o4-frame-{i}.png")
    print("a5 frames", len(frames_a5))
    for i, f in enumerate(frames_a5[:12]):
        print(" ", i, f)
        interior_crop(a5, f, 5).save(QA / f"a5-frame-{i}.png")

    # Classify o4 frames by position for ojos (top-right), ola (bottom-left)
    W, H = o4.size
    ojos_f = None
    ola_f = None
    for f in frames_o4:
        x, y, w, h = f
        cx, cy = x + w / 2, y + h / 2
        if cx > W * 0.55 and cy < H * 0.40:
            # top-right region -> ojos
            if ojos_f is None or w * h > ojos_f[2] * ojos_f[3]:
                ojos_f = f
        if cx < W * 0.40 and cy > H * 0.55:
            if ola_f is None or w * h > ola_f[2] * ola_f[3]:
                ola_f = f

    Wa, Ha = a5.size
    abeja_f = None
    for f in frames_a5:
        x, y, w, h = f
        cx, cy = x + w / 2, y + h / 2
        # mid-left
        if cx < Wa * 0.40 and Ha * 0.35 < cy < Ha * 0.65:
            if abeja_f is None or w * h > abeja_f[2] * abeja_f[3]:
                abeja_f = f

    print("selected ojos", ojos_f, "ola", ola_f, "abeja", abeja_f)

    if ojos_f:
        ojos = trim_white(interior_crop(o4, ojos_f, 6), pad=2)
        save_webp(ojos, COLOR / "ojos.webp")
        ojos.save(QA / "ojos-frame-final.png")
        ba("ojos", ROOT / "public/cartilla/art/faithful/vocal-o/ojos.webp", ojos)
        print("ojos", ojos.size)
    if ola_f:
        ola = trim_white(interior_crop(o4, ola_f, 6), pad=2)
        save_webp(ola, COLOR / "ola.webp")
        ola.save(QA / "ola-frame-final.png")
        ba("ola", ROOT / "public/cartilla/art/faithful/leccion-1/ola.webp", ola)
        print("ola", ola.size)
    if abeja_f:
        abeja = trim_white(interior_crop(a5, abeja_f, 6), pad=2)
        save_webp(abeja, COLOR / "abeja.webp")
        abeja.save(QA / "abeja-frame-final.png")
        ba("abeja", ROOT / "public/cartilla/art/faithful/vocal-a/abeja.webp", abeja)
        print("abeja", abeja.size)

    # Fallback if frame detect failed
    if not ojos_f:
        print("FALLBACK ojos")
    if not ola_f:
        print("FALLBACK ola")
    if not abeja_f:
        print("FALLBACK abeja")

    print("done")


if __name__ == "__main__":
    main()
