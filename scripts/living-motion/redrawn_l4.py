"""Original 870x741 yellow/purple unicorn: only its actual front ear flicks.

The mane, horn, shut eye, body, tail and cropped hooves stay still. Coordinates
are newly measured from current-main's original, NOT the rejected 1254px art.
The complete original WebP is embedded unchanged and shown for reduced motion.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from lib import load, soft_mask, grid, field_rotate
from wb_vowels import _out
from redrawn_l1 import LocalPartSvg

# Tall near ear: tip (282,31), outer right edge (333,126), root (291,188).
# The smaller far ear and forelock are not selected.
UNI_EAR_ZONE = [(279, 24), (304, 41), (328, 86), (340, 126),
                (332, 164), (314, 184), (286, 194), (255, 181),
                (248, 157), (251, 104), (261, 60)]
UNI_EAR_PIVOT = (291, 188)


def vocal_u_unicornio():
    n = 'vocal-u-unicornio'
    base = load(n)
    assert base.size == (870, 741), 'Re-measure masks if the approved source changes'
    svg = LocalPartSvg(n, base, (237, 15, 117, 184))
    xs, ys = grid(base.size)
    zone = soft_mask(base.size, [('poly', UNI_EAR_ZONE)], 3.0)
    ramp = np.clip((183 - ys) / 67.0, 0, 1)
    weight = zone * ramp * ramp * (3 - 2 * ramp)
    vx, vy = field_rotate(base.size, weight, UNI_EAR_PIVOT)
    # A small muscle-led ear flick after a quiet interval; < 6px at the tip.
    svg.warp(vx, vy, [0, 0, -.032, .012, -.022, 0, 0], '4.2s',
             keytimes='0;0.53;0.62;0.69;0.77;0.85;1')
    return svg.render(_out(n))
