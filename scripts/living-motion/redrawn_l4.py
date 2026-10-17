"""Lesson 4 redrawn pictures (2026-10-17 art, PR #888).

unicornio: the front (pink) ear flicks now and then; it bends from where it meets
           the head. Eyes are drawn closed (a smile), so there is no blink. Body,
           mane, horn, tail and hooves stay still. Also used in Lesson 6.
escoba is shared with Lesson 1 (redrawn_l1.py).
Coordinates are pixels of the new still.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from lib import load, soft_mask, grid, field_rotate
from wb_vowels import OriginalSvg, _out
from redrawn_common import color_mask, grow, close, soften, solid, rigid_with_falloff

# ---------- UNICORNIO (1254x1254) ----------
UNI_EAR_ZONE = [(362, 35), (480, 45), (505, 200), (495, 285), (440, 305), (402, 295), (390, 205), (364, 150)]
UNI_EAR_PIVOT = (440, 292)

def vocal_u_unicornio():
    n = 'vocal-u-unicornio'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    z = soft_mask(size, [('poly', UNI_EAR_ZONE)], 0) > .5
    ink = color_mask(base, lambda r, g, b: (r + g + b) < 690)
    ear = grow(solid(close(ink & z, 4), 1500), 3) & z
    ramp = np.clip((UNI_EAR_PIVOT[1] - 20 - ys) / 130.0, 0, 1)
    w = rigid_with_falloff(ear, 14) * (ramp * ramp * (3 - 2 * ramp)) * soften(z, 4)
    tx, ty = field_rotate(size, w, UNI_EAR_PIVOT)
    # mostly still, then a quick double flick
    svg.warp(tx, ty, [0, 0, -0.07, 0.02, -0.06, 0, 0], '4.2s', keytimes='0;0.6;0.66;0.72;0.78;0.86;1')
    return svg.render(_out(n))
