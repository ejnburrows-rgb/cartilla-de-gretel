"""Measure the drawn area inside each approved Flip Chart picture.

The optimized picture files are square canvases with white padding, while the
printed sheet's picture boxes (flipchart-native-assets.json crops) are tight
to the drawing. The replica sheet fits the drawn area, not the padded canvas,
into the printed box. Output: src/data/flipchart-art-content-bounds.json
  { src: [naturalWidth, naturalHeight, left, top, width, height] }
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def bands(mask):
    """Runs of inked rows/columns as (start, end) inclusive."""
    runs, start = [], None
    for i, on in enumerate(mask):
        if on and start is None:
            start = i
        if not on and start is not None:
            runs.append((start, i - 1))
            start = None
    if start is not None:
        runs.append((start, len(mask) - 1))
    return runs


def trim(mask, max_share, leading=True):
    """Drop thin scan leftovers (a cut-off printed label, a sliver of a
    neighbouring circle) that sit apart from the drawing at an edge."""
    runs = bands(mask)
    if not runs:
        return None, None
    size = runs[-1][1] - runs[0][0] + 1
    gap = max(3, int(0.012 * len(mask)))
    def thin(run):
        return (run[1] - run[0] + 1) < max_share * size
    while len(runs) > 1 and thin(runs[-1]) and runs[-1][0] - runs[-2][1] > gap:
        runs.pop()
    while leading and len(runs) > 1 and thin(runs[0]) and runs[1][0] - runs[0][1] > gap:
        runs.pop(0)
    return runs[0][0], runs[-1][1]
assets = json.loads((ROOT / "src/data/flipchart-native-assets.json").read_text())
out = {}
for page, entries in assets.items():
    for entry in entries:
        src = entry["src"]
        path = ROOT / "public" / src.lstrip("/")
        if src in out or not path.exists():
            continue
        im = Image.open(path).convert("RGBA")
        a = np.asarray(im).astype(int)
        ink = (a[..., 3] > 16) & (a[..., :3].min(axis=2) < 244)
        x0, x1 = trim(ink.sum(axis=0) >= 2, 0.06)
        y0, y1 = trim(ink.sum(axis=1) >= 2, 0.15, leading=False)
        if x0 is None or y0 is None:
            continue
        out[src] = [im.width, im.height, x0, y0, x1 - x0 + 1, y1 - y0 + 1]

target = ROOT / "src/data/flipchart-art-content-bounds.json"
target.write_text(json.dumps(dict(sorted(out.items())), indent=1) + "\n")
print(len(out), "pictures measured ->", target.relative_to(ROOT))
