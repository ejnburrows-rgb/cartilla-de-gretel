import os
import sys
import json
import zipfile
import shutil
import numpy as np
from PIL import Image

REPO_ROOT = "C:/Users/EJN/Downloads/La Cartilla de Gretel"
INTAKE_BASE = os.path.join(REPO_ROOT, "public", "cartilla", "art", "owner-intake")
BOARD_DATA_FILE = os.path.join(REPO_ROOT, "docs", "art-board", "board-data.json")

def sil(path, n=40):
    try:
        im = Image.open(path).convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        g = np.array(bg.convert('L'))
        a = np.array(im.split()[3])
        m = (g < 235)
        if a.min() < 250:
            m = a > 40
        ys, xs = np.where(m)
        if len(ys) < 20:
            return None, 1.0
        m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        ar = m.shape[1] / max(1, m.shape[0])
        s = np.array(Image.fromarray((m * 255).astype('uint8')).resize((n, n), Image.BILINEAR)) / 255.0
        return s, ar
    except Exception:
        return None, 1.0

def organize_files(input_path):
    os.makedirs(INTAKE_BASE, exist_ok=True)
    temp_extract = os.path.join(INTAKE_BASE, "latest-bulk-upload")
    if os.path.exists(temp_extract):
        shutil.rmtree(temp_extract)
    os.makedirs(temp_extract, exist_ok=True)

    # 1. Handle zip vs folder vs file
    if os.path.isfile(input_path):
        if input_path.lower().endswith(".zip"):
            with zipfile.ZipFile(input_path, 'r') as z:
                z.extractall(temp_extract)
        else:
            shutil.copy2(input_path, os.path.join(temp_extract, os.path.basename(input_path)))
    elif os.path.isdir(input_path):
        for root, _, files in os.walk(input_path):
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in [".png", ".jpg", ".jpeg", ".webp"]:
                    shutil.copy2(os.path.join(root, f), os.path.join(temp_extract, f))

    # Collect images
    image_files = []
    for root, _, files in os.walk(temp_extract):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in [".png", ".jpg", ".jpeg", ".webp"]:
                image_files.append(os.path.join(root, f))

    print(f"Loaded {len(image_files)} image files to organize.")

    # Load canonical drawings
    with open(BOARD_DATA_FILE, "r", encoding="utf-8", errors="replace") as f:
        board_data = json.load(f)
    rows = board_data.get("rows", [])

    cands = []
    for r in rows:
        orig = r.get("original")
        if not orig:
            continue
        p = os.path.join(REPO_ROOT, orig)
        if os.path.exists(p):
            s, ar = sil(p)
            if s is not None:
                cands.append((r, s, ar))

    # Match each image
    organized = []
    for img_path in sorted(image_files):
        fname = os.path.basename(img_path)
        s, ar = sil(img_path)
        if s is None:
            continue

        best_score = -999.0
        best_cand = None
        for r, cs, car in cands:
            iou = np.minimum(s, cs).sum() / max(1e-6, np.maximum(s, cs).sum())
            pen = abs(np.log(ar / car)) if car > 0 and ar > 0 else 0
            score = iou - 0.5 * pen
            if score > best_score:
                best_score = score
                best_cand = r

        if best_cand:
            organized.append({
                "file": fname,
                "path": img_path,
                "score": round(float(best_score), 3),
                "matched_group_id": best_cand.get("group"),
                "matched_placement_id": best_cand.get("id"),
                "label": best_cand.get("appLabel") or best_cand.get("label"),
                "book": best_cand.get("book"),
                "page": best_cand.get("page")
            })

    # Save manifest
    manifest_path = os.path.join(temp_extract, "bulk-match-manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(organized, f, indent=2, ensure_ascii=False)

    print(f"Successfully organized {len(organized)} images into drawing groups.")
    return organized

if __name__ == "__main__":
    target_input = sys.argv[1] if len(sys.argv) > 1 else r"D:\Downloads\image-gen-1(2).zip"
    res = organize_files(target_input)
    print(f"SUMMARY: {len(res)} organized.")
