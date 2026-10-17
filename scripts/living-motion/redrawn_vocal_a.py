"""Lane A — redrawn vowel-a pictures (abanico, abeja) on the 2026-10-17 art.

abanico: the fan opens and closes slightly (same approved motion as Page 1).
abeja:   the two wings flutter; body, antennae and face stay still.
avión:   stays still. The redrawn jet has no propeller and is painted on its own
         blue sky patch, so the old propeller/air-streak rig is dropped and a
         whole-plane glide would move the scenery too.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from lib import load, soft_mask, grid, field_rotate
from wb_vowels import OriginalSvg, _out
from redrawn_common import color_mask, grow, close, soften, solid, rigid_with_falloff

# ---------- ABANICO (1254x1254): blades open/close around the hinge ----------
ABANICO_HINGE = (203, 1075)          # rivet corner where the two straight edges meet
ABANICO_TASSEL = [(55, 1045), (215, 1045), (215, 1210), (55, 1210)]

def vocal_a_abanico():
    n = 'vocal-a-abanico'; base = load(n); size = base.size; svg = OriginalSvg(n, base)
    px, py = ABANICO_HINGE
    xs, ys = grid(size)
    # 0 at the upright edge (stays put), 1 at the bottom edge (opens most)
    th = np.clip(np.arctan2(xs - px, py - ys), 0, np.pi / 2) / (np.pi / 2)
    tassel = soft_mask(size, [('poly', ABANICO_TASSEL)], 6)
    w = th * (1 - tassel)
    vx, vy = (ys - py) * w, -(xs - px) * w
    svg.warp(vx, vy, [0, 0.03, 0, -0.02, 0], '5.2s')
    return svg.render(_out(n))

# ---------- ABEJA (1254x1254): wings flutter from the shoulder ----------
ABEJA_WING_ROOT = (700, 590)
# Region that may hold wing pixels (excludes the face, antennae and body).
ABEJA_WING_ZONE = [(498, 135), (610, 118), (700, 0), (1180, 0), (1180, 300), (1010, 470), (1010, 600),
                   (760, 615), (700, 610), (650, 560), (600, 470), (560, 330), (505, 260)]
ABEJA_PROTECT = [('ellipse', (612, 78, 718, 200))]  # antenna ball resting on the back wing

def vocal_a_abeja():
    n = 'vocal-a-abeja'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 1
    blue = color_mask(base, lambda r, g, b: (b > 190) & (b - r > 25) & (g > 150))
    zone = soft_mask(size, [('poly', ABEJA_WING_ZONE)], 0) > .5
    yellow = color_mask(base, lambda r, g, b: (r > 200) & (g > 140) & (b < 150))   # face, body, antenna balls
    protect = (soft_mask(size, ABEJA_PROTECT, 0) > .5) | grow(yellow, 10)
    wing = solid(close(blue & zone, 10)) & zone
    wing = grow(wing, 24)                            # the whole painted brown outline
    wing = soften(wing, 12) > .5                     # smooth silhouette, no ragged steps
    w = rigid_with_falloff(wing, 60) * (1 - soften(protect, 8)) * soften(zone, 8)
    vx, vy = field_rotate(size, w, ABEJA_WING_ROOT)
    svg.warp(vx, vy, [0, 0.022, 0, -0.012, 0], '0.26s', splines=False)
    return svg.render(_out(n))
