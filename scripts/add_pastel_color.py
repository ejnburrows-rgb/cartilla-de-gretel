import os
import sys
from PIL import Image, ImageEnhance, ImageFilter, ImageColor

# Paths
project_dir = r"C:\Users\Adrian\CascadeProjects\cartilla-de-gretel"
workbook_dir = os.path.join(project_dir, "public", "cartilla", "art", "hd", "workbook")

# Pastel color palette for different elements
PASTEL_COLORS = {
    "background": (255, 248, 240),      # Warm cream
    "lines": (80, 80, 80),               # Dark gray (not pure black)
    "accent_1": (255, 182, 193),         # Pastel pink
    "accent_2": (173, 216, 230),         # Pastel blue
    "accent_3": (144, 238, 144),         # Pastel green
    "accent_4": (255, 218, 185),         # Pastel orange
    "accent_5": (221, 160, 221),         # Pastel purple
    "accent_6": (255, 255, 224),         # Pastel yellow
}

def add_pastel_color_to_page(image_path, output_path):
    """
    Add pastel color to a workbook page while preserving all lines, letters, and layout.
    This is a 1:1 coloring - no redrawing, remastering, or vectorizing.
    """
    if not os.path.exists(image_path):
        print(f"Error: Image does not exist at {image_path}")
        return False
    
    # Read image using PIL
    try:
        pil_img = Image.open(image_path)
        # Convert to RGB if necessary
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
    except Exception as e:
        print(f"Error: Failed to read image at {image_path}: {e}")
        return False
    
    # Create a pastel tint overlay
    # We'll use a soft color overlay that preserves the original structure
    width, height = pil_img.size
    
    # Create a pastel background layer
    pastel_bg = Image.new("RGB", (width, height), PASTEL_COLORS["background"])
    
    # Blend the original image with pastel background
    # This adds subtle color while preserving all original details
    blended = Image.blend(pil_img, pastel_bg, 0.15)  # 15% pastel tint
    
    # Enhance slightly to maintain contrast
    enhancer = ImageEnhance.Contrast(blended)
    blended = enhancer.enhance(1.05)
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save as high-quality JPEG
    blended.save(output_path, "JPEG", quality=95)
    print(f"Colored page saved to {output_path}")
    return True

def process_vowel_pages():
    """Process vowel pages in order: O (4-6), A (7-9), E (10-12), I (13-15), U (16-18)"""
    vowel_ranges = [
        ("O", 4, 6),
        ("A", 7, 9),
        ("E", 10, 12),
        ("I", 13, 15),
        ("U", 16, 18),
    ]
    
    for vowel, start, end in vowel_ranges:
        print(f"\nProcessing vowel {vowel} (pages {start}-{end})...")
        for page_num in range(start, end + 1):
            page_filename = f"page-{page_num:03d}.jpg"
            input_path = os.path.join(workbook_dir, page_filename)
            output_path = os.path.join(workbook_dir, page_filename)  # Overwrite existing
            
            if os.path.exists(input_path):
                add_pastel_color_to_page(input_path, output_path)
            else:
                print(f"Warning: {page_filename} not found")

def process_all_pages():
    """Process all workbook pages (1-92)"""
    print("Processing all workbook pages (1-92)...")
    for page_num in range(1, 93):
        page_filename = f"page-{page_num:03d}.jpg"
        input_path = os.path.join(workbook_dir, page_filename)
        output_path = os.path.join(workbook_dir, page_filename)  # Overwrite existing
        
        if os.path.exists(input_path):
            add_pastel_color_to_page(input_path, output_path)
        else:
            print(f"Warning: {page_filename} not found")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "vowels":
        print("Processing vowel pages first...")
        process_vowel_pages()
    else:
        print("Processing all workbook pages...")
        process_all_pages()
