import cv2
import numpy as np
import os
import glob
from PIL import Image, ImageEnhance, ImageFilter
from concurrent.futures import ThreadPoolExecutor

def reduce_vertical_seams(img_np):
    h, w, c = img_np.shape
    gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
    bright_mask = gray > 200
    col_avgs = np.zeros(w, dtype=np.float32)
    for col in range(w):
        col_pixels = gray[:, col][bright_mask[:, col]]
        if len(col_pixels) > 0:
            col_avgs[col] = np.mean(col_pixels)
        else:
            col_avgs[col] = 255.0
            
    trend = cv2.GaussianBlur(col_avgs.reshape(1, -1), (1, min(101, w | 1)), 0).flatten()
    corrected = img_np.astype(np.float32)
    for col in range(w):
        if trend[col] > 0 and col_avgs[col] > 0:
            factor = trend[col] / col_avgs[col]
            factor = np.clip(factor, 0.95, 1.05)
            corrected[:, col] *= factor
    return np.clip(corrected, 0, 255).astype(np.uint8)

def process_flipchart_page(src_path, dest_path):
    # Read the image
    with open(src_path, "rb") as f:
        file_bytes = np.frombuffer(f.read(), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        print(f"Failed to read {src_path}")
        return False
        
    print(f"Processing {os.path.basename(src_path)}...")

    # 1. Reduce vertical seams (scan lines)
    img_balanced = reduce_vertical_seams(img)

    # 2. Edge-preserving filter for vector-clean flat fills
    smoothed = cv2.edgePreservingFilter(img_balanced, flags=1, sigma_s=60, sigma_r=0.4)
    
    # 3. Remove paper cast and set background to #fff8e8 (BGR: 232, 248, 255)
    channels = cv2.split(smoothed)
    target_bgr = [232, 248, 255]
    stretched_channels = []
    
    for ch, tgt in zip(channels, target_bgr):
        p_white = np.percentile(ch, 95)
        p_black = np.percentile(ch, 2)
        if p_white > p_black:
            stretched = (ch.astype(np.float32) - p_black) * (tgt / (p_white - p_black))
            stretched = np.clip(stretched, 0, 255).astype(np.uint8)
        else:
            stretched = ch
        stretched_channels.append(stretched)
        
    result = cv2.merge(stretched_channels)
    
    # 4. Enhance colors and contrast
    pil_img = Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
    
    color_enhancer = ImageEnhance.Color(pil_img)
    pil_img = color_enhancer.enhance(1.4)
    
    contrast_enhancer = ImageEnhance.Contrast(pil_img)
    pil_img = contrast_enhancer.enhance(1.2)
    
    # Unsharp mask for crisp line art
    pil_img = pil_img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    pil_img.save(dest_path, format="PNG")
    print(f"Saved {dest_path}")
    return True

def main():
    base_dir = r"C:\Users\Adrian\.gemini\antigravity\scratch\cartilla-de-gretel"
    src_dir = os.path.join(base_dir, "public", "cartilla", "art", "raw", "flipchart")
    dest_dir = os.path.join(base_dir, "public", "cartilla", "art", "color", "flipchart")
    
    # Fallback to hd/flipchart if raw is empty or not exists
    if not os.path.exists(src_dir) or len(glob.glob(os.path.join(src_dir, "*.png"))) == 0:
        print("Falling back to HD flipchart directory...")
        src_dir = os.path.join(base_dir, "public", "cartilla", "art", "hd", "flipchart")
        
    files = sorted(glob.glob(os.path.join(src_dir, "*.png")))
    
    if not files:
        print(f"No PNG files found in {src_dir}")
        return
        
    print(f"Found {len(files)} files to process in {src_dir}...")
    
    # Process files sequentially to avoid high memory usage
    for f in files:
        dest_path = os.path.join(dest_dir, os.path.basename(f))
        process_flipchart_page(f, dest_path)

if __name__ == "__main__":
    main()
