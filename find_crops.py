import json
import cv2
import numpy as np
import os
import glob
import sys
from pathlib import Path

def imread_unicode(path):
    try:
        stream = np.fromfile(path, dtype=np.uint8)
        img = cv2.imdecode(stream, cv2.IMREAD_COLOR)
        return img
    except:
        return None

def run():
    manifest_path = "public/cartilla/art/faithful/manifest.json"
    source_dir = "public/cartilla/images/source"
    report_path = "PROVENANCE-BACKFILL-REPORT.md"
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    missing_entries = [e for e in manifest if e.get("cropBox") is None]
    print(f"Found {len(missing_entries)} missing entries.", flush=True)
    
    report_lines = []
    
    for idx, entry in enumerate(missing_entries):
        slug = entry["slug"]
        src_path = "public" + entry["src"]
        
        # Determine candidate source folders based on src_path
        candidates = []
        if "vocal-" in src_path:
            candidates.extend(glob.glob(os.path.join(source_dir, "vocales", "*.jpg")))
            # Also add specific vowel folders
            letter = src_path.split("vocal-")[1].split("/")[0]
            candidates.extend(glob.glob(os.path.join(source_dir, letter, "*.jpg")))
        elif "leccion-" in src_path:
            # e.g., leccion-19-c
            parts = src_path.split("leccion-")[1].split("/")[0].split("-")
            if len(parts) > 1:
                letter = parts[1]
                candidates.extend(glob.glob(os.path.join(source_dir, letter, "*.jpg")))
            # leccion-1
            elif parts[0] == "1":
                candidates.extend(glob.glob(os.path.join(source_dir, "vocales", "*.jpg")))
        
        # If no heuristic matched, check all (or fallback to report)
        if not candidates:
            candidates = glob.glob(os.path.join(source_dir, "**", "*.jpg"), recursive=True)
            
        print(f"[{idx+1}/{len(missing_entries)}] {slug}: {len(candidates)} candidate pages.", flush=True)
        
        if not os.path.exists(src_path):
            entry["provenanceStatus"] = "PROVENANCE-UNKNOWN"
            report_lines.append(f"{slug}: Crop file not found on disk.")
            continue
            
        crop_img = imread_unicode(src_path)
        if crop_img is None:
            entry["provenanceStatus"] = "PROVENANCE-UNKNOWN"
            report_lines.append(f"{slug}: Crop file could not be read.")
            continue
            
        h, w = crop_img.shape[:2]
        
        best_val = -1
        best_loc = None
        best_source = None
        
        for s_file in candidates:
            s_img = imread_unicode(s_file)
            if s_img is None: continue
            
            if s_img.shape[0] >= h and s_img.shape[1] >= w:
                res = cv2.matchTemplate(s_img, crop_img, cv2.TM_CCOEFF_NORMED)
                min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
                
                if max_val > best_val:
                    best_val = max_val
                    best_loc = max_loc
                    best_source = s_file
                    
            if best_val > 0.95:
                break
                
        print(f" -> Best match {best_val:.3f} in {best_source}", flush=True)
        
        if best_val > 0.8:
            entry["cropBox"] = [best_loc[0], best_loc[1], w, h]
            entry["sourceFlipchartPage"] = os.path.basename(best_source)
        else:
            entry["provenanceStatus"] = "PROVENANCE-UNKNOWN"
            report_lines.append(f"{slug}: Best template match score was {best_val:.3f}, below confidence threshold.")

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    if report_lines:
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("# Provenance Backfill Report\n\n")
            f.write("\n".join(report_lines) + "\n")
            
    print("Done.", flush=True)

if __name__ == "__main__":
    run()
