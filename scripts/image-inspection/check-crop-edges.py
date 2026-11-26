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
    ys, xs = np.nonzero(m)
    if not len(xs):
        continue
    # A cut crop leaves a long straight run of ink on the drawing's bounding box, even
    # when transparent padding was added afterwards; natural outlines only touch it briefly.
    b = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    sides = {"top": b[0].mean(), "bottom": b[-1].mean(), "left": b[:, 0].mean(), "right": b[:, -1].mean()}
    pad = {"top": int(ys.min()), "bottom": int(h - 1 - ys.max()), "left": int(xs.min()), "right": int(w - 1 - xs.max())}
    touching = {k: round(float(v), 3) for k, v in sides.items() if v > 0.2}
    if touching:
        out.append({"src": s, "size": [w, h], "inkOnEdge": touching, "paddingPx": pad})
json.dump(out, open(os.path.join(P, "edge-touch.json"), "w"), indent=1)
print(len(srcs), "pictures checked;", len(out), "touch an edge")
for o in out:
    print(o["src"], o["inkOnEdge"])
