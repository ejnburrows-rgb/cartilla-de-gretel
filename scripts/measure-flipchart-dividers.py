"""Find the printed divider bars (long, thin, rounded colour strips that
separate a sheet's word columns from its reading paragraph).

For each HD sheet scan this masks tinted (non-paper, non-ink) pixels,
keeps long thin solid components and writes their box and colour to
src/data/flipchart-dividers.json:
  { page: [[x, y, w, h, [top … bottom colour stops]], ...] }
in sheet units (1000 = sheet width), the same space as the text layer.
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SCANS = ROOT / "public/cartilla/art/hd/flipchart"
WORK = 1000


def main():
    out = {}
    for path in sorted(SCANS.glob("page-*.jpg")):
        page = int(path.stem.split("-")[1])
        scan = cv2.imread(str(path))
        k = WORK / scan.shape[1]
        img = cv2.resize(scan, (WORK, round(scan.shape[0] * k)), interpolation=cv2.INTER_AREA)
        rgb = img.astype(np.int16)
        chroma = rgb.max(axis=2) - rgb.min(axis=2)
        mean = rgb.mean(axis=2)
        mask = ((chroma >= 14) & (mean >= 150) & (mean <= 248)).astype(np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (15, 33)))
        n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
        found = []
        for i in range(1, n):
            x, y, w, h, area = stats[i]
            strict = w >= 450 and 10 <= h <= 70 and w / h >= 10 and area >= 0.75 * w * h
            # Wide pale bars can be taller and softer-edged (scan blur).
            wide = w >= 800 and 10 <= h <= 105 and w / h >= 8 and area >= 0.6 * w * h
            # Bars never touch the sheet edge (that is the scan border).
            if not (strict or wide) or x <= 2 or x + w >= WORK - 2:
                continue
            # The bar is a glossy tube: sample its colour top-to-bottom across
            # its length (away from the rounded ends).
            body = img[y:y + h, x + w // 20:x + 19 * w // 20].astype(np.float32)
            inside = (labels[y:y + h, x + w // 20:x + 19 * w // 20] == i)[..., None]
            profile = (body * inside).sum(axis=1) / np.maximum(inside.sum(axis=1), 1)
            stops = []
            for share in (0.04, 0.15, 0.35, 0.5, 0.65, 0.85, 0.96):
                b, g, r = profile[min(h - 1, round(share * (h - 1)))]
                stops.append("#%02x%02x%02x" % (round(r), round(g), round(b)))
            found.append([int(x), int(y), int(w), int(h), stops])
        if found:
            out[str(page)] = found
            print(page, found)
    (ROOT / "src/data/flipchart-dividers.json").write_text(json.dumps(out, indent=2) + "\n")


if __name__ == "__main__":
    main()
