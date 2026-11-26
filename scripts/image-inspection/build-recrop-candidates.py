"""Build owner-review recrop candidates from the HD Flip Chart scans for faithful
Workbook pictures whose current crop cuts the drawing off at an edge.

Nothing in public/ is modified: candidates and before/after comparisons go to OUT.
usage: python3 scripts/image-inspection/build-recrop-candidates.py OUT_DIR
"""
import json, os, sys
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs/proofs/image-inspection/recrop-candidates")
os.makedirs(OUT, exist_ok=True)

# current faithful file -> Flip Chart native entry that records the same drawing on an HD sheet
CANDIDATES = {
    "vocal-o/ocho.webp": "p004-ocho",
    "vocal-e/espejo.webp": "p006-espejo",
    "vocal-a/alas.webp": "p005-ala",
    "leccion-23-z/zorro.webp": "p060-zorro",
    "leccion-8-p/papa.webp": "p012-papa",
    "leccion-14-n/nino.webp": "p028-nino",
    "leccion-19-c/casa.webp": "p054-casa",
    "vocal-a/anillo.webp": "p005-anillo",
    "vocal-o/olla.webp": "p004-olla",
    "vocal-o/oreja.webp": "p004-oreja",
    "vocal-o/oso.webp": "p004-oso",
    "vocal-u/uno.webp": "p008-uno",
    "vocal-u/unicornio.webp": "p008-unicornio",
}
PAD = 0.06  # extra sheet margin around the recorded crop so nothing touches the edge
# The Workbook prints these drawings mirrored relative to the Flip Chart; the candidate keeps
# the printed Workbook orientation (checked against docs/proofs/artwork-coverage-2026-10-14/crops).
# uno/oso are NOT listed: the files in use are mirrored relative to the printed Workbook.
MIRROR_TO_WORKBOOK = {"vocal-e/espejo.webp", "vocal-a/anillo.webp", "vocal-o/oreja.webp", "vocal-u/unicornio.webp"}

assets = json.load(open(os.path.join(ROOT, "src/data/flipchart-native-assets.json")))
by_key = {}
for page, entries in assets.items():
    for e in entries if isinstance(entries, list) else []:
        by_key[os.path.splitext(os.path.basename(e["src"]))[0]] = (int(page), e)

def knock_out_paper(rgb, inner, tol=28):
    """Make only the paper connected to the border transparent (interior whites such as
    eyes stay opaque because the drawing's outline encloses them)."""
    a = np.asarray(rgb.convert("RGB")).astype(np.int16)
    h, w, _ = a.shape
    paper = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
    near = (np.abs(a - paper).max(axis=2) <= tol)
    seen = np.zeros((h, w), bool)
    q = deque([(y, x) for x in range(w) for y in (0, h - 1)] + [(y, x) for y in range(h) for x in (0, w - 1)])
    while q:
        y, x = q.popleft()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or not near[y, x]:
            continue
        seen[y, x] = True
        q.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    alpha = np.where(seen, 0, 255).astype(np.uint8)
    alpha = drop_edge_fragments(alpha, inner)
    out = np.dstack([a.astype(np.uint8), alpha])
    return Image.fromarray(out, "RGBA")

def drop_edge_fragments(alpha, inner):
    """Remove opaque islands that touch the crop border (neighbouring printed words or
    scenery cut by the box) and dust specks under 30 px; the padded drawing never touches it."""
    h, w = alpha.shape
    label = np.zeros((h, w), np.int32)
    keep = np.zeros((h, w), bool)
    n = 0
    for sy, sx in zip(*np.nonzero(alpha)):
        if label[sy, sx]:
            continue
        n += 1
        comp, q, edge = [], deque([(sy, sx)]), False
        label[sy, sx] = n
        while q:
            y, x = q.popleft()
            comp.append((y, x))
            if y in (0, h - 1) or x in (0, w - 1):
                edge = True
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and alpha[ny, nx] and not label[ny, nx]:
                    label[ny, nx] = n
                    q.append((ny, nx))
        ys, xs = zip(*comp)
        cy, cx = sum(ys) / len(ys), sum(xs) / len(xs)
        inside = inner[0] <= cx <= inner[2] and inner[1] <= cy <= inner[3]
        if not edge and inside and len(comp) >= 30:
            ys, xs = zip(*comp)
            keep[list(ys), list(xs)] = True
    return np.where(keep, 255, 0).astype(np.uint8)

def on_blue(im, size):
    im = im.convert("RGBA").copy(); im.thumbnail(size)
    bg = Image.new("RGBA", im.size, (205, 230, 255, 255)); bg.alpha_composite(im)
    return bg.convert("RGB")

report = []
for current, key in CANDIDATES.items():
    cur_path = os.path.join(ROOT, "public/cartilla/art/faithful", current)
    if key not in by_key:
        report.append({"current": current, "status": "NO HD SOURCE ENTRY", "key": key}); continue
    page, e = by_key[key]
    scan = Image.open(os.path.join(ROOT, f"public/cartilla/art/hd/flipchart/page-{page:03d}.jpg")).convert("RGB")
    s = scan.width / 1000.0
    x, y, w, h = e["crop"]
    px, py = w * PAD, h * PAD
    box = [max(0, round((x - px) * s)), max(0, round((y - py) * s)),
           min(scan.width, round((x + w + px) * s)), min(scan.height, round((y + h + py) * s))]
    region = scan.crop(box)
    inner = [round((x * s) - box[0]), round((y * s) - box[1]), round(((x + w) * s) - box[0]), round(((y + h) * s) - box[1])]
    cand = knock_out_paper(region, inner)
    if current in MIRROR_TO_WORKBOOK:
        cand = ImageOps.mirror(cand)
    name = os.path.basename(current).replace(".webp", "")
    cand_path = os.path.join(OUT, f"{name}-candidate.webp")
    cand.save(cand_path, "WEBP", quality=92, method=6)
    cur = Image.open(cur_path)
    # before | after | source context, captioned
    tile = Image.new("RGB", (3 * 330, 380), "white")
    tile.paste(on_blue(cur, (320, 320)), (5, 30))
    tile.paste(on_blue(cand, (320, 320)), (335, 30))
    ctx = scan.crop([max(0, box[0] - 120), max(0, box[1] - 120), min(scan.width, box[2] + 120), min(scan.height, box[3] + 120)])
    ctx.thumbnail((320, 320)); d0 = ImageDraw.Draw(tile)
    tile.paste(ctx, (665, 30))
    d0.text((5, 8), f"BEFORE (in use) {current} {cur.size[0]}x{cur.size[1]}", fill="black")
    d0.text((335, 8), f"CANDIDATE {cand.size[0]}x{cand.size[1]} (HD sheet {page})", fill="black")
    d0.text((665, 8), f"Source: Flip Chart page-{page:03d}.jpg", fill="black")
    d0.text((5, 358), "Blue = transparent. Candidate = same drawing, uncut, from the HD scan; paper removed.", fill="black")
    tile.save(os.path.join(OUT, f"{name}-before-after.jpg"), quality=85)
    report.append({"current": "/cartilla/art/faithful/" + current, "currentSize": list(cur.size),
                   "candidate": os.path.relpath(cand_path, ROOT), "candidateSize": list(cand.size),
                   "source": f"public/cartilla/art/hd/flipchart/page-{page:03d}.jpg", "sourceBoxPx": box,
                   "orientation": "mirrored to printed Workbook orientation" if current in MIRROR_TO_WORKBOOK else "as printed",
                   "status": "AWAITING OWNER APPROVAL — not swapped"})
json.dump(report, open(os.path.join(OUT, "candidates.json"), "w"), indent=1)

# igual has no HD source; the only allowed path is a resolution-only upscale of the exact
# Workbook crop (two solid bars), shown for approval like the recrops above.
from PIL import ImageFilter
cur_path = os.path.join(ROOT, "public/cartilla/art/faithful/vocal-i/igual.webp")
cur = Image.open(cur_path).convert("RGBA")
up = cur.resize((cur.width * 4, cur.height * 4), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=2))
up_path = os.path.join(OUT, "igual-candidate.webp")
up.save(up_path, "WEBP", quality=95, method=6)
tile = Image.new("RGB", (900, 300), "white"); dd = ImageDraw.Draw(tile)
before = cur.resize((424, 244), Image.BILINEAR)  # how the browser enlarges it on a projector
tile.paste(on_blue(before, (424, 244)), (5, 30)); tile.paste(on_blue(up, (424, 244)), (460, 30))
dd.text((5, 8), f"BEFORE as enlarged on projector (file {cur.width}x{cur.height})", fill="black")
dd.text((460, 8), f"CANDIDATE resolution-only {up.width}x{up.height}", fill="black")
tile.save(os.path.join(OUT, "igual-before-after.jpg"), quality=88)
report.append({"current": "/cartilla/art/faithful/vocal-i/igual.webp", "currentSize": list(cur.size),
               "candidate": os.path.relpath(up_path, ROOT), "candidateSize": list(up.size),
               "source": "same file, 4x Lanczos resolution-only (no HD source exists)",
               "status": "AWAITING OWNER APPROVAL — not swapped"})
json.dump(report, open(os.path.join(OUT, "candidates.json"), "w"), indent=1)
for r in report: print(r["current"], r["status"], r.get("candidateSize"))
