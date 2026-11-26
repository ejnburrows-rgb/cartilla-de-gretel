"""File-level check: does the drawing touch the edge of its own image (a cut-off crop)?
Reads the unique picture paths from inspection-results.csv. Writes edge-touch.json.
usage: python3 scripts/image-inspection/check-crop-edges.py PROOF_DIR"""
import csv, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
P = sys.argv[1]
srcs = sorted({r["src"].split("?")[0] for r in csv.DictReader(open(os.path.join(P, "inspection-results.csv")))
               if r["src"].startswith("/") and r["surface"] in ("workbook", "flipchart")})

def ink(im):
    a = np.asarray(im.convert("RGBA")).astype(np.int16)
    return (a[..., 3] > 24) & (a[..., :3].min(axis=2) < 225)

out = []
for s in srcs:
    path = os.path.join(ROOT, "public" + s)
    if not os.path.exists(path) or s.endswith(".svg"):
        continue
    m = ink(Image.open(path))
    h, w = m.shape
    sides = {"top": m[0].mean(), "bottom": m[-1].mean(), "left": m[:, 0].mean(), "right": m[:, -1].mean()}
    touching = {k: round(float(v), 3) for k, v in sides.items() if v > 0.04}
    if touching:
        out.append({"src": s, "size": [w, h], "inkOnEdge": touching})
json.dump(out, open(os.path.join(P, "edge-touch.json"), "w"), indent=1)
print(len(srcs), "pictures checked;", len(out), "touch an edge")
for o in out:
    print(o["src"], o["inkOnEdge"])
