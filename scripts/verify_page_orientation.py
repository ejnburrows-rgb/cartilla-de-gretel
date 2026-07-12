#!/usr/bin/env python3
"""
Regression: flag faithful overlay assets whose orientation disagrees with workbook scan.

Compares each picture-grid cell on pages 1-90 against its illustrationSrc asset.
Does NOT flag full-page restored rotation (text/header heuristic separate).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parent.parent
LAYOUTS = REPO / "src/data/page-layouts.json"
SCAN_DIR = REPO / "public/cartilla/art/hd/workbook"
OUT_JSON = REPO / "generated/orientation-qa/orientation-sweep.json"
OUT_MD = REPO / "generated/orientation-qa/orientation-sweep.md"

FLIP_THRESHOLD = 0.05


def load_bgr(p: Path):
    if not p.is_file() or p.stat().st_size == 0:
        return None
    try:
        im = Image.open(p)
        if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
            bg = Image.new('RGB', im.size, (255, 255, 255))
            bg.paste(im, mask=im.convert('RGBA').split()[3])
            im = bg
        else:
            im = im.convert("RGB")
        return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
    except Exception:
        d = np.fromfile(str(p), dtype=np.uint8)
        if d.size == 0:
            return None
        return cv2.imdecode(d, cv2.IMREAD_COLOR)


def match_in_cell(asset, cell):
    ah, aw = asset.shape[:2]
    ch, cw = cell.shape[:2]
    
    # Scale proportionally based on cell width/height
    # The asset should roughly fit in the cell
    s = 0.25
    na = cv2.resize(asset, (0, 0), fx=s, fy=s)
    nc = cv2.resize(cell, (0, 0), fx=s, fy=s)
    
    if na.shape[0] > nc.shape[0] or na.shape[1] > nc.shape[1]:
        # If template is bigger than cell, just use simple NCC
        return ncc(asset, cell), ncc(cv2.rotate(asset, cv2.ROTATE_180), cell)
        
    ga = cv2.cvtColor(na, cv2.COLOR_BGR2GRAY)
    gc = cv2.cvtColor(nc, cv2.COLOR_BGR2GRAY)
    
    res_up = cv2.matchTemplate(gc, ga, cv2.TM_CCOEFF_NORMED)
    _, max_val_up, _, _ = cv2.minMaxLoc(res_up)
    
    ga_flip = cv2.rotate(ga, cv2.ROTATE_180)
    res_flip = cv2.matchTemplate(gc, ga_flip, cv2.TM_CCOEFF_NORMED)
    _, max_val_flip, _, _ = cv2.minMaxLoc(res_flip)
    
    return float(max_val_up), float(max_val_flip)

def ncc(a, b):
    # Fallback simple NCC without squash distortion
    ah, aw = a.shape[:2]
    bh, bw = b.shape[:2]
    s = min(bh / max(ah, 1), bw / max(aw, 1), 1.0)
    if s < 0.12: return -1.0
    na = cv2.resize(a, (max(8, int(aw * s)), max(8, int(ah * s))))
    # Crop center of b instead of squash
    nb = cv2.resize(b, (0,0), fx=s, fy=s)
    if nb.shape[0] < na.shape[0] or nb.shape[1] < na.shape[1]:
        return -1.0
    cy, cx = nb.shape[0]//2, nb.shape[1]//2
    nb = nb[cy-na.shape[0]//2:cy+na.shape[0]//2, cx-na.shape[1]//2:cx+na.shape[1]//2]
    ga = cv2.cvtColor(na, cv2.COLOR_BGR2GRAY)
    gb = cv2.cvtColor(nb, cv2.COLOR_BGR2GRAY)
    return float(cv2.matchTemplate(gb, ga, cv2.TM_CCOEFF_NORMED).max())

def grid_cells(scan, count: int):
    h, w = scan.shape[:2]
    y0, y1 = int(h * 0.22), int(h * 0.88)
    x0, x1 = int(w * 0.08), int(w * 0.92)
    grid = scan[y0:y1, x0:x1]
    gh, gw = grid.shape[:2]
    cols = 4
    rows = max(1, (count + cols - 1) // cols)
    ch, cw = gh // rows, gw // cols
    cells = []
    for i in range(count):
        r, c = divmod(i, cols)
        cells.append(grid[r * ch : (r + 1) * ch, c * cw : (c + 1) * cw])
    return cells

def page_scan(n: int):
    pad = f"{n:03d}"
    for ext in (".png", ".jpg"):
        p = SCAN_DIR / f"page-{pad}{ext}"
        if p.is_file():
            return load_bgr(p)
    return None

def main() -> int:
    layouts = json.loads(LAYOUTS.read_text(encoding="utf-8"))
    pages = layouts.get("pages", {})
    findings = []
    checked = 0

    for pn in range(1, 91):
        page = pages.get(str(pn))
        if not page:
            continue
        scan = page_scan(pn)
        if scan is None:
            continue
            
        for region in page.get("regions", []):
            if region.get("regionType") != "picture-grid":
                continue
            cells = region.get("cells") or []
            crops = grid_cells(scan, len(cells))
            
            for i, cell_def in enumerate(cells):
                src = cell_def.get("illustrationSrc")
                caption = cell_def.get("caption", "?")
                if not src:
                    continue
                asset_path = REPO / "public" / src.lstrip("/")
                asset = load_bgr(asset_path)
                if asset is None:
                    findings.append(
                        {
                            "page": pn,
                            "caption": caption,
                            "asset": src,
                            "issue": "missing_or_corrupt",
                        }
                    )
                    continue
                checked += 1
                
                cell = crops[i] if i < len(crops) else None
                if cell is None: continue
                u, f = match_in_cell(asset, cell)
                
                # Flag if flipped matches significantly better
                if f > u + FLIP_THRESHOLD and f > 0.08:
                    findings.append(
                        {
                            "page": pn,
                            "caption": caption,
                            "asset": src,
                            "issue": "object_inverted",
                            "upright_ncc": round(u, 4),
                            "flipped_ncc": round(f, 4),
                        }
                    )

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"checked": checked, "findings": findings}, indent=2), encoding="utf-8")

    lines = [
        "# Orientation sweep (pages 1–90)",
        "",
        f"Cells checked: **{checked}**",
        f"Findings: **{len(findings)}**",
        "",
    ]
    if findings:
        lines.append("| Page | Caption | Asset | Issue |")
        lines.append("|------|---------|-------|-------|")
        for f in findings:
            lines.append(
                f"| {f['page']} | {f.get('caption','')} | `{f.get('asset','')}` | {f['issue']} |"
            )
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"checked={checked} findings={len(findings)}")
    print(f"wrote {OUT_JSON}")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())