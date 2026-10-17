"""Lesson 9 redrawn teacher Flip Chart picture (2026-10-17 art, PR #888).

fc_p015_sopa: the soup's surface ripples. A small travelling wave runs across the
    broth inside the bowl's inner rim; the bowl, rim and table stay still.
    The 813 KB sheet PNG is embedded as a LOSSLESS WebP copy (same pixels, checked
    here at build time) so the motion file stays under 1 MB; the other Flip Chart
    motion files embed their PNG byte-for-byte.
Coordinates are pixels of the new still.
"""
import os, sys, io, base64, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from lib import load, soft_mask, grid, field_rotate, lid_patch, add_blink
from wb_vowels import OriginalSvg, _out
from build import STILLS, ROOT
from redrawn_common import color_mask, grow, close, soften, solid, rigid_with_falloff

# ---------- SOPA (1254x1254) ----------
SOPA_BROTH = (619, 645, 423, 223)   # inner-rim ellipse: centre x, y, half-width, half-height
SOPA_WAVE = 300.0                   # wavelength in px
SOPA_AMP = 4.0                      # px

def _lossless_webp_uri(path):
    im = Image.open(path); buf = io.BytesIO(); im.save(buf, 'WEBP', lossless=True, method=6)
    data = buf.getvalue()
    a = np.array(Image.open(path).convert('RGBA')); b = np.array(Image.open(io.BytesIO(data)).convert('RGBA'))
    if not np.array_equal(a, b): raise SystemExit(f'{path}: lossless WebP copy differs from the still')
    return 'data:image/webp;base64,' + base64.b64encode(data).decode()

def fc_p015_sopa():
    n = 'fc_p015_sopa'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    svg.base_uri = _lossless_webp_uri(os.path.join(ROOT, STILLS[n]))
    xs, ys = grid(size)
    cx, cy, ax, ay = SOPA_BROTH
    rho = np.sqrt(((xs - cx) / ax) ** 2 + ((ys - cy) / ay) ** 2)
    t = np.clip((0.95 - rho) / 0.28, 0, 1); w = (t * t * (3 - 2 * t)).astype(np.float32)
    k = 2 * math.pi / SOPA_WAVE
    zero = np.zeros_like(w)
    # two standing waves a quarter-period apart = one travelling wave
    steps = 12
    for phase, f in [(0.0, np.sin), (math.pi / 2, np.cos)]:
        vy = (f(k * xs) * w).astype(np.float32)
        amps = [SOPA_AMP * math.cos(2 * math.pi * i / steps - phase) for i in range(steps + 1)]
        svg.warp(zero, vy, amps, '3.6s', splines=False)
    return svg.render(_out(n))
