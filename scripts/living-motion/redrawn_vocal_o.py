"""Lane B — redrawn vowel-o pictures (oso, oveja) on the 2026-10-17 art (PR #888).

oso:   breathes (chest/belly), both big eyes blink, the bee's wings buzz.
       The bee itself and its painted motion lines stay where they are drawn.
oveja: blinks and flicks its ears; body, flowers and legs stay still.
olla:  stays still. The redrawn pot has no steam drawn, so the old steam
       overlay (invented smoke) is dropped.
Coordinates are pixels of each new still.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from lib import load, soft_mask, field_rotate, field_scale, lid_patch, add_blink
from wb_vowels import OriginalSvg, _out, ring_color

# ---------- OSO (1254x1254) ----------
OSO_EYES = [(535, 326, 625, 423), (632, 339, 713, 438)]   # eye whites (measured)
OSO_BELLY = (330, 560, 1010, 1090)                          # chest + belly ellipse
OSO_BEE_WINGS = [(752, 168), (812, 160), (872, 196), (870, 262), (812, 272), (774, 262), (752, 226)]
OSO_BEE_WING_ROOT = (776, 262)

def vocal_o_oso():
    n = 'vocal-o-oso'; base = load(n); size = base.size; svg = OriginalSvg(n, base)
    belly = soft_mask(size, [('ellipse', OSO_BELLY)], 40)
    vx, vy = field_scale(size, belly, (670, 1120), 1, 1)
    svg.warp(vx, vy, [0, 0.014, 0], '4.2s')
    wing = soft_mask(size, [('poly', OSO_BEE_WINGS)], 3)
    wx, wy = field_rotate(size, wing, OSO_BEE_WING_ROOT)
    svg.warp(wx, wy, [0, 0.06, 0, -0.035, 0], '0.2s', splines=False)
    lids = []
    for box in OSO_EYES:
        lids.append(lid_patch(base, box, ring_color(base, box, grow=0.25), line=(45, 22, 12),
                              lash_w=6, pad=8, outline_w=7))
    add_blink(svg, lids, 'blink', 5.2, -2.0)
    return svg.render(_out(n))

# ---------- OVEJA (1254x1254) ----------
OVEJA_EYES = [(316, 389, 340, 429), (447, 402, 472, 443)]   # dark eyes (measured)
OVEJA_EAR_L = [(120, 433), (134, 370), (190, 340), (281, 347), (314, 377), (306, 400), (262, 442), (190, 459), (124, 456)]
OVEJA_EAR_L_ROOT = (302, 392)
OVEJA_EAR_R = [(499, 368), (540, 374), (605, 424), (644, 474), (634, 509), (596, 513), (538, 491), (502, 442)]
OVEJA_EAR_R_ROOT = (506, 386)

def vocal_o_oveja():
    n = 'vocal-o-oveja'; base = load(n); size = base.size; svg = OriginalSvg(n, base)
    ear_l = soft_mask(size, [('poly', OVEJA_EAR_L)], 10)
    ear_r = soft_mask(size, [('poly', OVEJA_EAR_R)], 10)
    vl = field_rotate(size, ear_l, OVEJA_EAR_L_ROOT); vr = field_rotate(size, ear_r, OVEJA_EAR_R_ROOT)
    # ears flick outward together for a moment, then rest
    svg.warp(vl[0] - vr[0], vl[1] - vr[1], [0, 0, 0.05, -0.018, 0.008, 0], '5.6s', '0;0.62;0.68;0.74;0.8;1')
    lids = [lid_patch(base, box, ring_color(base, box, grow=0.5), line=(70, 35, 15), lash_w=3, pad=3, outline=False) for box in OVEJA_EYES]
    add_blink(svg, lids, 'blink', 4.4, -0.6)
    return svg.render(_out(n))
