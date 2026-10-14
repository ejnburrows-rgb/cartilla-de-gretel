"""Locate each approved Flip Chart picture on its printed sheet scan.

The approved crop boxes (flipchart-native-assets.json) are approximate; some
are tighter or looser than the drawing they hold. This finds where (and at
what size) each picture's drawn area actually sits on the HD scan, by
multi-scale template matching, so the replica sheet can place it exactly.
Output: src/data/flipchart-art-placement.json
  { src: [x, y, w, h, score] }   drawn area in sheet units (1000 = width)
Only confident matches are written; others keep the crop-box placement.
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "public"
ASSETS = json.loads((ROOT / "src/data/flipchart-native-assets.json").read_text())
ASSETS = ASSETS.get("pages", ASSETS)
BOUNDS = json.loads((ROOT / "src/data/flipchart-art-content-bounds.json").read_text())
BOUNDS = BOUNDS.get("bounds", BOUNDS)
WORK = 500  # matching resolution: scan scaled to this width (sheet units / 2)
MIN_SCORE = 0.55


def load_template(src):
    img = cv2.imread(str(PUB / src.lstrip("/")), cv2.IMREAD_UNCHANGED)
    if img is None:
        return None
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    alpha = img[:, :, 3:4].astype(np.float32) / 255.0
    rgb = img[:, :, :3].astype(np.float32)
    flat = rgb * alpha + 255.0 * (1 - alpha)  # transparent → paper white
    return flat.astype(np.uint8), (alpha[:, :, 0] > 0.5).astype(np.uint8)


def main():
    out = {}
    report = []
    for page, items in sorted(ASSETS.items(), key=lambda kv: int(kv[0])):
        scan_path = PUB / f"cartilla/art/hd/flipchart/page-{int(page):03d}.jpg"
        scan = cv2.imread(str(scan_path))
        if scan is None:
            continue
        k = WORK / scan.shape[1]
        small = cv2.resize(scan, (WORK, round(scan.shape[0] * k)), interpolation=cv2.INTER_AREA)
        unit = 1000 / WORK  # sheet units per matching pixel
        for asset in items:
            src = asset["src"]
            bounds = BOUNDS.get(src)
            loaded = load_template(src)
            if not bounds or loaded is None:
                continue
            nw, nh, bl, bt, bw, bh = bounds
            tpl, mask = loaded
            tpl = tpl[bt:bt + bh, bl:bl + bw]
            mask = mask[bt:bt + bh, bl:bl + bw]
            cx, cy, cw, ch = [v / unit for v in asset["crop"]]
            s0 = min(cw / bw, ch / bh)
            best = (-1.0, None)
            for s in s0 * np.geomspace(0.55, 2.4, 34):
                tw, th = max(8, round(bw * s)), max(8, round(bh * s))
                if tw >= small.shape[1] or th >= small.shape[0]:
                    continue
                # Search near the printed box only.
                pad = max(cw, ch) * 0.9 + 40
                x0 = int(max(0, cx - pad)); y0 = int(max(0, cy - pad))
                x1 = int(min(small.shape[1], cx + cw + pad)); y1 = int(min(small.shape[0], cy + ch + pad))
                region = small[y0:y1, x0:x1]
                if region.shape[0] <= th or region.shape[1] <= tw:
                    continue
                t = cv2.resize(tpl, (tw, th), interpolation=cv2.INTER_AREA)
                m = cv2.resize(mask, (tw, th), interpolation=cv2.INTER_NEAREST)
                if m.sum() < 30:
                    continue
                res = cv2.matchTemplate(region, t, cv2.TM_CCOEFF_NORMED, mask=cv2.merge([m, m, m]))
                res = np.nan_to_num(res, nan=-1, posinf=-1, neginf=-1)
                _, score, _, loc = cv2.minMaxLoc(res)
                if score > best[0]:
                    best = (score, (x0 + loc[0], y0 + loc[1], tw, th))
            score, rect = best
            report.append((page, src.rsplit("/", 1)[-1], round(score, 3)))
            if rect and score >= MIN_SCORE:
                x, y, w, h = rect
                out[src] = [round(x * unit, 1), round(y * unit, 1), round(w * unit, 1), round(h * unit, 1), round(score, 3)]
    (ROOT / "src/data/flipchart-art-placement.json").write_text(json.dumps(out, indent=0, sort_keys=True) + "\n")
    low = [r for r in report if r[2] < MIN_SCORE]
    print(f"placed {len(out)}/{len(report)}; low: {low}")


if __name__ == "__main__":
    main()
