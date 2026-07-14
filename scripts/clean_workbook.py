import cv2
import numpy as np
import os
import glob
from pathlib import Path
from rembg import remove, new_session
from PIL import Image

def deskew(image):
    # Deskewing process: convert to grayscale, find edges, get angle of longest lines
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
    
    if lines is not None:
        angles = []
        for r, theta in lines[0]:
            angle = np.degrees(theta)
            if angle < 45:
                angles.append(angle)
            elif angle > 135:
                angles.append(angle - 180)
        
        if angles:
            median_angle = np.median(angles)
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            return rotated
    return image

def autocrop(image):
    # Remove gray margins/borders by finding the bounding box of non-background content
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    coords = cv2.findNonZero(thresh)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        # add a small padding
        padding = 10
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(image.shape[1] - x, w + 2*padding)
        h = min(image.shape[0] - y, h + 2*padding)
        return image[y:y+h, x:x+w]
    return image

def clean_image(image):
    # Deskew and crop
    img = deskew(image)
    img = autocrop(img)
    
    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    cl1 = clahe.apply(gray)
    
    # Adaptive threshold for crisp black ink lines
    # Using a slight blur to keep anti-aliasing but thresholding out the noise
    blur = cv2.GaussianBlur(cl1, (5,5), 0)
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Despeckle small scanner noise (using median blur or morphology)
    despeckled = cv2.medianBlur(thresh, 3)
    
    # Create an RGB image from the processed grayscale
    cleaned_bgr = cv2.cvtColor(despeckled, cv2.COLOR_GRAY2BGR)
    
    return cleaned_bgr

def main():
    source_dir = Path('public/cartilla/images/source')
    output_dir = Path('public/cartilla/art/hd/lineart')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # We create a new BiRefNet session for rembg
    print("Initializing rembg session...", flush=True)
    session = new_session('u2net')
    print("Session initialized.", flush=True)
    
    files = list(source_dir.glob('**/*.jpg')) + list(source_dir.glob('**/*.png'))
    contact_sheet_items = []
    
    for f in files:
        if 'source-original' in str(f):
            continue
            
        out_name = Path(f.name).with_suffix('.png').name
        out_path = output_dir / out_name
        
        # Prepare contact sheet item
        contact_sheet_items.append((str(f), str(out_path)))
        
        if out_path.exists():
            print(f"Skipping {f.name}, already exists.", flush=True)
            continue
            
        print(f"Processing {f.name}...", flush=True)
        
        # Read image with unicode path support
        stream = np.fromfile(str(f), dtype=np.uint8)
        img = cv2.imdecode(stream, cv2.IMREAD_COLOR)
        if img is None:
            print(f"Failed to read {f}")
            continue
            
        # Clean image
        cleaned = clean_image(img)
        
        # Convert to PIL for rembg
        cleaned_pil = Image.fromarray(cv2.cvtColor(cleaned, cv2.COLOR_BGR2RGB))
        
        # Remove background using rembg u2net
        output_pil = remove(cleaned_pil, session=session, post_process_mask=True)
        
        # Save output
        output_pil.save(out_path)
        
    print(f"Processed {len(contact_sheet_items)} pages.")
    
    # Produce contact sheet
    if not contact_sheet_items:
        return
        
    thumb_h = 400
    thumb_w = 400
    contact_sheet_w = thumb_w * 2 # 2 columns: source, cleaned
    contact_sheet_h = thumb_h * len(contact_sheet_items)
    
    contact_sheet = Image.new('RGB', (contact_sheet_w, contact_sheet_h), (255,255,255))
    
    for idx, (src_path, out_path) in enumerate(contact_sheet_items):
        try:
            src_img = Image.open(src_path)
            src_img.thumbnail((thumb_w, thumb_h))
            
            out_img = Image.open(out_path)
            # composite with white background for visibility
            out_bg = Image.new('RGB', out_img.size, (255,255,255))
            if len(out_img.split()) == 4:
                out_bg.paste(out_img, mask=out_img.split()[3])
            else:
                out_bg.paste(out_img)
            out_bg.thumbnail((thumb_w, thumb_h))
            
            y_offset = idx * thumb_h
            
            contact_sheet.paste(src_img, (0, y_offset))
            contact_sheet.paste(out_bg, (thumb_w, y_offset))
        except Exception as e:
            print(f"Failed contact sheet for {src_path}: {e}")
            
    contact_sheet_path = Path('scripts/output/qa_contact_sheet.jpg')
    contact_sheet_path.parent.mkdir(parents=True, exist_ok=True)
    
    contact_sheet.save(contact_sheet_path, 'JPEG', quality=85)
    print(f"Contact sheet saved to {contact_sheet_path}")

if __name__ == '__main__':
    main()
