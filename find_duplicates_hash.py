import os
import hashlib
from collections import defaultdict

def get_hash(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

dirs_to_check = [
    'public/cartilla/images',
    'public/cartilla/art'
]

hash_map = defaultdict(list)

for d in dirs_to_check:
    for root, _, files in os.walk(d):
        for file in files:
            p = os.path.join(root, file)
            # Skip read-only folder if we just want to know what's duplicate, but we need to include it in hashes to know if things duplicate it.
            try:
                h = get_hash(p)
                hash_map[h].append(p)
            except Exception as e:
                pass

duplicates = {h: paths for h, paths in hash_map.items() if len(paths) > 1}

total_dup_files = sum(len(paths)-1 for paths in duplicates.values())
print(f"Found {len(duplicates)} sets of duplicates, totalling {total_dup_files} redundant files.")

with open("duplicate_report.txt", "w", encoding="utf-8") as f:
    for h, paths in duplicates.items():
        f.write(f"Hash: {h}\n")
        for p in paths:
            f.write(f"  {p}\n")
        f.write("\n")
