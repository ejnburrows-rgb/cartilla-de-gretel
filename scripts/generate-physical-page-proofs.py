#!/usr/bin/env python3
"""
scripts/generate-physical-page-proofs.py
Generates high-resolution physical Workbook and Flip Chart page screenshots with
crisp crimson red-circled asset callouts for all 201 drawing groups / 330 placements,
and updates the review interface (verified-optimized.html) to the exact 2-column layout.

Outputs:
- public/cartilla/art/physical-page-proofs/[group_id]_wb.jpg
- public/cartilla/art/physical-page-proofs/[group_id]_fc.jpg
- public/cartilla/art/physical-page-proofs/[group_id]_book_zoom.jpg
- public/cartilla/art/physical-page-proofs/[placement_id].jpg (for all 330 placements)
- docs/art-board/physical-page-proofs-manifest.json
- public/art-board/physical-page-proofs-manifest.json
- docs/art-board/verified-optimized.html
- public/art-board/verified-optimized.html
"""

import csv
import json
import os
import sys
import time
from pathlib import Path
from PIL import Image, ImageDraw

ROOT_DIR = Path(__file__).resolve().parent.parent
MAPPING_CSV = ROOT_DIR / "docs" / "artwork-reconciliation" / "mapping" / "MASTER-MAPPING.csv"
COVERAGE_JSON = ROOT_DIR / "docs" / "proofs" / "artwork-coverage-2026-10-14" / "coverage-manifest.json"
PAGES_DIR = ROOT_DIR / "docs" / "proofs" / "artwork-coverage-2026-10-14"
OUTPUT_DIR = ROOT_DIR / "public" / "cartilla" / "art" / "physical-page-proofs"
DOCS_MANIFEST = ROOT_DIR / "docs" / "art-board" / "physical-page-proofs-manifest.json"
PUBLIC_MANIFEST = ROOT_DIR / "public" / "art-board" / "physical-page-proofs-manifest.json"
CATALOG_JSON = ROOT_DIR / "docs" / "art-board" / "verified-optimized-catalog.json"
DOCS_HTML = ROOT_DIR / "docs" / "art-board" / "verified-optimized.html"
PUBLIC_HTML = ROOT_DIR / "public" / "art-board" / "verified-optimized.html"

# Crimson red color requested by Emilio: #dc2626 -> RGB (220, 38, 38)
CRIMSON_RED = (220, 38, 38)
CONTRAST_WHITE = (255, 255, 255)


def draw_crimson_callout(image: Image.Image, crop_box: list[float]) -> Image.Image:
    """Draws a crisp crimson red circle/oval with white contrast rings around crop_box_normalized."""
    w, h = image.size
    x_norm, y_norm, w_norm, h_norm = crop_box

    x1 = int(x_norm * w)
    y1 = int(y_norm * h)
    x2 = int((x_norm + w_norm) * w)
    y2 = int((y_norm + h_norm) * h)

    # Add 5% breathing room (min 6px) around the illustration
    box_w = max(10, x2 - x1)
    box_h = max(10, y2 - y1)
    pad_x = max(6, int(box_w * 0.05))
    pad_y = max(6, int(box_h * 0.05))

    bx1 = max(1, x1 - pad_x)
    by1 = max(1, y1 - pad_y)
    bx2 = min(w - 1, x2 + pad_x)
    by2 = min(h - 1, y2 + pad_y)

    circled = image.copy()
    draw = ImageDraw.Draw(circled)

    # 1. Subtle white outer contrast ring (width 2)
    draw.ellipse([bx1 - 2, by1 - 2, bx2 + 2, by2 + 2], outline=CONTRAST_WHITE, width=2)
    # 2. Crisp crimson red circle (#dc2626, width 4)
    draw.ellipse([bx1, by1, bx2, by2], outline=CRIMSON_RED, width=4)
    # 3. Subtle white inner contrast ring (width 1)
    draw.ellipse([bx1 + 2, by1 + 2, bx2 - 2, by2 - 2], outline=CONTRAST_WHITE, width=1)

    return circled


def crop_book_zoom(image: Image.Image, crop_box: list[float]) -> Image.Image:
    """Crops a high-resolution zoomed detail of the region with comfortable padding."""
    w, h = image.size
    x_norm, y_norm, w_norm, h_norm = crop_box

    x1 = int(x_norm * w)
    y1 = int(y_norm * h)
    x2 = int((x_norm + w_norm) * w)
    y2 = int((y_norm + h_norm) * h)

    box_w = max(10, x2 - x1)
    box_h = max(10, y2 - y1)

    zoom_pad_x = max(12, int(box_w * 0.20))
    zoom_pad_y = max(12, int(box_h * 0.20))

    zx1 = max(0, x1 - zoom_pad_x)
    zy1 = max(0, y1 - zoom_pad_y)
    zx2 = min(w, x2 + zoom_pad_x)
    zy2 = min(h, y2 + zoom_pad_y)

    return image.crop((zx1, zy1, zx2, zy2))


def generate_proof_images():
    print("=== Generando Imágenes de Pruebas Físicas con Círculos Rojos Carmesí ===")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_MANIFEST.parent.mkdir(parents=True, exist_ok=True)

    with open(MAPPING_CSV, "r", encoding="utf-8") as f:
        master_rows = list(csv.DictReader(f))

    with open(COVERAGE_JSON, "r", encoding="utf-8") as f:
        cov_manifest = json.load(f)

    cov_map = {ill["illustration_id"]: ill for ill in cov_manifest["illustrations"]}

    groups: dict[str, list[dict]] = {}
    for r in master_rows:
        gid = r["drawing_group_id"]
        if gid not in groups:
            groups[gid] = []
        groups[gid].append({
            "csv": r,
            "ill": cov_map[r["artwork_id"]]
        })

    print(f"Grupos únicos: {len(groups)}, Colocaciones totales: {len(master_rows)}")

    page_cache: dict[str, Image.Image] = {}

    def get_page_image(page_rel_path: str) -> Image.Image:
        if page_rel_path not in page_cache:
            full_path = PAGES_DIR / page_rel_path
            if not full_path.exists():
                raise FileNotFoundError(f"Page file not found: {full_path}")
            page_cache[page_rel_path] = Image.open(full_path).convert("RGB")
        return page_cache[page_rel_path]

    manifest: dict[str, dict] = {}
    placement_proof_count = 0
    group_proof_count = 0

    for gid, items in groups.items():
        wb_items = [it for it in items if it["ill"].get("book") == "WB"]
        fc_items = [it for it in items if it["ill"].get("book") == "FC"]

        pages_detail = []
        for it in items:
            ill = it["ill"]
            csv_r = it["csv"]
            pid = ill["illustration_id"]
            page_rel = ill.get("full_page_reference")
            cb = ill.get("crop_box_normalized")
            book_code = ill.get("book")
            book_name = "Cuaderno" if book_code == "WB" else "Rotafolio"
            printed_page = ill.get("printed_page")
            if printed_page is None:
                printed_page = csv_r.get("page_sheet", "")
            lesson = ill.get("lesson")
            if lesson is None:
                lesson = csv_r.get("lesson_item", "")

            # Generate individual placement proof
            if page_rel and cb:
                page_img = get_page_image(page_rel)
                placement_circled = draw_crimson_callout(page_img, cb)
                placement_out = OUTPUT_DIR / f"{pid}.jpg"
                placement_circled.save(placement_out, "JPEG", quality=88, optimize=True)
                placement_proof_count += 1
                proof_url = f"/cartilla/art/physical-page-proofs/{pid}.jpg"
            else:
                proof_url = None

            pages_detail.append({
                "book": book_code,
                "book_name": book_name,
                "printed_page": printed_page,
                "lesson": lesson,
                "placement_id": pid,
                "page_file": page_rel,
                "proof_url": proof_url
            })

        wb_proof_path = None
        fc_proof_path = None
        primary_zoom_source = None
        primary_crop_box = None

        # Generate Workbook proof if WB placements exist
        if wb_items:
            primary_wb = wb_items[0]
            p_ill = primary_wb["ill"]
            p_page = p_ill.get("full_page_reference")
            p_cb = p_ill.get("crop_box_normalized")
            if p_page and p_cb:
                page_img = get_page_image(p_page)
                wb_circled = draw_crimson_callout(page_img, p_cb)
                wb_out = OUTPUT_DIR / f"{gid}_wb.jpg"
                wb_circled.save(wb_out, "JPEG", quality=88, optimize=True)
                wb_proof_path = f"/cartilla/art/physical-page-proofs/{gid}_wb.jpg"
                primary_zoom_source = page_img
                primary_crop_box = p_cb

        # Generate Flip Chart proof if FC placements exist
        if fc_items:
            primary_fc = fc_items[0]
            p_ill = primary_fc["ill"]
            p_page = p_ill.get("full_page_reference")
            p_cb = p_ill.get("crop_box_normalized")
            if p_page and p_cb:
                page_img = get_page_image(p_page)
                fc_circled = draw_crimson_callout(page_img, p_cb)
                fc_out = OUTPUT_DIR / f"{gid}_fc.jpg"
                fc_circled.save(fc_out, "JPEG", quality=88, optimize=True)
                fc_proof_path = f"/cartilla/art/physical-page-proofs/{gid}_fc.jpg"
                if primary_zoom_source is None:
                    primary_zoom_source = page_img
                    primary_crop_box = p_cb

        # Generate High-Res Zoomed Detail
        book_zoom_path = None
        if primary_zoom_source and primary_crop_box:
            zoom_img = crop_book_zoom(primary_zoom_source, primary_crop_box)
            zoom_out = OUTPUT_DIR / f"{gid}_book_zoom.jpg"
            zoom_img.save(zoom_out, "JPEG", quality=92, optimize=True)
            book_zoom_path = f"/cartilla/art/physical-page-proofs/{gid}_book_zoom.jpg"
            group_proof_count += 1

        manifest[gid] = {
            "group_id": gid,
            "wb_page_proof": wb_proof_path,
            "fc_page_proof": fc_proof_path,
            "book_zoom": book_zoom_path,
            "pages_detail": pages_detail
        }

    manifest_json_str = json.dumps(manifest, indent=2, ensure_ascii=False)
    with open(DOCS_MANIFEST, "w", encoding="utf-8") as f:
        f.write(manifest_json_str)

    with open(PUBLIC_MANIFEST, "w", encoding="utf-8") as f:
        f.write(manifest_json_str)

    print(f"- Pruebas de colocación individuales (330 placements): {placement_proof_count}")
    print(f"- Pruebas de grupo generadas: {group_proof_count}")
    return manifest


def generate_review_interface(proofs_manifest: dict):
    print("\n=== Generando Interfaz de Revisión Rediseñada (2 Columnas) ===")
    with open(CATALOG_JSON, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    # Merge physical proofs into catalog groups
    for g in catalog["groups"]:
        p = proofs_manifest.get(g["group_id"], {})
        g["wb_page_proof"] = p.get("wb_page_proof")
        g["fc_page_proof"] = p.get("fc_page_proof")
        g["book_zoom"] = p.get("book_zoom")
        g["pages_detail"] = p.get("pages_detail", [])

    catalog_json = json.dumps(catalog, ensure_ascii=False)

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Revisión Visual de Arte (Libro Físico vs. Reemplazo) — La Cartilla de Gretel</title>
  <style>
    :root {{
      --bg: #f8fafc;
      --card: #ffffff;
      --ink: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --green: #16a34a;
      --green-dark: #15803d;
      --green-bg: #dcfce7;
      --red: #dc2626;
      --red-dark: #b91c1c;
      --red-bg: #fee2e2;
      --blue: #2563eb;
      --blue-dark: #1d4ed8;
      --blue-bg: #eff6ff;
      --amber: #d97706;
      --amber-bg: #fef3c7;
      --gray-bg: #f1f5f9;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--ink);
      line-height: 1.45;
    }}

    /* Top Sticky Header */
    header {{
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.98);
      border-bottom: 2px solid var(--border);
      padding: 12px 24px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.05);
      backdrop-filter: blur(8px);
    }}
    .header-inner {{
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .top-bar {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }}
    .brand h1 {{
      margin: 0;
      font-size: 21px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .brand p {{
      margin: 2px 0 0;
      font-size: 13px;
      color: var(--muted);
    }}
    .top-actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }}
    .counter-pill {{
      font-size: 13.5px;
      font-weight: 700;
      padding: 7px 14px;
      background: var(--gray-bg);
      border: 1px solid var(--border);
      border-radius: 999px;
      color: #1e293b;
    }}
    .btn {{
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .btn-green {{ background: var(--green); color: #fff; }}
    .btn-green:hover {{ background: var(--green-dark); transform: translateY(-1px); }}
    .btn-blue {{ background: var(--blue); color: #fff; }}
    .btn-blue:hover {{ background: var(--blue-dark); transform: translateY(-1px); }}
    .btn-outline {{ background: #fff; color: var(--ink); border: 1px solid #cbd5e1; }}
    .btn-outline:hover {{ background: #f8fafc; border-color: #94a3b8; }}

    .nav-bar {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }}
    .tabs {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }}
    .tab {{
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid #cbd5e1;
      background: #fff;
      color: #334155;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .tab:hover {{ background: #f1f5f9; }}
    .tab.active {{
      background: #0f172a;
      color: #fff;
      border-color: #0f172a;
      box-shadow: 0 2px 5px rgba(15,23,42,0.2);
    }}
    .search-box {{
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid #cbd5e1;
      font-size: 13.5px;
      min-width: 280px;
      outline: none;
      transition: border-color 0.15s;
    }}
    .search-box:focus {{ border-color: var(--blue); }}

    /* Layout Container */
    .container {{
      max-width: 1400px;
      margin: 20px auto 60px;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }}

    /* Bulk Dropzone */
    .bulk-dropzone {{
      background: #ffffff;
      border: 2px dashed #94a3b8;
      border-radius: 16px;
      padding: 16px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .bulk-dropzone:hover {{ border-color: var(--blue); background: #f8fafc; }}
    .bulk-dropzone.dragover {{ border-color: var(--blue); background: #eff6ff; }}
    .bulk-dropzone h3 {{ margin: 0 0 4px; font-size: 15px; color: #0f172a; }}
    .bulk-dropzone p {{ margin: 0; font-size: 12.5px; color: var(--muted); }}

    /* Two-Column Review Card */
    .review-card {{
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 18px;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      transition: border-color 0.15s, box-shadow 0.15s;
    }}
    .review-card.status-accepted {{ border-color: #22c55e; background: #fafdfb; }}
    .review-card.status-declined {{ border-color: #f87171; background: #fefafa; }}
    .review-card.status-skipped {{ border-color: #94a3b8; background: #f8fafc; opacity: 0.9; }}

    /* Card Top Header */
    .card-top-header {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }}
    .title-cluster {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }}
    .group-title {{
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }}
    .group-id-badge {{
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 8px;
      background: #e2e8f0;
      color: #334155;
      border-radius: 6px;
    }}
    .placements-count-badge {{
      font-size: 12.5px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #475569;
    }}

    .status-badge {{
      font-size: 12.5px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .status-badge.accepted {{ background: var(--green-bg); color: var(--green-dark); }}
    .status-badge.declined {{ background: var(--red-bg); color: var(--red-dark); }}
    .status-badge.skipped {{ background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }}
    .status-badge.pending {{ background: var(--amber-bg); color: var(--amber); }}

    /* 2-Column Grid */
    .card-2col {{
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(360px, 440px);
      gap: 24px;
      align-items: start;
    }}
    @media (max-width: 980px) {{
      .card-2col {{ grid-template-columns: 1fr; }}
    }}

    /* LEFT COLUMN: Visual Inspection */
    .col-visual {{
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}

    .source-tabs {{
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .source-tabs-title {{
      font-size: 12.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #475569;
    }}
    .btn-source-tab {{
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 700;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .btn-source-tab:hover {{ background: #f1f5f9; }}
    .btn-source-tab.active {{
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);
    }}

    /* Main Stage */
    .stage-wrapper {{
      position: relative;
      background: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: zoom-in;
      transition: border-color 0.15s, box-shadow 0.15s;
    }}
    .stage-wrapper:hover {{
      border-color: var(--blue);
      box-shadow: 0 4px 16px rgba(37,99,235,0.12);
    }}
    .callout-pill {{
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 5;
      background: rgba(220, 38, 38, 0.95);
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 5px;
    }}
    .stage-frame {{
      width: 100%;
      height: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: repeating-conic-gradient(#f8fafc 0% 25%, #ffffff 0% 50%) 0 / 16px 16px;
      overflow: hidden;
    }}
    .stage-img {{
      max-width: 96%;
      max-height: 96%;
      object-fit: contain;
      transition: transform 0.2s;
    }}
    .stage-wrapper:hover .stage-img {{
      transform: scale(1.015);
    }}
    .stage-hint {{
      width: 100%;
      padding: 7px;
      background: #f8fafc;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 11.5px;
      color: var(--muted);
      font-weight: 600;
    }}

    /* Trio Comparison Grid */
    .trio-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }}
    @media (max-width: 640px) {{
      .trio-grid {{ grid-template-columns: 1fr; }}
    }}
    .trio-card {{
      background: #ffffff;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: zoom-in;
      transition: all 0.15s;
    }}
    .trio-card:hover {{
      border-color: var(--blue);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }}
    .trio-card-recommended {{
      border-color: #86efac;
      background: #f0fdf4;
    }}
    .trio-card-recommended:hover {{
      border-color: var(--green);
    }}
    .trio-badge {{
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      align-self: flex-start;
    }}
    .badge-book {{ background: #e0e7ff; color: #3730a3; }}
    .badge-current {{ background: #f1f5f9; color: #475569; }}
    .badge-candidate {{ background: var(--green); color: #ffffff; }}
    .trio-stage {{
      width: 100%;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      overflow: hidden;
    }}
    .trio-stage.checkerboard {{
      background: repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 0 / 12px 12px;
    }}
    .trio-stage img {{
      max-width: 92%;
      max-height: 92%;
      object-fit: contain;
    }}
    .trio-label {{
      font-size: 11px;
      color: #64748b;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}

    /* RIGHT COLUMN: Action & Verification */
    .col-action {{
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}

    /* Info Card: Book Appearances */
    .info-card {{
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }}
    .info-card-header {{
      font-size: 12.5px;
      font-weight: 800;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .book-badges-list {{
      display: flex;
      flex-direction: column;
      gap: 5px;
    }}
    .book-badge {{
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .book-badge.wb-badge {{ border-left: 4px solid #0284c7; }}
    .book-badge.fc-badge {{ border-left: 4px solid #ea580c; }}

    /* Fidelity Card */
    .fidelity-card {{
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .fidelity-card-header {{
      font-size: 13px;
      font-weight: 800;
      color: #1e40af;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .res-comparison {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      border-radius: 10px;
      padding: 8px 12px;
      border: 1px solid #dbeafe;
    }}
    .res-box {{
      display: flex;
      flex-direction: column;
    }}
    .res-sub {{
      font-size: 10.5px;
      color: var(--muted);
      font-weight: 700;
      text-transform: uppercase;
    }}
    .res-num {{
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
    }}
    .res-arrow {{
      font-size: 16px;
      color: #3b82f6;
      font-weight: 900;
    }}
    .res-multiplier {{
      background: #22c55e;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
    }}
    .fidelity-advice {{
      margin: 0;
      font-size: 12px;
      color: #334155;
      line-height: 1.4;
    }}

    /* Action Buttons Panel */
    .action-panel {{
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .btn-primary-action {{
      width: 100%;
      padding: 13px 18px;
      border-radius: 12px;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.15s ease;
      text-align: left;
    }}
    .btn-approve {{
      background: var(--green);
      color: #ffffff;
      box-shadow: 0 3px 8px rgba(22, 163, 74, 0.25);
    }}
    .btn-approve:hover {{
      background: var(--green-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
    }}
    .btn-approve.is-active {{
      background: #15803d;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 3px rgba(34, 197, 94, 0.4);
    }}

    .btn-reject {{
      background: #ffffff;
      border-color: #fca5a5;
      color: var(--red);
    }}
    .btn-reject:hover {{
      background: var(--red-bg);
      border-color: var(--red);
      transform: translateY(-1px);
    }}
    .btn-reject.is-active {{
      background: var(--red);
      color: #ffffff;
      border-color: var(--red);
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.3);
    }}

    .action-icon {{
      font-size: 22px;
      line-height: 1;
    }}
    .action-text {{
      display: flex;
      flex-direction: column;
    }}
    .action-title {{
      font-size: 14.5px;
      font-weight: 800;
    }}
    .action-subtitle {{
      font-size: 11.5px;
      opacity: 0.9;
    }}

    /* Custom Dropzone Action */
    .custom-drop-action {{
      border: 2px dashed #93c5fd;
      background: #eff6ff;
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .custom-drop-action:hover {{
      border-color: var(--blue);
      background: #dbeafe;
    }}
    .custom-drop-action .action-title {{
      color: #1d4ed8;
      font-size: 13.5px;
    }}
    .custom-drop-action .action-subtitle {{
      color: #3b82f6;
      font-size: 11px;
    }}

    /* Secondary Buttons Row */
    .secondary-btn-row {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }}
    .btn-sec {{
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }}
    .btn-skip {{
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
    }}
    .btn-skip:hover {{ background: #f1f5f9; border-color: #94a3b8; }}
    .btn-skip.is-active {{
      background: #475569;
      color: #ffffff;
      border-color: #475569;
    }}

    .btn-undo {{
      background: #ffffff;
      border: 1px solid #f59e0b;
      color: #d97706;
    }}
    .btn-undo:hover {{ background: #fef3c7; }}
    .btn-undo:disabled {{
      opacity: 0.45;
      cursor: not-allowed;
      border-color: #e2e8f0;
      color: #94a3b8;
    }}

    /* Multiple Candidates Selector if > 1 */
    .alt-candidates-box {{
      border-top: 1px solid var(--border);
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .alt-candidates-title {{
      font-size: 11.5px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
    }}
    .alt-candidates-list {{
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }}
    .alt-cand-pill {{
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      font-size: 12px;
      cursor: pointer;
      white-space: nowrap;
    }}
    .alt-cand-pill.selected {{
      border-color: var(--green);
      background: #dcfce7;
      font-weight: 800;
    }}
    .alt-cand-pill img {{
      width: 22px;
      height: 22px;
      object-fit: contain;
    }}

    /* Lightbox Modal */
    .lightbox-modal {{
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.92);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      backdrop-filter: blur(4px);
    }}
    .lightbox-modal.open {{ display: flex; }}
    .lightbox-box {{
      background: #ffffff;
      border-radius: 18px;
      max-width: 1300px;
      width: 100%;
      max-height: 94vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
    }}
    .lightbox-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
    }}
    .lightbox-title {{
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
    }}
    .lightbox-body {{
      padding: 20px;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      background: repeating-conic-gradient(#f8fafc 0% 25%, #ffffff 0% 50%) 0 / 20px 20px;
      min-height: 400px;
    }}
    .lightbox-body img {{
      max-width: 100%;
      max-height: 78vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }}

    /* Global File Input */
    #global-file-picker {{ display: none; }}
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div class="top-bar">
        <div class="brand">
          <h1>🎨 Revisión Visual de Arte (Libro Físico vs. Reemplazo)</h1>
          <p>Compara el libro físico original (con elemento encerrado en rojo 🔴) contra la versión de alta resolución ⭐.</p>
        </div>
        <div class="top-actions">
          <span id="counter-pill" class="counter-pill">Cargando progreso...</span>
          <button class="btn btn-green" id="btn-accept-recommended">⭐ Aceptar Todos los Recomendados (1 Clic)</button>
          <button class="btn btn-blue" id="btn-save">💾 Guardar Decisiones</button>
        </div>
      </div>
      <div class="nav-bar">
        <div class="tabs" id="tabs">
          <button class="tab active" data-tab="wb">📘 Cuaderno (A–Z)</button>
          <button class="tab" data-tab="fc">📙 Rotafolio</button>
          <button class="tab" data-tab="cover">🖼️ Portadas</button>
          <button class="tab" data-tab="pending">⏳ Pendientes</button>
          <button class="tab" data-tab="accepted">✅ Aprobados</button>
          <button class="tab" data-tab="declined">❌ Rechazados</button>
          <button class="tab" data-tab="skipped">⏭️ Omitidos</button>
          <button class="tab" data-tab="all">Todos (201)</button>
        </div>
        <input type="search" id="search" class="search-box" placeholder="🔍 Buscar por palabra o página (ej. abanico, pág 7)..." />
      </div>
    </div>
  </header>

  <div class="container">
    <!-- Bulk Drag-and-Drop Dropzone -->
    <div class="bulk-dropzone" id="bulk-dropzone" onclick="document.getElementById('global-file-picker').click()">
      <h3>📥 ¿Tienes imágenes o carpetas en tu PC? Haz clic aquí o arrástralas en lote</h3>
      <p>También puedes arrastrar imágenes directamente sobre la tarjeta de cualquier palabra.</p>
    </div>

    <!-- 2-Column Review Card List -->
    <div id="list-container" style="display:flex;flex-direction:column;gap:20px;"></div>
  </div>

  <!-- Fullscreen Lightbox Modal -->
  <div class="lightbox-modal" id="lightbox-modal" onclick="closeLightbox(event)">
    <div class="lightbox-box" onclick="event.stopPropagation()">
      <div class="lightbox-header">
        <span class="lightbox-title" id="lightbox-title">Ampliación en Alta Resolución</span>
        <button class="btn btn-outline" onclick="closeLightbox()">✕ Cerrar (Esc)</button>
      </div>
      <div class="lightbox-body">
        <img id="lightbox-img" src="" alt="Ampliación" />
      </div>
    </div>
  </div>

  <input type="file" id="global-file-picker" accept=".zip,image/*" multiple />

  <script>
    const CATALOG = {catalog_json};
    const IS_FILE_PROTOCOL = window.location.protocol === "file:";
    const STORAGE_KEY = "cartilla_simple_decisions_v3";
    let decisions = {{}};
    try {{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) decisions = JSON.parse(raw);
    }} catch (e) {{}}

    // Active stage views per group (wb or fc)
    const activeStageView = {{}};

    let activeTab = "wb";
    let query = "";
    let targetUploadGroupId = null;

    // Sync with backend server if on HTTP
    if (!IS_FILE_PROTOCOL) {{
      fetch("/api/art-review/state")
        .then(r => r.json())
        .then(srv => {{
          if (srv && srv.decisions) {{
            decisions = Object.assign({{}}, decisions, srv.decisions);
            saveState(false);
            updateHeaderCounter();
            renderList();
          }}
        }})
        .catch(() => {{}});
    }}

    function saveState(syncToServer = true) {{
      try {{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
      }} catch (e) {{}}
      updateHeaderCounter();
    }}

    async function sendDecisionToBackend(groupId, decision) {{
      if (!IS_FILE_PROTOCOL) {{
        try {{
          await fetch("/api/art-review/decision", {{
            method: "POST",
            headers: {{ "Content-Type": "application/json" }},
            body: JSON.stringify({{ group_id: groupId, decision }})
          }});
        }} catch (e) {{
          console.warn("Backend sync notice:", e);
        }}
      }}
    }}

    function updateHeaderCounter() {{
      let acc = 0, dec = 0, skip = 0, pend = 0;
      for (const g of CATALOG.groups) {{
        const d = decisions[g.group_id];
        if (!d || d.status === "pending") pend++;
        else if (d.status === "accepted") acc++;
        else if (d.status === "declined") dec++;
        else if (d.status === "skipped") skip++;
      }}
      document.getElementById("counter-pill").textContent =
        `✅ ${{acc}} Aprobados · ❌ ${{dec}} Rechazados · ⏭️ ${{skip}} Omitidos · ⏳ ${{pend}} Pendientes`;
    }}

    function resolveImgUrl(url) {{
      return url || "";
    }}

    // Decision Handlers
    function approveGroup(groupId, candId) {{
      const grp = CATALOG.groups.find(g => g.group_id === groupId);
      if (!grp) return;
      const candidate = candId ? grp.candidates.find(c => c.id === candId) : (grp.candidates[0] || null);
      const decision = {{
        status: "accepted",
        selected_candidate_id: candidate ? candidate.id : null,
        selected_original_path: candidate ? candidate.original_path : null,
        canonical_target: grp.canonical_target,
        updated_at: new Date().toISOString()
      }};
      decisions[groupId] = decision;
      saveState();
      sendDecisionToBackend(groupId, decision);
      updateCardDOM(groupId);
    }}

    function rejectGroup(groupId) {{
      const decision = {{
        status: "declined",
        selected_candidate_id: null,
        updated_at: new Date().toISOString()
      }};
      decisions[groupId] = decision;
      saveState();
      sendDecisionToBackend(groupId, decision);
      updateCardDOM(groupId);
    }}

    function skipGroup(groupId) {{
      const decision = {{
        status: "skipped",
        selected_candidate_id: null,
        updated_at: new Date().toISOString()
      }};
      decisions[groupId] = decision;
      saveState();
      sendDecisionToBackend(groupId, decision);
      updateCardDOM(groupId);
    }}

    function undoGroup(groupId) {{
      delete decisions[groupId];
      saveState();
      sendDecisionToBackend(groupId, null);
      updateCardDOM(groupId);
    }}

    function switchStage(groupId, bookType) {{
      activeStageView[groupId] = bookType;
      const grp = CATALOG.groups.find(g => g.group_id === groupId);
      if (!grp) return;
      const mainImg = document.getElementById(`main-img-${{groupId}}`);
      if (mainImg) {{
        mainImg.src = (bookType === "fc" ? grp.fc_page_proof : grp.wb_page_proof) || grp.book_zoom;
      }}
      // Toggle tab classes
      const cardEl = document.getElementById(`card-${{groupId}}`);
      if (cardEl) {{
        cardEl.querySelectorAll(".btn-source-tab").forEach(b => {{
          b.classList.toggle("active", b.dataset.src === bookType);
        }});
      }}
    }}

    // Lightbox Modal
    function openLightbox(src, title) {{
      const modal = document.getElementById("lightbox-modal");
      const img = document.getElementById("lightbox-img");
      const titleEl = document.getElementById("lightbox-title");
      img.src = src;
      titleEl.textContent = title || "Ampliación de Imagen";
      modal.classList.add("open");
    }}

    function closeLightbox(e) {{
      document.getElementById("lightbox-modal").classList.remove("open");
    }}

    document.addEventListener("keydown", (e) => {{
      if (e.key === "Escape") closeLightbox();
    }});

    // Custom Upload Handlers
    function openFilePickerForGroup(groupId) {{
      targetUploadGroupId = groupId;
      document.getElementById("global-file-picker").click();
    }}

    document.getElementById("global-file-picker").addEventListener("change", (e) => {{
      const files = Array.from(e.target.files);
      if (!files.length) return;
      if (targetUploadGroupId) {{
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {{
          const grp = CATALOG.groups.find(g => g.group_id === targetUploadGroupId);
          if (grp) {{
            const newCand = {{
              id: "custom-" + Date.now(),
              web_url: ev.target.result,
              width: 1200,
              height: 1200,
              format: file.name.split(".").pop().toUpperCase(),
              has_alpha: true,
              is_recommended: true,
              quality_badge: `🌟 TU IMAGEN: ${{file.name}}`,
              quality_advice: `Archivo subido localmente: ${{file.name}}`,
              original_path: file.name
            }};
            grp.candidates.unshift(newCand);
            approveGroup(targetUploadGroupId, newCand.id);
          }}
          targetUploadGroupId = null;
        }};
        reader.readAsDataURL(file);
      }}
    }});

    function handleDragOver(e) {{
      e.preventDefault();
      e.currentTarget.classList.add("dragover");
    }}
    function handleDragLeave(e) {{
      e.currentTarget.classList.remove("dragover");
    }}
    function handleDropForGroup(e, groupId) {{
      e.preventDefault();
      e.currentTarget.classList.remove("dragover");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {{
        targetUploadGroupId = groupId;
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {{
          const grp = CATALOG.groups.find(g => g.group_id === groupId);
          if (grp) {{
            const newCand = {{
              id: "custom-" + Date.now(),
              web_url: ev.target.result,
              width: 1200,
              height: 1200,
              format: file.name.split(".").pop().toUpperCase(),
              has_alpha: true,
              is_recommended: true,
              quality_badge: `🌟 TU IMAGEN: ${{file.name}}`,
              quality_advice: `Archivo arrastrado: ${{file.name}}`,
              original_path: file.name
            }};
            grp.candidates.unshift(newCand);
            approveGroup(groupId, newCand.id);
          }}
          targetUploadGroupId = null;
        }};
        reader.readAsDataURL(file);
      }}
    }}

    // Filter Logic
    function filterGroup(g) {{
      const d = decisions[g.group_id];
      const status = d ? d.status : "pending";

      if (activeTab === "pending" && status !== "pending") return false;
      if (activeTab === "accepted" && status !== "accepted") return false;
      if (activeTab === "declined" && status !== "declined") return false;
      if (activeTab === "skipped" && status !== "skipped") return false;
      if (activeTab === "wb" && !g.group_id.startsWith("DRAW-WB-")) return false;
      if (activeTab === "fc" && !g.group_id.startsWith("DRAW-FC-")) return false;
      if (activeTab === "cover" && !g.group_id.includes("FRONT") && !g.group_id.includes("COVER")) return false;

      if (query) {{
        const q = query.toLowerCase();
        const inLabel = (g.label || "").toLowerCase().includes(q);
        const inId = g.group_id.toLowerCase().includes(q);
        const inPages = (g.pages_summary || []).some(p => p.toLowerCase().includes(q));
        if (!inLabel && !inId && !inPages) return false;
      }}
      return true;
    }}

    // HTML Card Renderer
    function renderCard(g) {{
      const d = decisions[g.group_id];
      const status = d ? d.status : "pending";
      const isAccepted = status === "accepted";
      const isDeclined = status === "declined";
      const isSkipped = status === "skipped";

      const selectedCandId = d ? d.selected_candidate_id : null;
      const candidate = (selectedCandId ? g.candidates.find(c => c.id === selectedCandId) : null) || g.candidates[0] || null;

      // Status pill HTML
      let statusPillHtml = `<span class="status-badge pending">⏳ Pendiente de Revisión</span>`;
      if (isAccepted) statusPillHtml = `<span class="status-badge accepted">✅ Reemplazo Aprobado</span>`;
      else if (isDeclined) statusPillHtml = `<span class="status-badge declined">❌ Rechazado / No Coincide</span>`;
      else if (isSkipped) statusPillHtml = `<span class="status-badge skipped">⏭️ Omitido por Ahora</span>`;

      // Determine active book proof
      const hasWb = Boolean(g.wb_page_proof);
      const hasFc = Boolean(g.fc_page_proof);
      let currentStageType = activeStageView[g.group_id];
      if (!currentStageType) {{
        currentStageType = hasWb ? "wb" : (hasFc ? "fc" : "zoom");
        activeStageView[g.group_id] = currentStageType;
      }}
      const activeProofUrl = currentStageType === "fc" ? (g.fc_page_proof || g.wb_page_proof) : (g.wb_page_proof || g.fc_page_proof);
      const bookZoomUrl = g.book_zoom || activeProofUrl;

      // Book tabs HTML
      let sourceTabsHtml = "";
      if (hasWb && hasFc) {{
        sourceTabsHtml = `
          <div class="source-tabs">
            <span class="source-tabs-title">📖 Libro Físico:</span>
            <button class="btn-source-tab ${{currentStageType==='wb'?'active':''}}" data-src="wb" onclick="switchStage('${{g.group_id}}', 'wb')">📖 Cuaderno</button>
            <button class="btn-source-tab ${{currentStageType==='fc'?'active':''}}" data-src="fc" onclick="switchStage('${{g.group_id}}', 'fc')">📑 Rotafolio</button>
          </div>
        `;
      }} else if (hasWb) {{
        sourceTabsHtml = `<div class="source-tabs"><span class="source-tabs-title">📖 Cuaderno de Trabajo (Original Impreso)</span></div>`;
      }} else if (hasFc) {{
        sourceTabsHtml = `<div class="source-tabs"><span class="source-tabs-title">📑 Rotafolio de Gretel (Original Impreso)</span></div>`;
      }}

      // App current asset
      const currentAppAsset = (g.current_runtime_assets && g.current_runtime_assets[0]) || g.source_crop || bookZoomUrl;
      const candUrl = candidate ? resolveImgUrl(candidate.web_url) : "";
      const candDims = candidate ? `${{candidate.width}}×${{candidate.height}} px` : "Alta Resolución";

      // Placement details list
      const placementBadges = (g.pages_detail || []).map(p => {{
        const icon = p.book === "WB" ? "📖 Cuaderno" : "📑 Rotafolio";
        const cls = p.book === "WB" ? "wb-badge" : "fc-badge";
        const pageText = p.printed_page ? `Pág. ${{p.printed_page}}` : "";
        const lessonText = p.lesson ? `(Lección ${{p.lesson}})` : "";
        return `<span class="book-badge ${{cls}}">${{icon}}: ${{pageText}} ${{lessonText}}</span>`;
      }}).join("");

      // Multiple candidates selector if > 1
      let altCandidatesHtml = "";
      if (g.candidates && g.candidates.length > 1) {{
        const cPills = g.candidates.map((c, idx) => {{
          const isSel = candidate && candidate.id === c.id;
          return `
            <div class="alt-cand-pill ${{isSel ? 'selected' : ''}}" onclick="approveGroup('${{g.group_id}}', '${{c.id}}')">
              <img src="${{resolveImgUrl(c.web_url)}}" alt="Opción ${{idx+1}}" />
              <span>Opción ${{idx+1}} (${{c.width}}×${{c.height}})</span>
            </div>
          `;
        }}).join("");
        altCandidatesHtml = `
          <div class="alt-candidates-box">
            <span class="alt-candidates-title">Otras opciones de candidato disponibles:</span>
            <div class="alt-candidates-list">${{cPills}}</div>
          </div>
        `;
      }}

      return `
        <div class="review-card status-${{status}}" id="card-${{g.group_id}}">
          <!-- Card Header -->
          <div class="card-top-header">
            <div class="title-cluster">
              <h2 class="group-title">${{g.label}}</h2>
              <span class="group-id-badge">${{g.group_id}}</span>
              <span class="placements-count-badge">📍 ${{g.placements.length}} apariciones en libro</span>
            </div>
            <div class="status-cluster">
              ${{statusPillHtml}}
            </div>
          </div>

          <!-- 2-Column Grid -->
          <div class="card-2col">

            <!-- LEFT COLUMN: Visual Inspection -->
            <div class="col-visual">
              ${{sourceTabsHtml}}

              <!-- Main Stage: Physical Page with Crimson Red Circle -->
              <div class="stage-wrapper" onclick="openLightbox('${{activeProofUrl}}', '${{g.label}} - Página Física con Círculo Carmesí')">
                <div class="callout-pill">🔴 Encerrado en rojo en el libro original</div>
                <div class="stage-frame">
                  <img id="main-img-${{g.group_id}}" class="stage-img" src="${{activeProofUrl}}" alt="Página física original" loading="lazy" />
                </div>
                <div class="stage-hint">🔍 Haz clic para ampliar la página completa en alta resolución</div>
              </div>

              <!-- Trio Comparison Row -->
              <div class="trio-grid">
                <!-- 1. Detalle del Libro Impreso -->
                <div class="trio-card" onclick="openLightbox('${{bookZoomUrl}}', '${{g.label}} - Detalle del Libro Impreso')">
                  <span class="trio-badge badge-book">🔎 Detalle Impreso</span>
                  <div class="trio-stage">
                    <img src="${{bookZoomUrl}}" alt="Detalle del libro impreso" loading="lazy" />
                  </div>
                  <div class="trio-label">Escaneo físico original</div>
                </div>

                <!-- 2. En App Actualmente -->
                <div class="trio-card" onclick="openLightbox('${{currentAppAsset}}', '${{g.label}} - En App Actualmente')">
                  <span class="trio-badge badge-current">📱 En App Actual</span>
                  <div class="trio-stage">
                    <img src="${{currentAppAsset}}" alt="En app actualmente" loading="lazy" onerror="this.src='${{g.source_crop || bookZoomUrl}}'" />
                  </div>
                  <div class="trio-label">Baja resolución / borrosa</div>
                </div>

                <!-- 3. Candidato Propuesto -->
                <div class="trio-card trio-card-recommended" onclick="openLightbox('${{candUrl}}', '${{g.label}} - Reemplazo Propuesto (${{candDims}})')">
                  <span class="trio-badge badge-candidate">⭐ Propuesta HD</span>
                  <div class="trio-stage checkerboard">
                    <img src="${{candUrl}}" alt="Reemplazo propuesto" loading="lazy" />
                  </div>
                  <div class="trio-label">${{candDims}}</div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Action & Verification Panel -->
            <div class="col-action">
              <!-- Book Appearances -->
              <div class="info-card">
                <div class="info-card-header">
                  <span>📚</span>
                  <span>Ubicaciones en Libros Físicos:</span>
                </div>
                <div class="book-badges-list">
                  ${{placementBadges}}
                </div>
              </div>

              <!-- Visual Fidelity Advice & Resolution Meter -->
              <div class="fidelity-card">
                <div class="fidelity-card-header">
                  <span>💎</span>
                  <span>Comparación de Calidad y Nitidez</span>
                </div>
                <div class="res-comparison">
                  <div class="res-box">
                    <span class="res-sub">Actual:</span>
                    <span class="res-num">~200 px</span>
                  </div>
                  <div class="res-arrow">➔</div>
                  <div class="res-box">
                    <span class="res-sub">Nuevo:</span>
                    <span class="res-num">${{candDims}}</span>
                  </div>
                  <span class="res-multiplier">4× Más Nítido</span>
                </div>
                <p class="fidelity-advice">
                  Compara la silueta y trazos del dibujo encerrado en rojo a la izquierda con el reemplazo propuesto. Verifica que mantenga la fidelidad del libro auténtico.
                </p>
              </div>

              <!-- Prominent Action Buttons -->
              <div class="action-panel">
                <!-- 1. Aprobar Reemplazo -->
                <button class="btn-primary-action btn-approve ${{isAccepted ? 'is-active' : ''}}" onclick="approveGroup('${{g.group_id}}')">
                  <span class="action-icon">✅</span>
                  <div class="action-text">
                    <span class="action-title">${{isAccepted ? "Reemplazo Aprobado" : "Aprobar Reemplazo"}}</span>
                    <span class="action-subtitle">Usar versión de alta resolución</span>
                  </div>
                </button>

                <!-- 2. Rechazar / No coincide -->
                <button class="btn-primary-action btn-reject ${{isDeclined ? 'is-active' : ''}}" onclick="rejectGroup('${{g.group_id}}')">
                  <span class="action-icon">❌</span>
                  <div class="action-text">
                    <span class="action-title">${{isDeclined ? "Rechazo Marcado" : "Rechazar / No coincide"}}</span>
                    <span class="action-subtitle">No coincide con el libro físico o tiene defectos</span>
                  </div>
                </button>

                <!-- 3. Reemplazar con mi Archivo -->
                <div class="custom-drop-action" onclick="openFilePickerForGroup('${{g.group_id}}')" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDropForGroup(event, '${{g.group_id}}')">
                  <span class="action-icon">📤</span>
                  <div class="action-text">
                    <span class="action-title">Reemplazar con mi Archivo</span>
                    <span class="action-subtitle">Arrastra tu imagen aquí o haz clic para subir</span>
                  </div>
                </div>

                <!-- 4 & 5. Omitir y Deshacer -->
                <div class="secondary-btn-row">
                  <button class="btn-sec btn-skip ${{isSkipped ? 'is-active' : ''}}" onclick="skipGroup('${{g.group_id}}')">
                    ⏭️ Omitir por ahora
                  </button>
                  <button class="btn-sec btn-undo" onclick="undoGroup('${{g.group_id}}')" ${{status === 'pending' ? 'disabled' : ''}}>
                    ↩️ Deshacer decisión
                  </button>
                </div>
              </div>

              ${{altCandidatesHtml}}
            </div>

          </div>
        </div>
      `;
    }}

    function updateCardDOM(groupId) {{
      const grp = CATALOG.groups.find(g => g.group_id === groupId);
      if (!grp) return;
      const cardEl = document.getElementById(`card-${{groupId}}`);
      if (cardEl) {{
        const temp = document.createElement("div");
        temp.innerHTML = renderCard(grp);
        const newCard = temp.firstElementChild;
        cardEl.replaceWith(newCard);
      }} else {{
        renderList();
      }}
    }}

    function renderList() {{
      const container = document.getElementById("list-container");
      const matched = CATALOG.groups.filter(filterGroup);
      if (!matched.length) {{
        container.innerHTML = `
          <div style="background:#fff;border:2px dashed #cbd5e1;border-radius:16px;padding:40px;text-align:center;color:#64748b;">
            <div style="font-size:32px;margin-bottom:8px;">🔍</div>
            <strong style="font-size:16px;color:#0f172a;">No se encontraron ilustraciones para esta pestaña o búsqueda</strong>
            <p style="font-size:13px;margin:6px 0 0;">Prueba seleccionando otra pestaña o limpiando el filtro de búsqueda.</p>
          </div>
        `;
        return;
      }}
      container.innerHTML = matched.map(renderCard).join("");
    }}

    // Navigation and Tab Listeners
    document.querySelectorAll("#tabs .tab").forEach(btn => {{
      btn.addEventListener("click", () => {{
        document.querySelectorAll("#tabs .tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.tab;
        renderList();
      }});
    }});

    document.getElementById("search").addEventListener("input", (e) => {{
      query = e.target.value.trim();
      renderList();
    }});

    // Accept All Recommended
    document.getElementById("btn-accept-recommended").addEventListener("click", () => {{
      let count = 0;
      for (const g of CATALOG.groups) {{
        if (!decisions[g.group_id] || decisions[g.group_id].status === "pending") {{
          const best = g.candidates[0];
          if (best) {{
            const dec = {{
              status: "accepted",
              selected_candidate_id: best.id,
              selected_original_path: best.original_path,
              canonical_target: g.canonical_target,
              updated_at: new Date().toISOString()
            }};
            decisions[g.group_id] = dec;
            sendDecisionToBackend(g.group_id, dec);
            count++;
          }}
        }}
      }}
      saveState();
      renderList();
      alert(`Se aprobaron ${{count}} ilustraciones recomendadas en 1 clic.`);
    }});

    // Save & Export
    document.getElementById("btn-save").addEventListener("click", () => {{
      saveState();
      const blob = new Blob([JSON.stringify({{ exported_at: new Date().toISOString(), decisions }}, null, 2)], {{ type: "application/json" }});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "decisiones-imagenes-cartilla.json";
      a.click();
    }});

    updateHeaderCounter();
    renderList();
  </script>
</body>
</html>
"""

    with open(DOCS_HTML, "w", encoding="utf-8") as f:
        f.write(html_content)

    with open(PUBLIC_HTML, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"- Interfaz rediseñada escrita en: {DOCS_HTML}")
    print(f"- Interfaz rediseñada sincronizada en: {PUBLIC_HTML}")


def main():
    start_time = time.time()
    proofs_manifest = generate_proof_images()
    generate_review_interface(proofs_manifest)
    elapsed = time.time() - start_time
    print(f"\n[ÉXITO] Todo completado satisfactoriamente en {elapsed:.2f} segundos.")


if __name__ == "__main__":
    main()
