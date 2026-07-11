import os
import hashlib
import glob
from collections import defaultdict
import re

def get_hash(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

print("Hashing all images...")
all_images = glob.glob('public/cartilla/**/*.webp', recursive=True) + \
             glob.glob('public/cartilla/**/*.png', recursive=True) + \
             glob.glob('public/cartilla/**/*.jpg', recursive=True)

hash_map = defaultdict(list)
for p in all_images:
    p = p.replace('\\', '/')
    try:
        hash_map[get_hash(p)].append(p)
    except:
        pass

duplicates = {h: paths for h, paths in hash_map.items() if len(paths) > 1}

total_dup_files = sum(len(paths)-1 for paths in duplicates.values())
print(f"Found {len(duplicates)} sets of duplicates, totalling {total_dup_files} redundant files.")

# Write to file for inspection
with open('dup_groups.txt', 'w', encoding='utf-8') as f:
    for h, paths in duplicates.items():
        f.write(f"Hash: {h}\n")
        for p in paths:
            f.write(f"  {p}\n")
        f.write("\n")

