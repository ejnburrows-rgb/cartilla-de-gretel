"""Provenance check: compare every Flip Chart native layer with the region of the
HD sheet scan it claims to come from (src/data/flipchart-native-assets.json).

Writes JSON results plus side-by-side contact sheets. Read-only on art files.
usage: python3 scripts/image-inspection/verify-flipchart-layer-provenance.py OUT_DIR
"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs/proofs/image-inspection/flipchart-provenance")
os.makedirs(OUT, exist_ok=True)
assets = json.load(open(os.path.join(ROOT, "src/data/flipchart-native-assets.json")))
audit = json.load(open(os.path.join(ROOT, "docs/production-art-classification-audit.json")))
pending = {e["src"] for e in audit["nativeAudit"] if e["classification"] == "PENDING NO VERIFIED SOURCE"}

def gray_on_white(im):
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    return bg.convert("L")

def ncc(a, b):
    a = a - a.mean(); b = b - b.mean()
    d = np.sqrt((a * a).sum() * (b * b).sum())
    return float((a * b).sum() / d) if d else 0.0

results = []
sheets = {}
for page, entries in assets.items():
    if not isinstance(entries, list):
        continue
    scan_path = os.path.join(ROOT, f"public/cartilla/art/hd/flipchart/page-{int(page):03d}.jpg")
    if not os.path.exists(scan_path):
        continue
    scan = Image.open(scan_path).convert("L")
    scale = scan.width / 1000.0  # crops are recorded on a 1000-unit-wide sheet
    for e in entries:
        src = e["src"]
        layer_path = os.path.join(ROOT, "public" + src)
        rec = {"src": src, "page": int(page), "word": e.get("word"), "pending": src in pending, "crop": e.get("crop")}
        if not os.path.exists(layer_path) or not e.get("crop"):
            rec["verdict"] = "NO FILE OR CROP"; results.append(rec); continue
        layer = gray_on_white(Image.open(layer_path))
        x, y, w, h = e["crop"]
        small = layer.resize((96, max(8, round(96 * layer.height / layer.width))))
        la = np.asarray(small, dtype=np.float32)
        best = (-1, 0, 0)
        # search a small offset window: recorded crops can be a few points off
        for dx in range(-12, 13, 3):
            for dy in range(-12, 13, 3):
                box = [round((x + dx) * scale), round((y + dy) * scale), round((x + dx + w) * scale), round((y + dy + h) * scale)]
                reg = scan.crop(box).resize(small.size)
                s = ncc(la, np.asarray(reg, dtype=np.float32))
                if s > best[0]:
                    best = (s, dx, dy)
        s, dx, dy = best
        rec.update(score=round(s, 3), offset=[dx, dy], layerSize=list(Image.open(layer_path).size),
                   scanRegionPx=[round(w * scale), round(h * scale)])
        rec["verdict"] = "MATCHES SCAN" if s >= 0.80 else "WEAK MATCH" if s >= 0.6 else "NO MATCH"
        results.append(rec)
        # side-by-side tile for the evidence sheet
        box = [round((x + dx) * scale), round((y + dy) * scale), round((x + dx + w) * scale), round((y + dy + h) * scale)]
        reg = Image.open(scan_path).crop(box); reg.thumbnail((180, 180))
        lay = Image.open(layer_path).convert("RGBA"); lay.thumbnail((180, 180))
        tile = Image.new("RGB", (380, 210), "white")
        tile.paste(reg.convert("RGB"), (5, 5))
        bg = Image.new("RGBA", lay.size, (205, 230, 255, 255)); bg.alpha_composite(lay)
        tile.paste(bg.convert("RGB"), (195, 5))
        ImageDraw.Draw(tile).text((5, 192), f"{os.path.basename(src)}  {rec['verdict']} {s:.2f}", fill="black")
        sheets.setdefault(int(page), []).append(tile)

for page, tiles in sheets.items():
    cols = 3; rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 380, rows * 210), "white")
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % cols) * 380, (i // cols) * 210))
    sheet.save(os.path.join(OUT, f"sheet-{page:03d}.jpg"), quality=78)

json.dump(results, open(os.path.join(OUT, "provenance.json"), "w"), indent=1, ensure_ascii=False)
from collections import Counter
print(Counter((r["pending"], r["verdict"]) for r in results))
