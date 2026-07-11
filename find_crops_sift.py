import json
import cv2
import numpy as np
import os
import glob
import sys

def imread_unicode(path):
    try:
        stream = np.fromfile(path, dtype=np.uint8)
        return cv2.imdecode(stream, cv2.IMREAD_COLOR)
    except:
        return None

def find_crop_sift(s_img, crop_img):
    sift = cv2.SIFT_create()
    kp1, des1 = sift.detectAndCompute(crop_img, None)
    kp2, des2 = sift.detectAndCompute(s_img, None)
    
    if des1 is None or des2 is None or len(kp1) < 4 or len(kp2) < 4:
        return None
        
    bf = cv2.BFMatcher()
    matches = bf.knnMatch(des1, des2, k=2)
    
    good = []
    for m, n in matches:
        if m.distance < 0.75 * n.distance:
            good.append(m)
            
    if len(good) < 10:
        return None
        
    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    
    M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
    if M is None:
        return None
        
    h, w = crop_img.shape[:2]
    pts = np.float32([[0, 0], [0, h-1], [w-1, h-1], [w-1, 0]]).reshape(-1, 1, 2)
    dst = cv2.perspectiveTransform(pts, M)
    
    # Get bounding box
    xs = dst[:, 0, 0]
    ys = dst[:, 0, 1]
    
    x, y, w_new, h_new = int(np.min(xs)), int(np.min(ys)), int(np.max(xs) - np.min(xs)), int(np.max(ys) - np.min(ys))
    
    # Ensure reasonable coordinates
    if w_new <= 0 or h_new <= 0 or x < 0 or y < 0 or x+w_new > s_img.shape[1] or y+h_new > s_img.shape[0]:
        return None
        
    return [x, y, w_new, h_new], len(good)

def run():
    manifest_path = "public/cartilla/art/faithful/manifest.json"
    source_dir = "public/cartilla/images/source"
    report_path = "PROVENANCE-BACKFILL-REPORT.md"
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    missing_entries = [e for e in manifest if e.get("cropBox") is None]
    # We will re-check even those marked unknown in previous runs
    missing_entries = [e for e in manifest if e.get("cropBox") is None and e.get("provenanceStatus") != "PROVENANCE-UNKNOWN-MANUAL-IGNORE"] 
    # Actually wait, let's just check all that don't have cropBox
    missing_entries = [e for e in manifest if e.get("cropBox") is None]
    
    print(f"Found {len(missing_entries)} missing entries.", flush=True)
    
    report_lines = []
    
    for idx, entry in enumerate(missing_entries):
        slug = entry["slug"]
        src_path = "public" + entry["src"]
        
        candidates = []
        if "vocal-" in src_path:
            candidates.extend(glob.glob(os.path.join(source_dir, "vocales", "*.jpg")))
            letter = src_path.split("vocal-")[1].split("/")[0]
            candidates.extend(glob.glob(os.path.join(source_dir, letter, "*.jpg")))
        elif "leccion-" in src_path:
            parts = src_path.split("leccion-")[1].split("/")[0].split("-")
            if len(parts) > 1:
                letter = parts[1]
                candidates.extend(glob.glob(os.path.join(source_dir, letter, "*.jpg")))
            elif parts[0] == "1":
                candidates.extend(glob.glob(os.path.join(source_dir, "vocales", "*.jpg")))
                
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
            
        best_matches = 0
        best_box = None
        best_source = None
        
        for s_file in candidates:
            s_img = imread_unicode(s_file)
            if s_img is None: continue
            
            res = find_crop_sift(s_img, crop_img)
            if res is not None:
                box, matches = res
                if matches > best_matches:
                    best_matches = matches
                    best_box = box
                    best_source = s_file
                    
        if best_matches >= 10:
            print(f" -> MATCH in {best_source} with {best_matches} good matches.", flush=True)
            entry["cropBox"] = best_box
            entry["sourceFlipchartPage"] = os.path.basename(best_source)
            if "provenanceStatus" in entry:
                del entry["provenanceStatus"]
        else:
            print(f" -> NO MATCH found (best was {best_matches} matches)", flush=True)
            entry["provenanceStatus"] = "PROVENANCE-UNKNOWN"
            report_lines.append(f"{slug}: Could not confidently find crop in source images (SIFT matches: {best_matches}).")

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    if report_lines:
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("# Provenance Backfill Report\n\n")
            f.write("\n".join(report_lines) + "\n")
            
    print("Done.", flush=True)

if __name__ == "__main__":
    run()
