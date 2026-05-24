import os
import sys
import json
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

# Paths
live_dir = r"C:\Users\enovo\OneDrive\Desktop\cartilla-de-gretel-live"
public_dir = os.path.join(live_dir, "public")
inventory_file = os.path.join(live_dir, "src", "data", "remaster-inventory.json")

def reduce_vertical_seams(img_np):
    """
    Advanced columns normalization to remove scan lines/seams.
    Computes a column-wise profile of white/bright areas and balances columns.
    """
    h, w, c = img_np.shape
    gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
    
    # We find bright pixels (likely background paper)
    bright_mask = gray > 200
    
    # Compute average intensity for each column under the bright mask
    col_avgs = np.zeros(w, dtype=np.float32)
    for col in range(w):
        col_pixels = gray[:, col][bright_mask[:, col]]
        if len(col_pixels) > 0:
            col_avgs[col] = np.mean(col_pixels)
        else:
            col_avgs[col] = 255.0
            
    # Smooth the column averages to get the global trend (removing local striping)
    trend = cv2.GaussianBlur(col_avgs.reshape(1, -1), (1, min(101, w | 1)), 0).flatten()
    
    # Adjust each column to match the local background trend
    corrected = img_np.astype(np.float32)
    for col in range(w):
        if trend[col] > 0 and col_avgs[col] > 0:
            factor = trend[col] / col_avgs[col]
            # Clip factor to prevent aggressive distortions
            factor = np.clip(factor, 0.95, 1.05)
            corrected[:, col] *= factor
            
    return np.clip(corrected, 0, 255).astype(np.uint8)

def remove_paper_cast(img_np, white_percentile=98):
    """
    Performs white balance and stretches contrast to eliminate gray/yellow cast.
    Sets the paper background to a pristine neutral white.
    """
    # Find white point per channel
    channels = cv2.split(img_np)
    stretched_channels = []
    
    for ch in channels:
        # Get the pixel value at the given percentile (e.g. 98%)
        white_val = np.percentile(ch, white_percentile)
        black_val = np.percentile(ch, 2)
        
        # Stretch values
        stretched = (ch.astype(np.float32) - black_val) * (255.0 / (white_val - black_val))
        stretched = np.clip(stretched, 0, 255).astype(np.uint8)
        stretched_channels.append(stretched)
        
    return cv2.merge(stretched_channels)

def read_image_utf8(path):
    """
    Robust reader for paths containing special characters (like ñ) on Windows.
    """
    with open(path, "rb") as f:
        file_bytes = np.frombuffer(f.read(), dtype=np.uint8)
        return cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

def process_remaster(src_abs, dest_abs_v2, mode="projection"):
    """
    Processes the image with one of 4 advanced modes: clean, vivid, projection, soft.
    """
    if not os.path.exists(src_abs):
        print(f"Error: Original scan does not exist at {src_abs}")
        return False
        
    # Read image via robust UTF-8 decoder
    img_bgr = read_image_utf8(src_abs)
    if img_bgr is None:
        print(f"Error: Failed to decode image via OpenCV at {src_abs}")
        return False
        
    # 1. Reduce vertical scan lines / seams
    img_balanced = reduce_vertical_seams(img_bgr)
    
    # 2. Convert to RGB for further steps
    img_rgb = cv2.cvtColor(img_balanced, cv2.COLOR_BGR2RGB)
    
    # 3. Bilateral filter to reduce paper texture noise while preserving sharp edges
    img_filtered = cv2.bilateralFilter(img_rgb, d=7, sigmaColor=25, sigmaSpace=25)
    
    # 4. Remove paper cast & perform white balance
    img_cast_removed = remove_paper_cast(img_filtered, white_percentile=97)
    
    # Convert to Pillow image for enhancements
    pil_img = Image.fromarray(img_cast_removed)
    
    # Mode-specific tunings
    if mode == "clean":
        # Balanced contrast and neutral feel
        contrast_enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = contrast_enhancer.enhance(1.10)
        color_enhancer = ImageEnhance.Color(pil_img)
        pil_img = color_enhancer.enhance(1.05)
        pil_img = pil_img.filter(ImageFilter.SHARPEN)
        
    elif mode == "vivid":
        # Enhanced saturated colors for illustration pop
        contrast_enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = contrast_enhancer.enhance(1.20)
        color_enhancer = ImageEnhance.Color(pil_img)
        pil_img = color_enhancer.enhance(1.25) # Enhanced saturation
        pil_img = pil_img.filter(ImageFilter.SHARPEN)
        
    elif mode == "projection":
        # Maximum background whitening and extra text/illustration contrast for high-brightness classroom projectors
        contrast_enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = contrast_enhancer.enhance(1.25)
        color_enhancer = ImageEnhance.Color(pil_img)
        pil_img = color_enhancer.enhance(1.15)
        # Extra light sharpening pass
        pil_img = pil_img.filter(ImageFilter.SHARPEN)
        pil_img = pil_img.filter(ImageFilter.EDGE_ENHANCE)
        
    elif mode == "soft":
        # Soft paper texture preservation, light contrast
        contrast_enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = contrast_enhancer.enhance(1.05)
        color_enhancer = ImageEnhance.Color(pil_img)
        pil_img = color_enhancer.enhance(1.0)
        
    # Save the remastered V2 candidate as JPEG
    os.makedirs(os.path.dirname(dest_abs_v2), exist_ok=True)
    pil_img.save(dest_abs_v2, "JPEG", quality=95)
    print(f"Processed V2 [{mode}] output saved to {dest_abs_v2}")
    return True

def run_visual_remaster_sprint():
    # 1. Core mapping list for our V2 sprint samples
    tasks = [
        # Student L14 page 47 (maps to ñ-page-28)
        {
            "match_key": "page-28.jpg",
            "rel_v2": "/cartilla/images/remastered/student-workbook/student-l14-page-47-remaster-v2.jpg",
            "type": "student-workbook"
        },
        # Student L17 page 59 (maps to r-page-37)
        {
            "match_key": "r-page-37.jpg",
            "rel_v2": "/cartilla/images/remastered/student-workbook/student-l17-page-59-remaster-v2.jpg",
            "type": "student-workbook"
        },
        # Student L21 page 75 (maps to j-page-49)
        {
            "match_key": "j-page-49.jpg",
            "rel_v2": "/cartilla/images/remastered/student-workbook/student-l21-page-75-remaster-v2.jpg",
            "type": "student-workbook"
        },
        # Student L24 page 87 (maps to z-page-58)
        {
            "match_key": "z-page-58.jpg",
            "rel_v2": "/cartilla/images/remastered/student-workbook/student-l24-page-87-remaster-v2.jpg",
            "type": "student-workbook"
        },
        # Teacher page 1 (teacher-page-01)
        {
            "match_key": "teacher-page-01.jpg",
            "rel_v2": "/cartilla/images/remastered/teacher-flipchart/teacher-page-001-remaster-v2.jpg",
            "type": "teacher-flipchart"
        },
        # Teacher page 2 (teacher-page-02)
        {
            "match_key": "teacher-page-02.jpg",
            "rel_v2": "/cartilla/images/remastered/teacher-flipchart/teacher-page-002-remaster-v2.jpg",
            "type": "teacher-flipchart"
        }
    ]

    # Load inventory to find original source paths
    if not os.path.exists(inventory_file):
        print(f"Inventory file not found: {inventory_file}")
        return
        
    with open(inventory_file, "r", encoding="utf-8") as f:
        inventory = json.load(f)

    updated_count = 0
    
    for task in tasks:
        # Find matching asset in remaster-inventory by checking file name match in originalSourcePath
        asset = None
        for a in inventory["assets"]:
            if task["match_key"] in a["originalSourcePath"]:
                asset = a
                break
                
        if not asset:
            print(f"Skipping: Count not find matching inventory asset for {task['match_key']}")
            continue
            
        src_abs = os.path.join(public_dir, asset["originalSourcePath"].lstrip("/"))
        dest_abs_v2 = os.path.join(public_dir, task["rel_v2"].lstrip("/"))
        
        # We will use the optimized "projection" mode as our core remaster V2 review candidate
        if process_remaster(src_abs, dest_abs_v2, mode="projection"):
            # Update asset metadata fields exactly as requested
            asset["remasteredPathV2"] = task["rel_v2"]
            asset["cleanupStatus"] = "needs review"
            asset["approvalStatus"] = "pending"
            asset["remasterVersion"] = "v2"
            asset["artifactLineFixAttempted"] = True
            asset["approvedForStudent"] = False
            asset["approvedForTeacher"] = False
            asset["notes"] = "V2 stronger cleanup sample for visual approval"
            updated_count += 1
            print(f"Updated inventory metadata for {asset['originalSourcePath']}")
            
    # Save back inventory
    with open(inventory_file, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)
        
    print(f"\n--- SUCCESS ---")
    print(f"Successfully processed {updated_count} advanced V2 remaster samples.")
    print(f"Updated remaster-inventory.json cleanly.")

if __name__ == "__main__":
    run_visual_remaster_sprint()
