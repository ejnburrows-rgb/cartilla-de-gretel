import cv2
import numpy as np
import os
from PIL import Image, ImageEnhance, ImageFilter

def process_flipchart_page(src_path, dest_path):
    # Read the image
    with open(src_path, "rb") as f:
        file_bytes = np.frombuffer(f.read(), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        print(f"Failed to read {src_path}")
        return False

    # 1. Edge-preserving filter for vector-clean flat fills
    # flags=1 is RECURS_FILTER, which is faster. 
    # sigma_s controls spatial smoothing, sigma_r controls color similarity.
    print("Applying edge preserving filter...")
    smoothed = cv2.edgePreservingFilter(img, flags=1, sigma_s=60, sigma_r=0.4)
    
    # 2. Remove paper cast and set background to #fff8e8 (BGR: 232, 248, 255)
    print("Applying white balance...")
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
    
    # Convert to PIL for enhancement
    print("Applying enhancements...")
    pil_img = Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
    
    # Increase saturation (vibrant)
    color_enhancer = ImageEnhance.Color(pil_img)
    pil_img = color_enhancer.enhance(1.4)
    
    # Increase contrast
    contrast_enhancer = ImageEnhance.Contrast(pil_img)
    pil_img = contrast_enhancer.enhance(1.2)
    
    # Unsharp mask for crisp line art
    pil_img = pil_img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    pil_img.save(dest_path, format="PNG")
    print(f"Saved {dest_path}")
    return True

if __name__ == "__main__":
    src = r"public\cartilla\art\raw\flipchart\page-001.png"
    dst = r"public\cartilla\art\color\flipchart\page-001.png"
    process_flipchart_page(src, dst)
