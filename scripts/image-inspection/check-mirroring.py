"""Flag faithful files that are left-right mirrored relative to the HD source drawing.
Compares each current file with its recrop candidate (candidates.json) as-is and flipped.
usage: python3 scripts/image-inspection/check-mirroring.py CANDIDATE_DIR"""
import json, os, sys
import numpy as np
from PIL import Image, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
D = sys.argv[1]

def prep(im):
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    g = np.asarray(bg.convert("L"))
    ys, xs = np.where(g < 232)
    g = bg.convert("L").crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    return g

def ncc(a, b):
    a = np.asarray(a, np.float32); b = np.asarray(b, np.float32)
    a -= a.mean(); b -= b.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) or 1))

cands = json.load(open(os.path.join(D, "candidates.json")))
for c in cands:
    if "sourceBoxPx" not in c:
        continue
    cur = prep(Image.open(os.path.join(ROOT, "public" + c["current"])))
    new = prep(Image.open(os.path.join(ROOT, c["candidate"])))
    size = (96, 96)
    same = ncc(cur.resize(size), new.resize(size))
    flipped = ncc(cur.resize(size), ImageOps.mirror(new).resize(size))
    c["matchAsIs"] = round(same, 3)
    c["matchMirrored"] = round(flipped, 3)
    c["currentIsMirrored"] = flipped > same + 0.1
json.dump(cands, open(os.path.join(D, "candidates.json"), "w"), indent=1)
for c in cands:
    if "matchAsIs" in c:
        print(c["current"], c["matchAsIs"], c["matchMirrored"], "MIRRORED" if c["currentIsMirrored"] else "")
