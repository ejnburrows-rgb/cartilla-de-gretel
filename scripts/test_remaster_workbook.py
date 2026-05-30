import cv2
import numpy as np
import hashlib
import os

def deterministic_hash(val_str):
    return int(hashlib.md5(val_str.encode()).hexdigest(), 16)

def get_color(cnt, img_w, img_h):
    area = cv2.contourArea(cnt)
    x, y, w, h = cv2.boundingRect(cnt)
    
    # Ignore tiny speckle contours or massive background contour
    if area < 200 or area > (img_w * img_h * 0.8):
        return None 
    
    # Avoid coloring very long lines or frames
    if w > img_w * 0.9 or h > img_h * 0.9:
        return None
        
    aspect = round(w / float(h), 1)
    norm_area = round(area / float(img_w * img_h), 3)
    
    hash_val = deterministic_hash(f"{aspect}_{norm_area}")
    
    colors = [
        (61, 52, 20),      # Teal #14343d
        (103, 191, 233),   # Gold #e9bf67
        (49, 114, 154),    # Brown #9a7231
        (193, 182, 255),   # Pink #ffb6c1
        (230, 216, 173),   # Blue #add8e6
        (144, 238, 144),   # Green #90ee90
        (185, 218, 255),   # Orange #ffdab9
        (221, 160, 221),   # Purple #dda0dd
        (224, 255, 255)    # Yellow #ffffe0
    ]
    return colors[hash_val % len(colors)]

def process_workbook_page(src, dst):
    print(f"Processing {src}")
    with open(src, "rb") as f:
        file_bytes = np.frombuffer(f.read(), dtype=np.uint8)
        img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        
    if img_bgr is None:
        print(f"Failed to read {src}")
        return False
        
    # Rotate if width > height
    h, w, _ = img_bgr.shape
    if w > h:
        img_bgr = cv2.rotate(img_bgr, cv2.ROTATE_90_CLOCKWISE)
        h, w, _ = img_bgr.shape
        
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # 1. Binarize to get pure black lines
    _, thresh = cv2.threshold(img_gray, 200, 255, cv2.THRESH_BINARY)
    
    # Lines mask (lines = 255, bg = 0)
    lines_mask = cv2.bitwise_not(thresh)
    
    # Clean speckles from lines mask
    cnts, _ = cv2.findContours(lines_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in cnts:
        if cv2.contourArea(cnt) < 15:
            cv2.drawContours(lines_mask, [cnt], -1, 0, -1)
            
    # 2. Shape filling
    # Find background shapes
    bg_thresh = cv2.bitwise_not(lines_mask)
    shape_cnts, hierarchy = cv2.findContours(bg_thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create clean background
    color_bg = np.full((h, w, 3), (232, 248, 255), dtype=np.uint8) # Cream #fff8e8
    
    if hierarchy is not None:
        for i, cnt in enumerate(shape_cnts):
            color = get_color(cnt, w, h)
            if color:
                cv2.drawContours(color_bg, [cnt], -1, color, -1)
                
    # 3. Overlay pure black lines
    # Using the cleaned lines mask, set pixels to 0,0,0
    color_bg[lines_mask == 255] = (0, 0, 0)
    
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "wb") as f:
        is_success, buffer = cv2.imencode(".png", color_bg)
        if is_success:
            f.write(buffer)
    return True

if __name__ == "__main__":
    src = r"public\cartilla\art\raw\workbook\page-001.png"
    dst = r"public\cartilla\art\color\workbook\page-001.png"
    process_workbook_page(src, dst)
