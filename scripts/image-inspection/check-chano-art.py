"""Images-lane check of the recovered Payaso Chano scene art (assets-motion PR #1326).

The SVGs wrap embedded WebP pixels. This checks, without editing anything:
  1. every embedded raster is shown at its own pixel size (no stretch / upscale);
  2. scene-juggle-bg.svg differs from scene.svg only where the five juggle balls sit;
  3. each juggle ball is a cut-out of the same scene pixels.
Input: the SVGs copied to test-results/chano-scene/ (git show of the #1326 head).
Output: PROOF/chano-scene-check.json and chano-scene-check.jpg.
"""
import base64, io, json, os, re
import numpy as np
from PIL import Image, ImageDraw
from _paths import PROOF, ROOT

SRC = os.path.join(ROOT, "test-results", "chano-scene")
NAMES = sorted(f for f in os.listdir(SRC) if f.endswith(".svg"))
# Painted positions of the five juggle balls in scene pixels (JUGGLE_BALLS in
# src/components/cartilla/games/chano/juggle.ts on the #1326 head).
BALL_POS = {"ma": (32, 303), "mi": (124, 111), "mo": (315, 11), "mu": (516, 115), "me": (581, 302)}

def load(name):
    text = open(os.path.join(SRC, name), encoding="utf-8").read()
    svg_w, svg_h = (float(v) for v in re.search(r'<svg[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"', text).groups())
    img = re.search(r'<image([^>]*)>', text).group(1)
    w = float(re.search(r'width="([\d.]+)"', img).group(1)); h = float(re.search(r'height="([\d.]+)"', img).group(1))
    x = float((re.search(r'\bx="([-\d.]+)"', img) or [0, 0])[1]); y = float((re.search(r'\by="([-\d.]+)"', img) or [0, 0])[1])
    data = re.search(r'base64,([A-Za-z0-9+/=]+)', img).group(1)
    im = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGBA")
    return {"svg": [svg_w, svg_h], "box": [x, y, w, h], "pixels": list(im.size), "im": im}

art = {n: load(n) for n in NAMES}
report = {"files": {}, "checks": {}}
for n, a in art.items():
    sx, sy = a["box"][2] / a["pixels"][0], a["box"][3] / a["pixels"][1]
    report["files"][n] = {"svgSize": a["svg"], "imageBox": a["box"], "embeddedPixels": a["pixels"],
                          "scale": [round(sx, 3), round(sy, 3)],
                          "result": "PASS" if abs(sx - 1) < 0.01 and abs(sy - 1) < 0.01 else "SCALED"}

scene = np.asarray(art["scene.svg"]["im"]).astype(np.int16)
bg = np.asarray(art["scene-juggle-bg.svg"]["im"]).astype(np.int16)
absdiff = np.abs(scene - bg)[..., :3].max(axis=2)
# Lossy WebP re-encoding moves many pixels by a few levels; only count visible changes.
diff = absdiff > 40
balls = np.zeros(diff.shape, bool)
ball_report = {}
for n, a in art.items():
    if not n.startswith("juggle-ball-"):
        continue
    w, h = a["pixels"]
    x, y = BALL_POS[n[len("juggle-ball-"):-len(".svg")]]
    alpha = np.asarray(a["im"])[..., 3] > 24
    region = balls[y:y + h, x:x + w]
    region |= alpha[: region.shape[0], : region.shape[1]]
    # cut-out check: ball pixels equal the original scene pixels at the same place
    sc = scene[y:y + h, x:x + w, :3]
    bp = np.asarray(a["im"]).astype(np.int16)[: sc.shape[0], : sc.shape[1]]
    m = (bp[..., 3] > 200)[: sc.shape[0], : sc.shape[1]]
    err = float(np.abs(sc[m] - bp[..., :3][m]).mean()) if m.any() else None
    ball_report[n] = {"meanDiffVsScene": round(err, 2) if err is not None else None,
                      "result": "CUT FROM SCENE" if err is not None and err < 6 else "DIFFERS"}
grown = balls.copy()
for _ in range(6):  # allow a soft edge around each ball
    grown = grown | np.roll(grown, 1, 0) | np.roll(grown, -1, 0) | np.roll(grown, 1, 1) | np.roll(grown, -1, 1)
outside = int((diff & ~grown).sum())
report["checks"]["backgroundChangedPixels"] = int(diff.sum())
report["checks"]["backgroundMeanDiffOutsideBalls"] = round(float(absdiff[~grown].mean()), 2)
report["checks"]["backgroundP99DiffOutsideBalls"] = int(np.percentile(absdiff[~grown], 99))
report["checks"]["backgroundChangedOutsideBalls"] = outside
report["checks"]["backgroundResult"] = "PASS (changes only under the five balls)" if outside < 0.0005 * diff.size else "CHANGES OUTSIDE BALLS"
report["checks"]["juggleBalls"] = ball_report
json.dump(report, open(os.path.join(PROOF, "chano-scene-check.json"), "w"), indent=1)

# Evidence sheet: scene | juggle background | changed pixels (red) over scene.
W = 360
def thumb(im):
    t = im.convert("RGB").copy(); t.thumbnail((W, 10_000)); return t
over = art["scene.svg"]["im"].convert("RGB").copy()
ov = np.asarray(over).copy(); ov[diff] = [230, 20, 20]
tiles = [("scene.svg (owner scene)", thumb(art["scene.svg"]["im"])), ("scene-juggle-bg.svg", thumb(art["scene-juggle-bg.svg"]["im"])),
         ("changed pixels in red", thumb(Image.fromarray(ov.astype(np.uint8))))]
H = max(t.height for _, t in tiles)
sheet = Image.new("RGB", (W * 3 + 40, H + 30), "white"); d = ImageDraw.Draw(sheet)
for i, (cap, t) in enumerate(tiles):
    sheet.paste(t, (10 + i * (W + 10), 26)); d.text((10 + i * (W + 10), 6), cap, fill="black")
sheet.save(os.path.join(PROOF, "chano-scene-check.jpg"), quality=82)
print(json.dumps({k: v["result"] for k, v in report["files"].items()}))
print(json.dumps(report["checks"]))
