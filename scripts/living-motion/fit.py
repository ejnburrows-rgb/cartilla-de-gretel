"""Re-fit motion coordinates after a still picture is replaced.

    python3 scripts/living-motion/fit.py <old-alive.svg or old still> <new still>

Prints the similarity transform (old still -> new still) found by SIFT feature
matching + RANSAC, with inlier count and residual. Compose it with the picture's
existing fit in wb_vowels.FITS / fc_natives.FITS (see compose()), then rebuild.
The old still can be read from the previous `*-alive.svg`, which embeds it.
"""
import base64, io, os, re, sys
import numpy as np, cv2
from PIL import Image

ROOT = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PICTURE_EXT = ('.svg', '.png', '.webp', '.jpg', '.jpeg')


def safe_picture_path(path):
    """Only pictures inside this repository may be read."""
    real = os.path.realpath(os.path.join(ROOT, path))
    if os.path.commonpath([ROOT, real]) != ROOT or not real.lower().endswith(PICTURE_EXT) or not os.path.isfile(real):
        sys.exit(f'{path}: not a picture inside the repository')
    return real


def largest_embedded(path):
    path = safe_picture_path(path)
    with open(path, 'rb') as f:
        data = f.read()
    if not path.endswith('.svg'):
        return Image.open(io.BytesIO(data)).convert('RGBA')
    best = None
    for m in re.finditer(rb'data:image/(?:png|webp|jpeg);base64,([A-Za-z0-9+/=]+)', data):
        im = Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGBA')
        if best is None or im.size[0] * im.size[1] > best.size[0] * best.size[1]:
            best = im
    if best is None:
        sys.exit(f'{path}: no embedded picture')
    return best


def gray(im):
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
    return np.array(Image.alpha_composite(bg, im).convert('L'))


def fit(old, new, mirror=False):
    a = gray(old)
    if mirror:
        a = a[:, ::-1].copy()
    b = gray(new)
    sift = cv2.SIFT_create()
    ka, da = sift.detectAndCompute(a, None)
    kb, db = sift.detectAndCompute(b, None)
    pairs = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [m for m, n in (p for p in pairs if len(p) == 2) if m.distance < 0.75 * n.distance]
    if len(good) < 8:
        return None
    src = np.float32([ka[m.queryIdx].pt for m in good])
    dst = np.float32([kb[m.trainIdx].pt for m in good])
    M, inl = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=3.0)
    if M is None:
        return None
    inl = inl.ravel().astype(bool)
    res = np.hypot(*(src[inl] @ M[:, :2].T + M[:, 2] - dst[inl]).T)
    return dict(a=float(M[0, 0]), b=float(M[1, 0]), tx=float(M[0, 2]), ty=float(M[1, 2]),
                inliers=int(inl.sum()), matches=len(good), rms=float(np.sqrt((res ** 2).mean())))


def compose(outer, inner):
    """outer(inner(p)) for similarity transforms given as dicts of a, b, tx, ty."""
    a1, b1, a2, b2 = outer['a'], outer['b'], inner['a'], inner['b']
    return dict(a=a1 * a2 - b1 * b2, b=b1 * a2 + a1 * b2,
                tx=a1 * inner['tx'] - b1 * inner['ty'] + outer['tx'],
                ty=b1 * inner['tx'] + a1 * inner['ty'] + outer['ty'])


if __name__ == '__main__':
    old, new = largest_embedded(sys.argv[1]), largest_embedded(sys.argv[2])
    print(f'old {old.size} -> new {new.size}')
    for mirror in (False, True):
        print('mirror' if mirror else 'direct', fit(old, new, mirror))
