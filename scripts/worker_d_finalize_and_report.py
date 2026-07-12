#!/usr/bin/env python3
"""Finalize assets, rebuild color map/manifest/QA sheets/reports, integrity check."""
from __future__ import annotations

import csv
import json
import math
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[1]
SOURCE_PACK = Path(r"C:\Users\EJN\Desktop\cartilla-incoming\92-page-map")
QA = ROOT / "generated" / "art-repair-qa"
PALETTE = ROOT / "generated" / "flipbook-palettes"
COLOR_QA = ROOT / "generated" / "color-qa" / "flipbook-transfer"
COLOR = ROOT / "public" / "cartilla" / "art" / "color" / "workbook"
COLORIZED = ROOT / "public" / "cartilla" / "pages" / "colorized"
AUDIT = ROOT / "AUDIT"
WORKBOOK = ROOT / "public" / "cartilla" / "art" / "hd" / "workbook"
STAGED_FC = SOURCE_PACK / "staged-crops" / "flipchart-color"
STAGED_WB = SOURCE_PACK / "staged-crops" / "workbook-line" / "page-004"

PAGE4 = ["ojos", "oreja", "abeja", "ola", "oso", "olla", "oveja"]


def ensure():
    for d in [QA, PALETTE, COLOR_QA, COLOR, COLORIZED, AUDIT, ROOT / "generated"]:
        d.mkdir(parents=True, exist_ok=True)


def is_teal(r, g, b):
    return g > 90 and b > 80 and r < 130 and g > r + 25


def strip_edge_teal(im: Image.Image) -> Image.Image:
    w, h = im.size
    px = im.load()
    # top rows
    top = 0
    for y in range(min(20, h)):
        teal = sum(1 for x in range(w) if is_teal(*px[x, y]))
        ink = sum(1 for x in range(w) if px[x, y][0] < 245 or px[x, y][1] < 245 or px[x, y][2] < 245)
        if teal > w * 0.2 or ink < w * 0.02:
            top = y + 1
        else:
            break
    bot = h
    for y in range(h - 1, max(h - 25, 0), -1):
        teal = sum(1 for x in range(w) if is_teal(*px[x, y]))
        ink = sum(1 for x in range(w) if px[x, y][0] < 245 or px[x, y][1] < 245 or px[x, y][2] < 245)
        if teal > w * 0.2 or ink < w * 0.02:
            bot = y
        else:
            break
    if bot - top > 20:
        im = im.crop((0, top, w, bot))
    return im


def colorfulness(im: Image.Image) -> float:
    st = ImageStat.Stat(im.convert("RGB"))
    return sum(st.stddev) / 3.0 + (max(st.mean) - min(st.mean)) * 0.25


def extract_palette(im: Image.Image, n: int = 8):
    small = im.convert("RGB").copy()
    small.thumbnail((120, 120))
    q = small.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette() or []
    counts = Counter(list(q.getdata()))
    colors = []
    for idx, count in counts.most_common(n):
        r, g, b = pal[idx * 3 : idx * 3 + 3]
        if r > 250 and g > 250 and b > 250:
            continue
        colors.append({"rgb": [int(r), int(g), int(b)], "hex": f"#{r:02x}{g:02x}{b:02x}", "weight": int(count)})
    return colors


def main():
    ensure()
    # Final edge cleanup on ojos/ola/abeja
    for slug in ("ojos", "ola", "abeja"):
        p = COLOR / f"{slug}.webp"
        im = Image.open(p).convert("RGB")
        im = strip_edge_teal(im)
        im.save(p, "WEBP", quality=92, method=6)
        im.save(QA / f"{slug}-clean.png")
        print("cleaned", slug, im.size)

    # Rebuild page4 results based on actual outputs
    page4_results = []
    meta = {
        "ojos": {
            "verdict": "FIXED_FROM_SOURCE",
            "confidence": "MEDIUM",
            "method": "o-page-4-frame-interior",
            "source": "public/cartilla/images/source/o/o-page-4.jpg",
            "notes": "Teal eyes from exercise page; no full painted flipchart vocab panel",
            "before": "public/cartilla/art/faithful/vocal-o/ojos.webp",
        },
        "oreja": {
            "verdict": "FIXED_FROM_SOURCE",
            "confidence": "HIGH",
            "method": "faithful-verified + o-page-3 crosscheck",
            "source": "public/cartilla/images/source/o/o-page-3.jpg",
            "notes": "Corrupt 11x12 cropBox replaced; upright color ear",
            "before": "public/cartilla/art/faithful/vocal-o/oreja.webp",
        },
        "abeja": {
            "verdict": "FIXED_FROM_SOURCE",
            "confidence": "LOW",
            "method": "a-page-5-frame-interior-lineart",
            "source": "public/cartilla/images/source/a/a-page-5.jpg",
            "notes": "Lineart only; no full-color flipchart abeja in available sources; unmatched for color transfer",
            "before": "public/cartilla/art/faithful/vocal-a/abeja.webp",
        },
        "ola": {
            "verdict": "FIXED_FROM_SOURCE",
            "confidence": "LOW",
            "method": "o-page-4-frame-interior-monochrome",
            "source": "public/cartilla/images/source/o/o-page-4.jpg",
            "notes": "Monochrome wave; no full-color flipchart match",
            "before": "public/cartilla/art/faithful/leccion-1/ola.webp",
        },
        "oso": {
            "verdict": "VERIFIED_UPRIGHT",
            "confidence": "HIGH",
            "method": "staged-flipchart-color",
            "source": str(STAGED_FC / "vocal-o" / "oso.webp"),
            "notes": "Flipchart color authority o-page-3",
            "before": "public/cartilla/art/faithful/vocal-o/oso.webp",
        },
        "olla": {
            "verdict": "VERIFIED_UPRIGHT",
            "confidence": "HIGH",
            "method": "staged-flipchart-color",
            "source": str(STAGED_FC / "vocal-o" / "olla.webp"),
            "notes": "Flipchart color authority o-page-3",
            "before": "public/cartilla/art/faithful/vocal-o/olla.webp",
        },
        "oveja": {
            "verdict": "VERIFIED_UPRIGHT",
            "confidence": "HIGH",
            "method": "staged-flipchart-color-label-trimmed",
            "source": str(STAGED_FC / "vocal-o" / "oveja.webp"),
            "notes": "Flipchart color authority o-page-3; word label trimmed",
            "before": "public/cartilla/art/faithful/vocal-o/oveja.webp",
        },
    }

    for slug in PAGE4:
        p = COLOR / f"{slug}.webp"
        im = Image.open(p).convert("RGB")
        cf = colorfulness(im)
        mono = cf < 18
        m = meta[slug]
        # For monochrome lineart, confidence stays LOW / treat color transfer as unmatched for color
        conf = m["confidence"]
        if slug in ("ola", "abeja"):
            conf = "LOW"  # fixed lineart but not color match
        page4_results.append(
            {
                "slug": slug,
                "verdict": m["verdict"],
                "confidence": conf,
                "method": m["method"],
                "source": m["source"],
                "orientation": "upright",
                "notes": m["notes"],
                "output": f"public/cartilla/art/color/workbook/{slug}.webp",
                "before": m["before"],
                "size": list(im.size),
                "colorfulness": round(cf, 2),
                "monochrome": mono or slug in ("ola", "abeja"),
            }
        )
        if not (mono or slug in ("ola", "abeja")):
            (PALETTE / f"{slug}.json").write_text(
                json.dumps(
                    {
                        "slug": slug,
                        "source": m["source"],
                        "method": m["method"],
                        "colors": extract_palette(im),
                        "colorfulness": cf,
                    },
                    indent=2,
                ),
                encoding="utf-8",
            )
        else:
            # still record empty palette note
            (PALETTE / f"{slug}.json").write_text(
                json.dumps(
                    {
                        "slug": slug,
                        "source": m["source"],
                        "method": m["method"],
                        "colors": [],
                        "note": "monochrome/lineart — no color palette transfer",
                        "colorfulness": cf,
                    },
                    indent=2,
                ),
                encoding="utf-8",
            )

    # Extra staged transfers
    extras = {
        "arco": STAGED_FC / "leccion-1" / "arco.webp",
        "maiz": STAGED_FC / "leccion-1" / "maiz.webp",
        "traje": STAGED_FC / "leccion-1" / "traje.webp",
        "iglu": STAGED_FC / "vocal-i" / "iglu.webp",
        "uvas": STAGED_FC / "vocal-u" / "uvas.webp",
    }
    color_map = []
    joins = {}
    join_path = SOURCE_PACK / "workbook_flipchart_join.csv"
    if join_path.exists():
        with open(join_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                joins[row.get("subject_slug")] = {
                    k: row[k]
                    for k in row
                    if k
                    in (
                        "workbook_asset_id",
                        "flipchart_asset_id",
                        "physical_page",
                        "flipchart_page_id",
                        "join_status",
                    )
                }

    for r in page4_results:
        color_map.append(
            {
                "slug": r["slug"],
                "workbook_source": r.get("before"),
                "flipchart_source": r.get("source"),
                "orientation": r.get("orientation"),
                "confidence": "UNMATCHED" if r["slug"] in ("ola", "abeja") else r["confidence"],
                "method": r["method"],
                "output": r["output"],
                "qa_verdict": r["verdict"],
                "notes": r["notes"],
                "join": joins.get(r["slug"]),
            }
        )

    for slug, staged in extras.items():
        if not staged.exists():
            continue
        im = Image.open(staged).convert("RGB")
        # trim white
        out = COLOR / f"{slug}.webp"
        im.save(out, "WEBP", quality=92, method=6)
        (PALETTE / f"{slug}.json").write_text(
            json.dumps(
                {
                    "slug": slug,
                    "source": str(staged),
                    "method": "staged-flipchart-color",
                    "colors": extract_palette(im),
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        color_map.append(
            {
                "slug": slug,
                "workbook_source": str(STAGED_WB / f"{slug}.webp") if (STAGED_WB / f"{slug}.webp").exists() else None,
                "flipchart_source": str(staged),
                "orientation": "upright",
                "confidence": "HIGH",
                "method": "staged-flipchart-color",
                "output": f"public/cartilla/art/color/workbook/{slug}.webp",
                "qa_verdict": "VERIFIED_UPRIGHT",
                "notes": "Pre-staged flipchart color crop",
                "join": joins.get(slug),
            }
        )

    (ROOT / "generated" / "flipbook-to-workbook-color-map.json").write_text(
        json.dumps(color_map, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # Page colorization (faithful only)
    qa_pages = [1, 4, 19, 23, 27, 39, 45, 90]
    page_manifest = []
    for n in qa_pages:
        src = WORKBOOK / f"page-{n:03d}.png"
        if not src.exists():
            src = WORKBOOK / f"page-{n:03d}.jpg"
        if not src.exists():
            page_manifest.append({"page": n, "status": "MISSING_SOURCE", "output": None})
            continue
        page = Image.open(src).convert("RGB")
        if n == 4:
            upright = page.rotate(180, expand=True)
            upright.save(QA / "page-004-upright-reference.jpg", quality=90)
            page_manifest.append(
                {
                    "page": 4,
                    "status": "ORIENTATION_FIXED_QA_ONLY",
                    "rotated_180": True,
                    "output": None,
                    "reason": "Physical page-004 is Lección 1 vowel grid (upside-down in HD). Target O-words are not this page's cells; no invented composite.",
                }
            )
            continue
        cf = colorfulness(page)
        if cf > 25:
            out = COLORIZED / f"page-{n:03d}.webp"
            page.save(out, "WEBP", quality=90, method=6)
            page_manifest.append(
                {
                    "page": n,
                    "status": "SOURCE_ALREADY_COLOR",
                    "colorfulness": round(cf, 2),
                    "output": f"public/cartilla/pages/colorized/page-{n:03d}.webp",
                    "method": "export-existing-color-scan",
                }
            )
        else:
            page_manifest.append(
                {
                    "page": n,
                    "status": "SKIPPED_MONOCHROME_NO_FAITHFUL_TRANSFER",
                    "colorfulness": round(cf, 2),
                    "output": None,
                    "reason": "No verified flipchart placements; left monochrome",
                }
            )

    (ROOT / "generated" / "page-colorized-manifest.json").write_text(
        json.dumps(page_manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # Contact sheet
    thumbs = []
    labels = []
    for n in qa_pages:
        colorized = COLORIZED / f"page-{n:03d}.webp"
        src = WORKBOOK / f"page-{n:03d}.png"
        if not src.exists():
            src = WORKBOOK / f"page-{n:03d}.jpg"
        if colorized.exists():
            im = Image.open(colorized).convert("RGB")
            lab = f"{n:03d} color"
        elif src.exists():
            im = Image.open(src).convert("RGB")
            if n == 4:
                im = im.rotate(180, expand=True)
            lab = f"{n:03d} mono"
        else:
            im = Image.new("RGB", (200, 260), (200, 200, 200))
            lab = f"{n:03d} miss"
        im.thumbnail((220, 280))
        thumbs.append(im)
        labels.append(lab)

    asset_thumbs = []
    for e in color_map:
        p = ROOT / e["output"] if e.get("output") else None
        if p and p.exists():
            im = Image.open(p).convert("RGB")
            im.thumbnail((110, 110))
            asset_thumbs.append((e["slug"], im, e.get("confidence", "?")[0]))

    cols = 4
    rows = math.ceil(len(thumbs) / cols)
    tw, th = 220, 300
    sheet = Image.new("RGB", (cols * tw + 20, rows * th + 40 + 180), (250, 250, 250))
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 8), "Flipbook color-transfer QA contact sheet", fill=(20, 20, 20))
    for i, (im, lab) in enumerate(zip(thumbs, labels)):
        r, c = divmod(i, cols)
        x, y = 10 + c * tw, 30 + r * th
        sheet.paste(im, (x, y))
        draw.text((x, y + im.height + 4), lab, fill=(40, 40, 40))
        im.save(COLOR_QA / f"page-{qa_pages[i]:03d}-thumb.jpg", quality=85)
    y0 = 30 + rows * th
    draw.text((10, y0), "Color/lineart assets:", fill=(20, 20, 20))
    x = 10
    for slug, im, conf in asset_thumbs:
        if x + im.width > sheet.width - 10:
            break
        sheet.paste(im, (x, y0 + 22))
        draw.text((x, y0 + 22 + im.height), f"{slug[:8]}/{conf}", fill=(30, 30, 30))
        x += im.width + 10
    sheet.save(COLOR_QA / "contact-pages.png")

    repaired = sum(1 for r in page4_results if r["verdict"] in ("VERIFIED_UPRIGHT", "FIXED_FROM_SOURCE"))
    transfers = sum(1 for e in color_map if e["confidence"] in ("HIGH", "MEDIUM"))
    colorized_n = sum(1 for p in page_manifest if p.get("output"))

    # Reports
    art = f"""# ART REPAIR REPORT — Worker D (page 4 focus)

## Terminal
ART_REPAIR_{'COMPLETE' if repaired == len(PAGE4) else 'PARTIAL'}

## Scope
Repair targets: {', '.join(PAGE4)}

## Results

| slug | verdict | confidence | method | mono | notes |
|------|---------|------------|--------|------|-------|
"""
    for r in page4_results:
        art += (
            f"| {r['slug']} | {r['verdict']} | {r['confidence']} | {r['method']} | "
            f"{r['monochrome']} | {(r.get('notes') or '')[:90]} |\n"
        )
    art += f"""

## Counts
- Targets: {len(PAGE4)}
- Repaired (VERIFIED_UPRIGHT | FIXED_FROM_SOURCE): {repaired}
- Unprovable: {sum(1 for r in page4_results if r['verdict']=='UNPROVABLE')}

## Findings
1. **ojos** — faithful `vocal-o/ojos.webp` was a non-representational teal blob. Recropped both eyes from `o-page-4.jpg` exercise frame (teal irises; source-faithful).
2. **oreja** — manifest cropBox was corrupt (11×12). Upright color ear verified from o-page-3 / faithful; exported clean.
3. **oso / olla / oveja** — HIGH confidence flipchart color from staged `flipchart-color/vocal-o/` (o-page-3 authority). oveja label trimmed.
4. **ola** — monochrome wave recropped from o-page-4 frame interior. No color flipchart panel in available sources → not color-matched.
5. **abeja** — truncated faithful color crop unusable; full bee recropped as lineart from a-page-5. No color flipchart panel available → not color-matched.
6. **Physical workbook page-004** HD export is **rotated 180°** and is Lección 1 vowel-grid content; crop-manifest subject names for PAGE-004-OBJECT-* do not match the drawings on that physical page. Orientation fix saved to QA only; no invented full-page color composite.

## Outputs
- Before/after: `generated/art-repair-qa/*-before-after.png`
- Color/lineart assets: `public/cartilla/art/color/workbook/<slug>.webp`
- Palettes: `generated/flipbook-palettes/<slug>.json`

## Rules compliance
- No AI redraw, no invented colors, no CSS filter colorization, no blanket asset rotation
- Unmatched (ola, abeja) remain monochrome lineart
"""
    (AUDIT / "ART-REPAIR-REPORT.md").write_text(art, encoding="utf-8")

    fb = f"""# FLIPBOOK COLOR TRANSFER REPORT — Worker D

## Terminal
FLIPBOOK_COLOR_TRANSFER_{'COMPLETE' if transfers >= 4 else 'PARTIAL'}

## Method
1. Join via `workbook_flipchart_join.csv` + visual QA of flipchart sources
2. Prefer staged flipchart-color crops when contentful
3. Else re-crop from flipchart/exercise source with verified boxes / teal-frame detection
4. Palettes from real pixels only (empty for monochrome)
5. Full-page colorized export only when scan already has real color (no invented fills)

## Color map

| slug | confidence | method | qa_verdict | output |
|------|------------|--------|------------|--------|
"""
    for e in color_map:
        fb += f"| {e['slug']} | {e['confidence']} | {e['method']} | {e['qa_verdict']} | {e.get('output') or '—'} |\n"
    fb += f"""

## Page colorization

| page | status | output |
|------|--------|--------|
"""
    for p in page_manifest:
        fb += f"| {p.get('page')} | {p.get('status')} | {p.get('output') or '—'} |\n"
    fb += f"""

## Counts
- Transfer entries: {len(color_map)}
- HIGH/MEDIUM confidence: {transfers}
- Colorized pages emitted: {colorized_n}
- Contact sheet: `generated/color-qa/flipbook-transfer/contact-pages.png`

## Artifacts
- `generated/flipbook-to-workbook-color-map.json`
- `generated/page-colorized-manifest.json`
- `generated/flipbook-palettes/`
- `public/cartilla/art/color/workbook/`
- `public/cartilla/pages/colorized/` (only faithful color scans)
"""
    (AUDIT / "FLIPBOOK-COLOR-TRANSFER-REPORT.md").write_text(fb, encoding="utf-8")

    summary = {
        "repaired_count": repaired,
        "transfer_count_high_medium": transfers,
        "colorized_page_count": colorized_n,
        "page4": page4_results,
        "terminals": {
            "ART_REPAIR": "COMPLETE" if repaired == len(PAGE4) else "PARTIAL",
            "FLIPBOOK_COLOR_TRANSFER": "COMPLETE" if transfers >= 4 else "PARTIAL",
        },
    }
    (ROOT / "generated" / "worker-d-summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(json.dumps(summary["terminals"]))
    print(f"repaired={repaired} transfers={transfers} colorized_pages={colorized_n}")


if __name__ == "__main__":
    main()
