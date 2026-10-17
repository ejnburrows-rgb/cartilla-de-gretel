"""Original main Unicornio (Flip Chart sheet p008): a source-derived blink and a
gentle sway of the free lower end of the original back mane-tail stripe.

Source: public/cartilla/art/optimized/flipchart-native/p008-unicornio.png
(320x320). The original PNG bytes, pose, body, hooves, horn and face stay
intact. Motion is limited to the measured original ink of the lower mane-tail
stripe (x<92, y>140, hinged at its top near (60,128)); everything else stays
exactly where the drawing has it. OWNER-APPROVAL CANDIDATE (Lane D).
"""
import numpy as np
from lib import load, grid, field_rotate, lid_patch, add_blink
from wb_vowels import OriginalSvg, _out

UNI_EYE = (249, 138, 265, 157)
UNI_TAIL_PIVOT = (60.0, 128.0)


def fc_p008_unicornio():
    n = 'fc_p008_unicornio'
    base = load(n)
    svg = OriginalSvg(n, base)
    svg.MAP_DIV = 1
    xs, ys = grid(base.size)
    # Only the free lower end of the back mane-tail stripe can move. A smooth
    # hinge at the stripe's top (y=140) and a left edge ramp keep the neck,
    # body and rear leg unchanged.
    t = np.clip((ys - 140.0) / 95.0, 0, 1)
    side = np.clip((92.0 - xs) / 40.0, 0, 1)
    w = (t * t * (3 - 2 * t) * side * side * (3 - 2 * side)).astype(np.float32)
    w *= np.array(base)[..., 3] > 0  # Never treat transparent RGB as ink.
    tx, ty = field_rotate(base.size, w, UNI_TAIL_PIVOT)
    svg.warp(tx, ty, [0, 0.030, 0, -0.020, 0], '4.2s')
    # Lid colour from the actual yellow body ringing the eye; crease from the
    # eye's own black ink. Never a guessed palette.
    lid_colour = (253, 248, 5)   # median of the measured eye ring (609 px)
    crease_colour = (0, 0, 0)    # median of the measured eye ink
    lids = [lid_patch(base, UNI_EYE, lid_colour, line=crease_colour,
                      lash_w=2, pad=0.5, outline=False)]
    add_blink(svg, lids, 'blink', 4.6, -0.9)
    return svg.render(_out(n))
