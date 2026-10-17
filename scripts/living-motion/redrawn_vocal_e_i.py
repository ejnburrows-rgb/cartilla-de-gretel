"""Lane C — redrawn elefante and imán (2026-10-17 art, PR #888).

elefante: the trunk curls slightly (more toward the tip), both ears flap a little,
          both eyes blink. Body, bow, apples and feet stay still.
iman:     the new picture has no paper clips and no field lines, so neither is
          invented. Only the painted lightning sparks flicker (brightness only,
          same shapes, same place). Magnet and sunburst stay still.
Coordinates are pixels of each new still.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from lib import load, soft_mask, grid, field_rotate, lid_patch, add_blink
from wb_vowels import OriginalSvg, _out, ring_color
from redrawn_common import color_mask, grow, close, soften, solid, rigid_with_falloff

# ---------- ELEFANTE (1254x1254) ----------
ELE_EYES = [(680, 295, 755, 444), (820, 280, 924, 423)]
ELE_TRUNK_ZONE = [(800, 455), (930, 470), (915, 900), (760, 905), (560, 880), (540, 760), (580, 660), (700, 640), (700, 470)]
ELE_TRUNK_PIVOT = (820, 470)
ELE_EAR_R_ZONE = [(1030, 60), (1250, 60), (1250, 480), (1030, 480)]
ELE_EAR_R_PIVOT = (1040, 260)
ELE_EAR_L_ZONE = [(560, 50), (735, 50), (705, 300), (690, 440), (560, 460)]
ELE_EAR_L_PIVOT = (712, 250)

def _lilac(base):
    return color_mask(base, lambda r, g, b: (r > 100) & (b > 125) & (g < 125) & (r - g > 35))

def vocal_e_elefante():
    n = 'vocal-e-elefante'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    lilac = _lilac(base)
    xs, ys = grid(size)
    # trunk: lilac inside the trunk zone, filled, plus its painted outline
    tz = soft_mask(size, [('poly', ELE_TRUNK_ZONE)], 0) > .5
    trunk = grow(solid(close(lilac & tz, 6), 4000), 10) & tz
    ramp = np.clip((ys - 520) / 260.0, 0, 1)
    w = rigid_with_falloff(trunk, 22) * (ramp * ramp * (3 - 2 * ramp)) * soften(tz, 6)
    tx, ty = field_rotate(size, w, ELE_TRUNK_PIVOT)
    svg.warp(tx, ty, [0, 0.03, 0, -0.02, 0], '4.6s')
    # ears: each lilac ear flaps around where it meets the head
    vx = np.zeros(size[::-1], np.float32); vy = np.zeros_like(vx)
    for zone, pivot, sign in [(ELE_EAR_R_ZONE, ELE_EAR_R_PIVOT, 1), (ELE_EAR_L_ZONE, ELE_EAR_L_PIVOT, -1)]:
        z = soft_mask(size, [('poly', zone)], 0) > .5
        ear = grow(solid(close(lilac & z, 6), 3000), 12) & z
        dist = np.abs(xs - pivot[0]) / 140.0
        e = rigid_with_falloff(ear, 20) * np.clip(dist, 0, 1) * soften(z, 8)
        ex, ey = field_rotate(size, e, pivot)
        vx += sign * ex; vy += sign * ey
    svg.warp(vx, vy, [0, 0.035, 0, 0.02, 0], '3.4s')
    lids = [lid_patch(base, box, ring_color(base, box, grow=0.3), line=(50, 15, 40), lash_w=6, pad=6, outline_w=6)
            for box in ELE_EYES]
    add_blink(svg, lids, 'blink', 5.0, -1.4)
    return svg.render(_out(n))

# ---------- IMAN (1431x1099) ----------
IMAN_SPARK_PINK_ZONE = (990, 570, 1400, 940)
IMAN_SPARK_BLUE_ZONE = (640, 760, 1040, 1095)

def _cutout(base, mask):
    from PIL import Image
    a = np.array(base.convert('RGBA')); a[..., 3] = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
    ys, xs = np.nonzero(a[..., 3] > 0)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    return Image.fromarray(a[y0:y1, x0:x1]), int(x0), int(y0)

def vocal_i_iman():
    n = 'vocal-i-iman'; base = load(n); size = base.size; svg = OriginalSvg(n, base)
    def box(b):
        m = np.zeros(size[::-1], bool); x0, y0, x1, y1 = b; m[y0:y1, x0:x1] = True; return m
    pink = color_mask(base, lambda r, g, b: (r > 190) & (b > 110) & (g < 150) & (r - g > 70)) & box(IMAN_SPARK_PINK_ZONE)
    blue = color_mask(base, lambda r, g, b: (b > 130) & (b - r > 30) & (b - g > 30)) & box(IMAN_SPARK_BLUE_ZONE)
    svg.css.append('@keyframes spark{0%,100%{opacity:0}8%{opacity:.85}14%{opacity:.15}20%{opacity:.9}32%{opacity:0}}')
    for i, m in enumerate([pink, blue]):
        sm = soften(grow(close(m, 4), 2), 1.5)
        im, x, y = _cutout(base, sm)
        svg.over.append(svg.image(im, x, y, cls='ov',
            extra=f'style="opacity:0;filter:brightness(1.45) saturate(1.2);animation:spark 2.6s linear {i * 1.1:.1f}s infinite"'))
    return svg.render(_out(n))
