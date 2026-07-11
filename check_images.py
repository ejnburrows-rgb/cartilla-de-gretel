import json
import glob
import os
import re

with open('src/data/page-layouts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

img_dir = r'public/cartilla/images/source'
all_images = glob.glob(os.path.join(img_dir, '**', '*.*'), recursive=True)

page_to_img = {}
for img in all_images:
    basename = os.path.basename(img)
    m = re.search(r'page-0?(\d+)\.', basename)
    if m:
        page_num = str(m.group(1))
        page_to_img[page_num] = img

missing = []
for p in range(1, 91):
    page_num = str(p)
    if page_num not in data['pages']:
        continue
    regions = data['pages'][page_num].get('regions', [])
    instr_texts = [r['text'] for r in regions if r.get('regionType') == 'instruction']
    if instr_texts and page_num not in page_to_img:
        missing.append(page_num)

print("Pages with instructions but no image:", missing)
