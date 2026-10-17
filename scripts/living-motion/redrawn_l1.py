"""Motion measured on the ORIGINAL current-main stills, not the rejected redraws.

The yellow P-511 car's existing blue/white spokes turn gently within their
original wheel planes.  The front wheel is source-cropped, so this is a small
reversible turn, not an invented reconstruction of its missing lower half.
The broom moves only its drawn bristle fan, anchored below the last binding.
All complete source stills are embedded byte-for-byte; reduced motion is static.
"""
import base64
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import cv2
from PIL import Image
from lib import load, soft_mask, grid, field_rotate
from wb_vowels import OriginalSvg, _out
from redrawn_common import color_mask, close, solid, grow, rigid_with_falloff


def _png_uri(im):
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


class LocalPartSvg(OriginalSvg):
    """Composite only the selected moving part; stationary source stays exact.

    A source-alpha-aware activity matte selects the displacement result. The
    complementary original and moving layers are added (not alpha-over twice),
    avoiding transparent seams at the selection edges. No image-wide motion.
    """
    MAP_DIV = 1

    def __init__(self, name, base, window):
        super().__init__(name, base)
        self.window = window
        self.activity = np.zeros((base.height, base.width), np.float32)

    def warp(self, vx, vy, *args, **kwargs):
        active = ((np.abs(vx) + np.abs(vy)) > .02).astype(np.float32)
        # Include transparent clearance so a real silhouette can move into it;
        # no transparent RGB is classified as artwork or used as paint.
        active = cv2.GaussianBlur(active, (0, 0), 2.0)
        x, y, w, h = self.window
        region = np.zeros_like(active)
        region[y:y+h, x:x+w] = 1
        self.activity = np.maximum(self.activity, active * region)
        return super().warp(vx, vy, *args, **kwargs)

    def render(self, path):
        W, H = self.W, self.H
        matte = np.full((H, W, 4), 255, np.uint8)
        matte[..., 3] = np.round(self.activity * 255).astype(np.uint8)
        defs = [f'<filter id="part-warp" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" '
                f'x="0" y="0" width="{W}" height="{H}" color-interpolation-filters="sRGB">']
        prev = 'SourceGraphic'
        for i, (uri, vals, dur, kt, ks, begin) in enumerate(self.fx):
            defs.append(f'<feImage href="{uri}" x="0" y="0" width="{W}" height="{H}" preserveAspectRatio="none" result="m{i}"/>')
            spline = f' calcMode="spline" keySplines="{ks}"' if ks else ''
            defs.append(f'<feDisplacementMap in="{prev}" in2="m{i}" xChannelSelector="R" yChannelSelector="G" scale="0" result="d{i}">'
                        f'<animate attributeName="scale" values="{vals}" keyTimes="{kt}" dur="{dur}" begin="{begin}" repeatCount="indefinite"{spline}/>'
                        '</feDisplacementMap>')
            prev = f'd{i}'
        defs.extend([f'<feImage href="{_png_uri(Image.fromarray(matte))}" x="0" y="0" width="{W}" height="{H}" preserveAspectRatio="none" result="selection"/>',
                     f'<feComposite in="{prev}" in2="selection" operator="in" result="moving"/>',
                     '<feComposite in="SourceGraphic" in2="selection" operator="out" result="stationary"/>',
                     '<feComposite in="stationary" in2="moving" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>',
                     '</filter>'])
        text = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet">\n'
                '<style>.part-motion{filter:url(#part-warp)}@media(prefers-reduced-motion:reduce){.part-motion{filter:none}}</style>\n'
                '<defs>' + ''.join(defs) + '</defs>\n'
                f'<image class="part-motion" width="{W}" height="{H}" href="{self.base_uri}"/>\n</svg>')
        with open(path, 'w') as out:
            out.write(text)
        return len(text)


# ORIGINAL 870 x 597 yellow vintage P-511. Centers read from its blue spokes.
# (cx, cy, rx, ry, crop, visible-mask bottom): no rejected 1448px car coordinates.
CARRO_WHEELS = [
    (126.0, 444.0, 31.0, 48.0, (81, 380, 173, 511), 508),
    (467.0, 568.0, 43.0, 61.0, (405, 493, 530, 597), 558),
]


def leccion_1_carro():
    n = 'leccion-1-carro'
    base = load(n)
    assert base.size == (870, 597), 'Re-measure masks if the approved source changes'
    svg = OriginalSvg(n, base)
    xs, ys = grid(base.size)
    for i, (cx, cy, rx, ry, crop, bottom) in enumerate(CARRO_WHEELS):
        # An opaque source-pixel disc covers the original spokes. Feather only
        # within the blue painted rim, never the tire, fender or background.
        radius = np.sqrt(((xs - cx) / rx) ** 2 + ((ys - cy) / ry) ** 2)
        alpha = np.clip((1.0 - radius) / .065, 0, 1)
        if i == 1:
            # Original front wheel is cut off. Keep the bottom extraction/crop
            # untouched and never rotate nonexistent pixels into view.
            alpha *= np.clip((bottom - ys) / 10.0, 0, 1)
        mask = Image.fromarray(np.round(alpha * 255).astype(np.uint8), 'L')
        x0, y0, x1, y1 = crop
        mask = mask.crop(crop)
        part = base.crop(crop)
        k = ry / rx

        def transform(angle):
            return (f'translate({cx}px,{cy}px) scale(1,{k:.7f}) rotate({angle}deg) '
                    f'scale(1,{1/k:.7f}) translate({-cx}px,{-cy}px)')

        svg.css.append(f'@keyframes spokes{i}{{0%,100%{{transform:{transform(0)}}}'
                       f'25%{{transform:{transform(-7)}}}75%{{transform:{transform(7)}}}}}')
        svg.over.append(f'<mask id="spokes-mask{i}" maskUnits="userSpaceOnUse" x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}">'
                        f'<image x="{x0}" y="{y0}" width="{part.width}" height="{part.height}" href="{_png_uri(mask)}"/></mask>'
                        f'<g class="ov" mask="url(#spokes-mask{i})"><g style="transform-origin:0 0;animation:spokes{i} 2.8s ease-in-out infinite">'
                        f'<image x="{x0}" y="{y0}" width="{part.width}" height="{part.height}" href="{_png_uri(part)}"/></g></g>')
    return svg.render(_out(n))


# ORIGINAL 556 x 700: lower binding at (183,405); fan ends near (378,597).
# The handle, all bindings, scene border and horizon remain outside the field.
ESC_FAN_ZONE = [(158, 420), (191, 409), (226, 425), (263, 458),
                (301, 513), (335, 566), (383, 590), (351, 615),
                (305, 647), (240, 681), (194, 674), (164, 628),
                (145, 552), (144, 472)]
ESC_PIVOT = (180, 414)


def vocal_e_escoba():
    n = 'vocal-e-escoba'
    base = load(n)
    assert base.size == (556, 700), 'Re-measure masks if the approved source changes'
    svg = LocalPartSvg(n, base, (129, 410, 268, 280))
    xs, ys = grid(base.size)
    zone = soft_mask(base.size, [('poly', ESC_FAN_ZONE)], 0) > .5
    # Source yellow is warm (R/G >= .96); the lime/teal scene is not.
    # Parent helper excludes alpha==0. Close/fill the yellow fan, then include
    # its real black outline; only a 6px sampling margin reaches the backdrop.
    yellow = color_mask(base, lambda r, g, b: (r > g * .96) & (g > b + 28) & (r > 140)) & zone
    fan = grow(solid(close(yellow, 3), 3000), 4) & zone
    ramp = np.clip((ys - 427) / 205.0, 0, 1)
    weight = rigid_with_falloff(fan, 6) * ramp * ramp * (3 - 2 * ramp)
    vx, vy = field_rotate(base.size, weight, ESC_PIVOT)
    svg.warp(vx, vy, [0, .012, 0, -.012, 0], '3.6s')
    return svg.render(_out(n))
