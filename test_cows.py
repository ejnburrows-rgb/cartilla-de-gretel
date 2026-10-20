import cv2
import numpy as np

img = cv2.imread('docs/owner-refs/2026-10-19/ref-cow.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# The cows have different text on them, so a single template won't match well.
# Also, they might be drawn slightly differently.
# I'll just write down approximate coordinates for the 8 cows manually.

cows = [
    # Top row (approx y=110-380)
    {"id": 0, "name": "mu", "x": 52, "y": 126, "w": 271, "h": 270},
    {"id": 1, "name": "mo", "x": 372, "y": 126, "w": 271, "h": 270},
    {"id": 2, "name": "me", "x": 705, "y": 130, "w": 271, "h": 270},
    {"id": 3, "name": "ma_accent", "x": 1030, "y": 130, "w": 271, "h": 270},
    # Bottom row (approx y=400-670) -> actually wait, the image shows:
    # Top row: mu, mo, me, má
    # Bottom row: ma, mi, mo, mo
    # Let's verify positions. Bottom row is slightly staggered.
    {"id": 4, "name": "ma", "x": 200, "y": 300, "w": 271, "h": 270},
    {"id": 5, "name": "mi", "x": 505, "y": 300, "w": 271, "h": 270},
    {"id": 6, "name": "mo2", "x": 800, "y": 340, "w": 271, "h": 270},
    {"id": 7, "name": "mo3", "x": 1130, "y": 340, "w": 271, "h": 270},
]

for c in cows:
    x, y, w, h = c["x"], c["y"], c["w"], c["h"]
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
    cv2.putText(img, c["name"], (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

cv2.imwrite('cows_bboxes.jpg', img)
