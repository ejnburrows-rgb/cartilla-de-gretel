"""Lesson 1 redrawn pictures (2026-10-17 art, PR #888).

carro:    the painted white dots on both wheels travel round the tyre, so the wheels
          turn; car body, hubs and glass stay still. The dots turn in the wheel's own
          tilted plane (an ellipse on screen). The tyre under the dots is filled from
          its own surrounding paint so a dot never leaves a hole. One loop = one dot
          spacing (45 degrees), so it repeats without a jump on the front wheel; the
          rear wheel has one dot hidden by its far edge, which stays hidden.
escoba:   the bristle fan below the lowest binding sways a little, more toward the
          tips. Handle and bindings stay still.
uniforme: still. The jacket and trousers are stiff, flat shapes with no loose edge.
Coordinates are pixels of each new still.
"""
import os, sys, math, io, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from PIL import Image
from lib import load, soft_mask, grid, field_rotate
from wb_vowels import OriginalSvg, _out
from redrawn_common import color_mask, grow, close, soften, solid, rigid_with_falloff

# ---------- CARRO (1448x1086) ----------
CARRO_WHEELS = [(740, 580, 990, 935), (1180, 420, 1390, 760)]
CARRO_DOT_STEP = 45.0   # degrees between painted dots (measured: 8 dots, ~45 deg apart)
CARRO_LOOP = '1.1s'

def _png_uri(im):
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()

def _webp_image(im, x, y, cls=''):
    """Small cut-outs as WebP (with alpha) to keep the motion file light."""
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=90, method=6)
    uri = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    c = f' class="{cls}"' if cls else ''
    return f'<image{c} x="{x}" y="{y}" width="{im.width}" height="{im.height}" href="{uri}"/>'

def leccion_1_carro():
    n = 'leccion-1-carro'; base = load(n); svg = OriginalSvg(n, base)
    rgb = np.array(base.convert('RGB')); a = rgb.astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    H, W = r.shape
    css = []
    for i, (x0, y0, x1, y1) in enumerate(CARRO_WHEELS):
        Z = np.zeros((H, W), bool); Z[y0:y1, x0:x1] = True
        navy = Z & (b > r + 25) & (r + g + b < 330)
        tyre = close(navy, 20)
        white = Z & (r + g + b > 620) & tyre
        cnt, lab, st, cen = cv2.connectedComponentsWithStats(white.astype(np.uint8))
        keep = [k for k in range(1, cnt) if st[k, 4] > 150]
        dots = np.isin(lab, keep)
        (cx, cy), (w, h), ang = cv2.fitEllipse(np.array([cen[k] for k in keep], np.float32))
        k_ = h / w
        dots_g = grow(dots, 4) & tyre
        # tyre paint under the dots, filled from the surrounding tyre
        clean = cv2.inpaint(rgb, (grow(dots, 6) & tyre).astype(np.uint8) * 255, 7, cv2.INPAINT_TELEA)
        patch = np.dstack([clean, (grow(dots, 6) & tyre).astype(np.uint8) * 255])
        ys, xs = np.nonzero(patch[..., 3]); px0, py0 = xs.min(), ys.min()
        pim = Image.fromarray(np.ascontiguousarray(patch[py0:ys.max() + 1, px0:xs.max() + 1]), 'RGBA')
        svg.over.append(_webp_image(pim, int(px0), int(py0), cls='ov'))
        # the dots themselves, turning in the wheel plane, shown only on the tyre
        dl = np.dstack([rgb, soften(dots_g, 1.0).clip(0, 1).__mul__(255).astype(np.uint8)])
        ys, xs = np.nonzero(dl[..., 3]); dx0, dy0 = xs.min(), ys.min()
        dim = Image.fromarray(np.ascontiguousarray(dl[dy0:ys.max() + 1, dx0:xs.max() + 1]), 'RGBA')
        tm = (soften(tyre & ~grow(np.zeros_like(tyre), 0), 1.0) * 255).astype(np.uint8)[y0:y1, x0:x1]
        mim = Image.fromarray(tm, 'L')
        def tf(t):
            return (f'translate({cx:.2f}px,{cy:.2f}px) rotate({ang:.3f}deg) scale(1,{k_:.5f}) rotate({t}deg) '
                    f'scale(1,{1 / k_:.5f}) rotate({-ang:.3f}deg) translate({-cx:.2f}px,{-cy:.2f}px)')
        css.append(f'@keyframes wheel{i}{{from{{transform:{tf(0)}}}to{{transform:{tf(-CARRO_DOT_STEP)}}}}}')
        svg.over.append(f'<mask id="tyre{i}" maskUnits="userSpaceOnUse" x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}">'
                        f'<image x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" href="{_png_uri(mim)}"/></mask>'
                        f'<g class="ov" mask="url(#tyre{i})"><g style="transform-origin:0 0;animation:wheel{i} {CARRO_LOOP} linear infinite">'
                        f'{_webp_image(dim, int(dx0), int(dy0))}</g></g>')
    svg.css.extend(css)
    return svg.render(_out(n))

# ---------- ESCOBA (1122x1402) ----------
ESC_FAN_ZONE = [(560, 770), (700, 770), (720, 1000), (640, 1330), (420, 1340), (150, 1170), (150, 1050), (330, 840)]
ESC_PIVOT = (640, 765)

def vocal_e_escoba():
    n = 'vocal-e-escoba'; base = load(n); size = base.size; svg = OriginalSvg(n, base); svg.MAP_DIV = 2
    xs, ys = grid(size)
    z = soft_mask(size, [('poly', ESC_FAN_ZONE)], 0) > .5
    ink = color_mask(base, lambda r, g, b: (r + g + b) < 640)
    fan = grow(solid(close(ink & z, 6), 5000), 6) & z
    ramp = np.clip((ys - 820) / 300.0, 0, 1)
    w = rigid_with_falloff(fan, 22) * (ramp * ramp * (3 - 2 * ramp)) * soften(z, 10)
    tx, ty = field_rotate(size, w, ESC_PIVOT)
    svg.warp(tx, ty, [0, 0.035, 0, -0.03, 0], '3.2s')
    return svg.render(_out(n))
