"""Shared helpers for the redrawn Lesson 3 vowel pictures (2026-10-17 art, PR #888).

The redrawn pictures are new drawings on a white background, not rescans of the
Page 1 art, so the old SIFT similarity fits (FITS in wb_vowels.py) do not apply.
Every recipe in redrawn_*.py uses coordinates measured directly on the new
still (pixel units of that file). The still is embedded byte-for-byte, as before.
"""
import numpy as np, cv2
from PIL import Image

def color_mask(base, test):
    """Boolean mask of pixels where test(r, g, b) is true."""
    a = np.array(base.convert('RGB')).astype(int)
    return test(a[..., 0], a[..., 1], a[..., 2])

def grow(mask, px):
    k = 2 * int(px) + 1
    return cv2.dilate(mask.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))) > 0

def close(mask, px):
    k = 2 * int(px) + 1
    return cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))) > 0

def soften(mask, blur):
    a = mask.astype(np.float32)
    return cv2.GaussianBlur(a, (0, 0), blur) if blur else a

def solid(mask, min_area=500):
    """Fill every outer contour of mask (removes the white highlight holes)."""
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = np.zeros(mask.shape, np.uint8)
    cv2.drawContours(out, [c for c in cs if cv2.contourArea(c) >= min_area], -1, 1, -1)
    return out > 0

def rigid_with_falloff(mask, fade):
    """1.0 on the whole part (so its painted outline moves rigidly, never stretches),
    fading to 0 over `fade` px of the surrounding white paper."""
    d = cv2.distanceTransform((~mask).astype(np.uint8), cv2.DIST_L2, 5)
    t = np.clip(1 - d / float(fade), 0, 1)
    return (t * t * (3 - 2 * t)).astype(np.float32)
