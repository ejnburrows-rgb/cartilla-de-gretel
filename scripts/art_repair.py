import cv2
import numpy as np
from PIL import Image
import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
WB_DIR = REPO / "public/cartilla/art/hd/workbook"
FC_DIR = REPO / "public/cartilla/images/source"
FAITHFUL_DIR = REPO / "public/cartilla/art/faithful"
QA_DIR = REPO / "generated/art-repair-qa"
QA_DIR.mkdir(parents=True, exist_ok=True)

def remove_background_simple(img):
    """Make near-white pixels transparent."""
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)
    rgba[mask == 255, 3] = 0
    return rgba

def save_webp(img_bgra, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray(cv2.cvtColor(img_bgra, cv2.COLOR_BGRA2RGBA))
    im.save(path, format="WEBP", quality=90, lossless=False)

def crop_ojos():
    wb_scan = cv2.imread(str(WB_DIR / "page-004.png"))
    # PAGE-004-OBJECT-16 bounding box
    x, y, w, h = 1813, 2329, 527, 569
    crop = wb_scan[y:y+h, x:x+w]
    
    # Save original for before/after
    out_path = FAITHFUL_DIR / "vocal-o/ojos.webp"
    if out_path.exists():
        before_im = cv2.imread(str(out_path), cv2.IMREAD_UNCHANGED)
        cv2.imwrite(str(QA_DIR / "ojos_before.png"), before_im)
    
    bgra = remove_background_simple(crop)
    save_webp(bgra, out_path)
    cv2.imwrite(str(QA_DIR / "ojos_after.png"), bgra)
    
    # Proof
    flip = cv2.rotate(crop, cv2.ROTATE_180)
    proof = np.hstack([crop, flip])
    cv2.imwrite(str(QA_DIR / "ojos_proof.jpg"), proof)
    print("Ojos repaired and saved.")

def match_and_crop(template, search_img, out_path, name):
    sh, sw = search_img.shape[:2]
    th, tw = template.shape[:2]
    
    # Match scales: Flipcharts are usually large.
    s = 0.5
    ns = cv2.resize(search_img, (0, 0), fx=s, fy=s)
    nt = cv2.resize(template, (0, 0), fx=s, fy=s)
    
    gg = cv2.cvtColor(ns, cv2.COLOR_BGR2GRAY)
    gt = cv2.cvtColor(nt, cv2.COLOR_BGR2GRAY)
    
    res = cv2.matchTemplate(gg, gt, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(res)
    
    rx, ry = int(max_loc[0]/s), int(max_loc[1]/s)
    crop = search_img[ry:ry+th, rx:rx+tw]
    
    if out_path.exists():
        before_im = cv2.imread(str(out_path), cv2.IMREAD_UNCHANGED)
        if before_im is not None:
            cv2.imwrite(str(QA_DIR / f"{name}_before.png"), before_im)
            
    bgra = remove_background_simple(crop)
    save_webp(bgra, out_path)
    cv2.imwrite(str(QA_DIR / f"{name}_after.png"), bgra)
    
    flip = cv2.rotate(crop, cv2.ROTATE_180)
    proof = np.hstack([crop, flip])
    cv2.imwrite(str(QA_DIR / f"{name}_proof.jpg"), proof)
    print(f"{name} repaired with val {max_val:.4f}.")
    return max_val

def crop_oreja_abeja():
    wb_p4 = cv2.imread(str(WB_DIR / "page-004.png"))
    wb_p7 = cv2.imread(str(WB_DIR / "page-007.png"))
    
    # Oreja template from page 4 (1813,1175,527,569)
    oreja_tpl = wb_p4[1175:1175+569, 1813:1813+527]
    o_scan = cv2.imread(str(FC_DIR / "o/o-page-3.jpg"))
    match_and_crop(oreja_tpl, o_scan, FAITHFUL_DIR / "vocal-o/oreja.webp", "oreja")
    
    # Abeja template from page 7 (743,1175,527,569)
    abeja_tpl = wb_p7[1175:1175+569, 743:743+527]
    a_scan = cv2.imread(str(FC_DIR / "a/a-page-4.jpg"))
    if a_scan is None:
        a_scan = cv2.imread(str(FC_DIR / "a/a-page-4.png"))
    match_and_crop(abeja_tpl, a_scan, FAITHFUL_DIR / "vocal-a/abeja.webp", "abeja")

def load_bgr_transparent(p):
    if not Path(p).is_file() or Path(p).stat().st_size == 0:
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
        return None

def verify_page_4():
    layouts = json.loads((REPO / "src/data/page-layouts.json").read_text(encoding="utf-8"))
    page4 = layouts["pages"]["4"]
    wb_scan = cv2.imread(str(WB_DIR / "page-004.png"))
    
    h, w = wb_scan.shape[:2]
    y0, y1 = int(h * 0.15), int(h * 0.95)
    x0, x1 = int(w * 0.05), int(w * 0.95)
    grid = wb_scan[y0:y1, x0:x1]
    gg = cv2.cvtColor(cv2.resize(grid, (0, 0), fx=0.25, fy=0.25), cv2.COLOR_BGR2GRAY)
    
    report_lines = []
    
    for r in page4.get("regions", []):
        if r["regionType"] != "picture-grid": continue
        for c in r.get("cells", []):
            src = c.get("illustrationSrc")
            if not src: continue
            asset_path = REPO / "public" / src.lstrip("/")
            asset = load_bgr_transparent(asset_path)
            if asset is None: continue
            
            ga = cv2.cvtColor(cv2.resize(asset, (0, 0), fx=0.25, fy=0.25), cv2.COLOR_BGR2GRAY)
            res_up = cv2.matchTemplate(gg, ga, cv2.TM_CCOEFF_NORMED)
            _, max_val_up, _, _ = cv2.minMaxLoc(res_up)
            
            ga_flip = cv2.rotate(ga, cv2.ROTATE_180)
            res_flip = cv2.matchTemplate(gg, ga_flip, cv2.TM_CCOEFF_NORMED)
            _, max_val_flip, _, _ = cv2.minMaxLoc(res_flip)
            
            if max_val_up > max_val_flip + 0.05:
                verdict = "VERIFIED-UPRIGHT"
            elif max_val_flip > max_val_up + 0.05:
                verdict = "FIXED (Rotated 180)"
                # Fix it on disk
                im = Image.open(asset_path)
                im = im.rotate(180)
                im.save(asset_path, format="WEBP", quality=90, lossless=False)
            else:
                verdict = "UNPROVABLE (Gap < 0.05)"
                
            report_lines.append(f"| `{src}` | `page-004.png` | MatchTemplate (0.25x scale) | {max_val_up:.3f} | {max_val_flip:.3f} | {verdict} |")
            
    return report_lines

if __name__ == "__main__":
    print("Cropping Ojos...")
    crop_ojos()
    print("Cropping Oreja/Abeja...")
    crop_oreja_abeja()
    print("Verifying Page 4...")
    lines = verify_page_4()
    
    md = [
        "# ART REPAIR AUDIT REPORT",
        "",
        "## Page 4 Asset Verification",
        "| Asset | Source Region | Method | Upright NCC | Flipped NCC | Verdict |",
        "|---|---|---|---|---|---|",
    ] + lines + [
        "",
        "## Additional Repairs",
        "| Asset | Notes |",
        "|---|---|",
        "| `vocal-o/ojos.webp` | Clean high-resolution re-crop from workbook `page-004.png` upright scan |",
        "| `vocal-o/oreja.webp` | Extracted from flipchart `o-page-3.jpg` using workbook template matching |",
        "| `vocal-a/abeja.webp` | Extracted from flipchart `a-page-4.jpg` using workbook template matching |",
        "",
        "All before/after and proof side-by-side images are saved in `generated/art-repair-qa/`."
    ]
    
    (REPO / "AUDIT/ART-REPAIR-REPORT.md").parent.mkdir(parents=True, exist_ok=True)
    (REPO / "AUDIT/ART-REPAIR-REPORT.md").write_text("\n".join(md))
    print("Wrote AUDIT/ART-REPAIR-REPORT.md")
