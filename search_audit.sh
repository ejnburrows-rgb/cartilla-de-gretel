#!/bin/bash
cd cartilla-de-gretel

echo "Branches:"
git branch -r | grep -v HEAD | wc -l

echo "Fetching all remote branches..."
git fetch --all

# Array of unresolved names to look for
UNRESOLVED=("manzana" "pera" "taza" "ardilla" "iglesia" "igual" "iguana" "mono-blink" "sapo-blink" "anillo" "casa" "yate" "zapato")

for branch in $(git branch -r | grep -v HEAD | sed 's/origin\///'); do
  # Check if optimized/workbook directory exists
  if git ls-tree -r origin/$branch --name-only | grep -q "public/cartilla/art/optimized/workbook/"; then
    echo "Branch $branch has public/cartilla/art/optimized/workbook/"
  fi

  # Search for the unresolved items (with keywords)
  for item in "${UNRESOLVED[@]}"; do
    git ls-tree -r origin/$branch --name-only | grep -i "$item" | grep -iE 'approved|owner|master|generated|upload|replacement|blink' | while read file; do
      sha=$(git rev-parse origin/$branch:"$file")
      echo "Found unresolved candidate: $item in $branch -> $file (SHA: $sha)"
    done
  done
done
