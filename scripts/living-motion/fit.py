"""Re-fit motion coordinates after a still picture is replaced.

    python3 scripts/living-motion/fit.py <old> <new>

Each argument is a picture name from STILLS in build.py (e.g. `vocal-a-abeja`) for
its current still, or `<name>:alive` for the drawing embedded in its existing
`*-alive.svg` (the still the old motion was built from). File paths always come
from STILLS, never from the command line.

Prints the similarity transform (old -> new) found by SIFT feature matching +
RANSAC, with inlier count and residual. Compose it with the picture's existing fit
in wb_vowels.FITS / fc_natives.FITS (see compose()), then rebuild.
"""
import base64, io, os, re, sys
import numpy as np, cv2
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import STILLS, ROOT  # noqa: E402


def picture(arg):
    """Load a registered still, or the base drawing embedded in its alive SVG."""
    name, _, kind = arg.partition(':')
    if name not in STILLS or kind not in ('', 'alive'):
        sys.exit(f'unknown picture: {arg} (use a STILLS name, optionally with :alive)')
    still = STILLS[name]
    rel = still[:-len(os.path.splitext(still)[1])] + '-alive.svg' if kind else still
    with open(os.path.join(ROOT, rel), 'rb') as f:
        data = f.read()
    if not rel.endswith('.svg'):
        return Image.open(io.BytesIO(data)).convert('RGBA')
    # The base drawing is the last full-size embedded image (earlier ones are motion maps).
    best = None
    for m in re.finditer(rb'data:image/(?:png|webp|jpeg);base64,([A-Za-z0-9+/=]+)', data):
        im = Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGBA')
        if best is None or im.size[0] * im.size[1] >= best.size[0] * best.size[1]:
            best = im
    if best is None:
        sys.exit(f'{rel}: no embedded picture')
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
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    old, new = picture(sys.argv[1]), picture(sys.argv[2])
    print(f'old {old.size} -> new {new.size}')
    for mirror in (False, True):
        print('mirror' if mirror else 'direct', fit(old, new, mirror))
