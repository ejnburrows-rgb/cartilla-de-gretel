"""Original main p015 soup: a small ripple confined to the actual broth.

Source: public/cartilla/art/optimized/flipchart-native/p015-sopa.png (320x320).
The original PNG bytes, white canvas, printed steam, bowl and rim are preserved.
The broth ellipse is tilted with the actual bowl, not the rejected square art.
"""
import math
import numpy as np
from lib import load, grid
from wb_vowels import OriginalSvg, _out

SOPA_BROTH = (159.0, 195.0, 75.0, 33.0)
SOPA_TILT = math.radians(-10.0)
SOPA_WAVE = 68.0
SOPA_AMP = 0.65


def fc_p015_sopa():
    n = 'fc_p015_sopa'
    base = load(n)
    svg = OriginalSvg(n, base)
    svg.MAP_DIV = 1
    xs, ys = grid(base.size)
    cx, cy, ax, ay = SOPA_BROTH
    dx, dy = xs - cx, ys - cy
    u = dx * math.cos(SOPA_TILT) + dy * math.sin(SOPA_TILT)
    v = -dx * math.sin(SOPA_TILT) + dy * math.cos(SOPA_TILT)
    rho = np.sqrt((u / ax) ** 2 + (v / ay) ** 2)
    # Exact zero beyond the broth; ease out before the printed inner rim.
    t = np.clip((0.90 - rho) / 0.25, 0, 1)
    w = (t * t * (3 - 2 * t)).astype(np.float32)
    w *= np.array(base)[..., 3] > 0  # Transparent RGB is never painted broth.
    k = 2 * math.pi / SOPA_WAVE
    zero = np.zeros_like(w)
    steps = 12
    for phase, wave in [(0.0, np.sin), (math.pi / 2, np.cos)]:
        vy = (wave(k * u) * w).astype(np.float32)
        amps = [SOPA_AMP * math.cos(2 * math.pi * i / steps - phase)
                for i in range(steps + 1)]
        svg.warp(zero, vy, amps, '3.6s', splines=False)
    return svg.render(_out(n))
