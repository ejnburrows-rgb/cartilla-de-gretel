import cv2
import numpy as np
import json

img = cv2.imread('docs/owner-refs/2026-10-19/ref-cow.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# We will use the top-left cow "mu" as a template, but exclude the syllable text
template_full = img[126:396, 52:323]
template_gray = gray[126:396, 52:323]

# Match template to find all 8 cows
res = cv2.matchTemplate(gray, template_gray, cv2.TM_CCOEFF_NORMED)
threshold = 0.5 # Low threshold because cows might have slight variations or text differs
loc = np.where(res >= threshold)

cows = []
# Non-max suppression
for pt in zip(*loc[::-1]):
    x, y = pt
    # Check if this point is far enough from existing cows
    is_new = True
    for cx, cy in cows:
        if abs(x - cx) < 100 and abs(y - cy) < 100:
            is_new = False
            break
    if is_new:
        cows.append((int(x), int(y)))

cows.sort(key=lambda p: (p[1] // 100, p[0])) # Sort by row, then col
print(json.dumps(cows))
