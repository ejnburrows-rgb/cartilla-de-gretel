"""Original main Lala: source-colour blinks and a gentle, local tail-tip flick.

Source: public/cartilla/art/optimized/flipchart-native/p024-lala.png (550x495).
Lala faces left. The tail ends at the LOWER LEFT, not at the rejected art's
coordinates. Original PNG bytes, white canvas, body, feet and pose stay intact.
"""
import numpy as np
from lib import load, grid, field_rotate, lid_patch, add_blink
from wb_vowels import OriginalSvg, _out

LALA_EYES = [(109, 36, 151, 109), (157, 29, 207, 107)]
LALA_TAIL_PIVOT = (340.0, 450.0)


def fc_p024_lala():
    n = 'fc_p024_lala'
    base = load(n)
    svg = OriginalSvg(n, base)
    svg.MAP_DIV = 1
    xs, ys = grid(base.size)
    # Only the last lower-left taper can move. A smooth hinge at x=340 and
    # a zero boundary above y=430 keep the returning tail and legs unchanged.
    t = np.clip((LALA_TAIL_PIVOT[0] - xs) / 250.0, 0, 1)
    lower = np.clip((ys - 430.0) / 12.0, 0, 1)
    w = (t * t * (3 - 2 * t) * lower * lower * (3 - 2 * lower)).astype(np.float32)
    w *= np.array(base)[..., 3] > 0  # Never treat transparent RGB as tail ink.
    tx, ty = field_rotate(base.size, w, LALA_TAIL_PIVOT)
    svg.warp(tx, ty, [0, 0, 0.018, -0.009, 0.012, 0, 0], '3.8s',
             keytimes='0;0.5;0.58;0.66;0.74;0.84;1')
    # Derive lid colour from the actual green muzzle, never a guessed palette.
    muzzle = np.array(base)[128:157, 119:159, :3].astype(int).reshape(-1, 3)
    green = muzzle[(muzzle[:, 1] > muzzle[:, 0]) &
                   (muzzle[:, 0] > 55) & (muzzle[:, 2] < 90)]
    lid_colour = tuple(int(c) for c in np.median(green, axis=0))
    eye_ink = np.array(base)[25:111, 105:211, :3].astype(int).reshape(-1, 3)
    eye_ink = eye_ink[eye_ink.sum(axis=1) < 100]
    crease_colour = tuple(int(c) for c in np.median(eye_ink, axis=0))
    lids = [lid_patch(base, box, lid_colour, line=crease_colour,
                      lash_w=2, pad=0.5, outline=False) for box in LALA_EYES]
    add_blink(svg, lids, 'blink', 4.6, -0.9)
    return svg.render(_out(n))
