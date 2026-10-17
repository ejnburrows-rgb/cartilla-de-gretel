"""Lesson 3 remaining pictures (2026-10-17 art, PR #888), after lanes A-C.

Only parts that are really drawn as separate pieces move. Nothing is added.
  oruga:    the raised hand waves; both eyes blink. (The body segments overlap
            each other and the shoes, so they are not rippled.)
  ardilla:  the tail swishes (more toward its tip); both eyes blink. Feet stay.
  alas:     each wing flaps a little around its inner shoulder; tips move most.
  ojos:     each eye closes and opens on its own timing (the painted eye is
            squashed shut; no lid colour is invented, the paper is white).
  estrella: the five points brighten one after another (brightness only).
  aguja:    the needle tip pivots a little around its eye; thread stays still.
  maiz:     the free curled husk leaf on the left flexes; cob stays still.
Still (no separate moving part in the new art): aro (hoop is woven through the
ribbon over a painted swirl), arbol (one canopy mass with a shadow), uno (a
trace would add new marks), iglu (no separate snow-rim highlight is drawn).
Coordinates are pixels of each new still.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from PIL import Image
from lib import load, soft_mask, grid, field_rotate, lid_patch, add_blink
from wb_vowels import OriginalSvg, _out, ring_color
from redrawn_common import color_mask, grow, close, soften, solid, rigid_with_falloff

def _ink(base, thr=600):
    """Painted (non-paper) pixels."""
    return color_mask(base, lambda r, g, b: (r + g + b) < thr)

def _zone(size, poly):
    return soft_mask(size, [('poly', poly)], 0) > .5

def _cutout(base, mask):
    a = np.array(base.convert('RGBA')); a[..., 3] = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
    ys, xs = np.nonzero(a[..., 3] > 0)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    return Image.fromarray(a[y0:y1, x0:x1]), int(x0), int(y0)

def _base_def(svg, ref):
    """The same still, defined once, for overlays that reuse its own pixels."""
    return f'<defs><image id="{ref}" x="0" y="0" width="{svg.W}" height="{svg.H}" href="{svg.base_uri}"/></defs>'

# ---------- ORUGA (1254x1254) ----------
ORU_EYES = [(191, 250, 305, 418), (294, 244, 394, 404)]
ORU_HAND_ZONE = [(505, 355), (700, 355), (700, 470), (640, 560), (600, 600), (548, 600), (520, 520)]
ORU_HAND_PIVOT = (575, 600)

def vocal_o_oruga():
    n = 'vocal-o-oruga'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    z = _zone(size, ORU_HAND_ZONE)
    hand = grow(solid(close(_ink(base) & z, 4), 800), 6) & z
    ramp = np.clip((ORU_HAND_PIVOT[1] - ys) / 90.0, 0, 1)
    w = rigid_with_falloff(hand, 18) * (ramp * ramp * (3 - 2 * ramp)) * soften(z, 6)
    tx, ty = field_rotate(size, w, ORU_HAND_PIVOT)
    svg.warp(tx, ty, [0, 0.09, -0.05, 0.09, 0], '2.4s')
    lid = ring_color(base, (300, 225, 340, 245), grow=0.2)
    lids = [lid_patch(base, b, lid, line=(120, 50, 10), lash_w=6, pad=4, outline_w=7) for b in ORU_EYES]
    add_blink(svg, lids, 'blink', 4.8, -1.1)
    return svg.render(_out(n))

# ---------- ARDILLA (1254x1254) ----------
ARD_EYES = [(750, 436, 846, 548), (880, 436, 924, 540)]
ARD_TAIL_ZONE = [(0, 40), (600, 40), (600, 560), (470, 600), (430, 700), (330, 760), (200, 800), (0, 800)]
ARD_TAIL_PIVOT = (420, 760)

def vocal_a_ardilla():
    n = 'vocal-a-ardilla'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    z = _zone(size, ARD_TAIL_ZONE)
    tail = grow(solid(close(_ink(base) & z, 6), 3000), 8) & z
    d = np.hypot(xs - ARD_TAIL_PIVOT[0], ys - ARD_TAIL_PIVOT[1])
    ramp = np.clip((d - 160) / 320.0, 0, 1)
    w = rigid_with_falloff(tail, 24) * (ramp * ramp * (3 - 2 * ramp)) * soften(z, 10)
    tx, ty = field_rotate(size, w, ARD_TAIL_PIVOT)
    svg.warp(tx, ty, [0, 0.045, -0.02, 0.03, 0], '3.8s')
    fur = (205, 95, 20)
    lids = [lid_patch(base, b, fur, line=(70, 30, 10), lash_w=5, pad=4, outline_w=6) for b in ARD_EYES]
    add_blink(svg, lids, 'blink', 5.4, -2.0)
    return svg.render(_out(n))

# ---------- ALAS (1254x1254) ----------
ALAS_L_ZONE = [(40, 90), (610, 90), (610, 1100), (40, 1100)]
ALAS_R_ZONE = [(640, 90), (1220, 90), (1220, 1100), (640, 1100)]
ALAS_L_PIVOT = (585, 430)
ALAS_R_PIVOT = (665, 430)

def vocal_a_alas():
    n = 'vocal-a-alas'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    vx = np.zeros(size[::-1], np.float32); vy = np.zeros_like(vx)
    for zone, pivot, sign in [(ALAS_L_ZONE, ALAS_L_PIVOT, 1), (ALAS_R_ZONE, ALAS_R_PIVOT, -1)]:
        z = _zone(size, zone)
        wing = grow(solid(close(_ink(base, 690) & z, 6), 20000), 6) & z
        ramp = np.clip((np.hypot(xs - pivot[0], ys - pivot[1]) - 60) / 360.0, 0, 1)
        e = rigid_with_falloff(wing, 20) * (ramp * ramp * (3 - 2 * ramp)) * soften(z, 8)
        ex, ey = field_rotate(size, e, pivot)
        vx += sign * ex; vy += sign * ey
    svg.warp(vx, vy, [0, 0.035, 0, 0.025, 0], '2.6s')
    return svg.render(_out(n))

# ---------- OJOS (1448x1086) ----------
OJOS_EYES = [(25, 380, 695, 668), (755, 380, 1425, 668)]

def leccion_1_ojos():
    n = 'leccion-1-ojos'; base = load(n); svg = OriginalSvg(n, base)
    svg.css.append('@keyframes oshow{0%,86%{opacity:0}87%,97.5%{opacity:1}98.5%,100%{opacity:0}}'
                   '@keyframes osq{0%,87%{transform:scaleY(1)}91%,93.5%{transform:scaleY(.12)}97.5%,100%{transform:scaleY(1)}}')
    svg.over.append(_base_def(svg, 'ojosbase'))
    for i, (x0, y0, x1, y1) in enumerate(OJOS_EYES):
        cy = (y0 + y1) / 2
        period, delay = (5.2, -1.0) if i == 0 else (6.1, -3.4)
        anim = f'{period}s cubic-bezier(.45,0,.55,1) {delay}s infinite'
        svg.over.append(f'<clipPath id="ojo{i}"><rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/></clipPath>'
                        f'<g class="ov" style="opacity:0;animation:oshow {anim}">'
                        f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="#fff"/>'
                        f'<g style="transform-origin:0 {cy:.1f}px;animation:osq {anim}">'
                        f'<use href="#ojosbase" clip-path="url(#ojo{i})"/></g></g>')
    return svg.render(_out(n))

# ---------- ESTRELLA (1254x1254) ----------
EST_TIPS = [(600, 15), (1190, 440), (60, 462), (225, 1180), (1010, 1190)]
EST_INNER = [(455, 370), (800, 370), (905, 760), (605, 965), (345, 760)]
# each tip sits between two inner corners
EST_POINTS = [(0, 0, 1), (1, 1, 2), (2, 4, 0), (3, 3, 4), (4, 2, 3)]

def vocal_e_estrella():
    n = 'vocal-e-estrella'; base = load(n); size = base.size; svg = OriginalSvg(n, base)
    svg.over.append(_base_def(svg, 'estbase'))
    svg.css.append('@keyframes glow{0%,100%{opacity:0}10%{opacity:.9}24%{opacity:0}}')
    for k, (t, a, b) in enumerate(EST_POINTS):
        tip = np.array(EST_TIPS[t], float)
        pa = tip + 0.8 * (np.array(EST_INNER[a]) - tip); pb = tip + 0.8 * (np.array(EST_INNER[b]) - tip)
        c = (tip + pa + pb) / 3
        pts = [c + (p - c) * 1.06 for p in (tip, pa, pb)]  # a hair wider, to take in the painted outline
        poly = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
        r = float(np.linalg.norm((pa + pb) / 2 - tip))
        # strongest at the tip, fading out toward the middle of the star (no hard edge)
        svg.over.append(f'<radialGradient id="pg{k}" gradientUnits="userSpaceOnUse" cx="{tip[0]:.1f}" cy="{tip[1]:.1f}" r="{r:.1f}">'
                        f'<stop offset="0.35" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>'
                        f'<mask id="pt{k}" maskUnits="userSpaceOnUse" x="0" y="0" width="{svg.W}" height="{svg.H}">'
                        f'<polygon points="{poly}" fill="url(#pg{k})"/></mask>'
                        f'<use href="#estbase" mask="url(#pt{k})" class="ov" '
                        f'style="opacity:0;filter:brightness(1.3) saturate(1.15);animation:glow 5s ease-in-out {k:.1f}s infinite"/>')
    return svg.render(_out(n))

# ---------- AGUJA (1254x1254) ----------
AGU_NEEDLE_ZONE = [(700, 330), (800, 360), (130, 1200), (40, 1180)]
AGU_PIVOT = (800, 300)

def vocal_a_aguja():
    n = 'vocal-a-aguja'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    z = _zone(size, AGU_NEEDLE_ZONE)
    needle = grow(solid(close(_ink(base) & z, 4), 2000), 4) & z
    ramp = np.clip((np.hypot(xs - AGU_PIVOT[0], ys - AGU_PIVOT[1]) - 150) / 200.0, 0, 1)
    w = rigid_with_falloff(needle, 18) * (ramp * ramp * (3 - 2 * ramp))
    tx, ty = field_rotate(size, w, AGU_PIVOT)
    svg.warp(tx, ty, [0, 0.018, 0, -0.012, 0], '3.6s')
    return svg.render(_out(n))

# ---------- MAIZ (1254x1254) ----------
MAIZ_LEAF_ZONE = [(30, 420), (250, 400), (330, 470), (300, 560), (250, 620), (200, 700), (110, 720), (30, 690)]
MAIZ_PIVOT = (285, 600)

def leccion_1_maiz():
    n = 'leccion-1-maiz'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    z = _zone(size, MAIZ_LEAF_ZONE)
    leaf = grow(close(_ink(base, 700) & z, 4), 4) & z
    ramp = np.clip((np.hypot(xs - MAIZ_PIVOT[0], ys - MAIZ_PIVOT[1]) - 60) / 180.0, 0, 1)
    w = rigid_with_falloff(leaf, 16) * (ramp * ramp * (3 - 2 * ramp)) * soften(z, 8)
    tx, ty = field_rotate(size, w, MAIZ_PIVOT)
    svg.warp(tx, ty, [0, 0.09, 0, -0.045, 0], '3.4s')
    return svg.render(_out(n))
