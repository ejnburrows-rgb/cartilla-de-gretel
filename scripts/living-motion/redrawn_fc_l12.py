"""Lesson 12 redrawn teacher Flip Chart picture (2026-10-17 art, PR #888).

fc_p024_lala: Lala the lizard blinks (green lids over both eyes) and the tip of the
    tail flicks. Body, legs and feet stay still.
Coordinates are pixels of the new still.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from lib import load, soft_mask, grid, field_rotate, lid_patch, add_blink
from wb_vowels import OriginalSvg, _out
from redrawn_common import color_mask, grow, close, soften, solid, rigid_with_falloff

# ---------- LALA (1254x1254) ----------
LALA_EYES = [(262, 335, 362, 472), (352, 318, 468, 478)]
LALA_TAIL_ZONE = [(600, 862), (870, 846), (890, 965), (600, 980)]
LALA_TAIL_PIVOT = (880, 905)

def fc_p024_lala():
    n = 'fc_p024_lala'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    z = soft_mask(size, [('poly', LALA_TAIL_ZONE)], 0) > .5
    ink = color_mask(base, lambda r, g, b: (r + g + b) < 640)
    tail = grow(solid(close(ink & z, 4), 1500), 4) & z
    ramp = np.clip((LALA_TAIL_PIVOT[0] - 40 - xs) / 160.0, 0, 1)
    wgt = rigid_with_falloff(tail, 16) * (ramp * ramp * (3 - 2 * ramp)) * soften(z, 6)
    tx, ty = field_rotate(size, wgt, LALA_TAIL_PIVOT)
    svg.warp(tx, ty, [0, 0, 0.06, -0.03, 0.05, 0, 0], '3.8s', keytimes='0;0.5;0.58;0.66;0.74;0.84;1')
    lids = [lid_patch(base, b, (120, 184, 18), line=(95, 38, 14), lash_w=6, pad=3, outline_w=8) for b in LALA_EYES]
    add_blink(svg, lids, 'blink', 4.6, -0.9)
    return svg.render(_out(n))
